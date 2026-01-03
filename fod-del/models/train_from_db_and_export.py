import os
import io
import pickle
from zipfile import ZipFile, ZIP_DEFLATED
from datetime import datetime

import pandas as pd
import numpy as np
from sqlalchemy import create_engine

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import roc_auc_score


# ===================== CONFIG =====================
DB_URL = os.environ.get(
    "DB_URL",
    "mysql+pymysql://root:123456789@localhost:3306/dataforml"
)

# fallback CSV – dùng chung file với app/kmeans
CSV_FALLBACK = os.path.join(
    os.path.dirname(__file__),
    "FoodDelivery_Churn_Minimal_fixed.csv"
)

TARGET = "Churn_food"
LEAKAGE_COLS = ["Churn", "customerID", TARGET]
TEST_SIZE = 0.2
RANDOM_STATE = 42
STRATIFY = True

# THƯ MỤC LƯU ZIP = cùng folder với app.py (vì app.py cũng nằm trong fod-del/models)
OUT_ZIP_DIR = os.path.dirname(__file__)

# đường dẫn export SQL/CSV cho bảng churn_cus
EXPORT_SQL_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "database", "churn_cus.sql")
)
TABLE_NAME_OUT = "churn_cus"

# bảng nguồn trong DB để train
TABLE_SOURCE = "churn_prediction"
# ==================================================


def _read_csv_smart(path: str) -> pd.DataFrame:
    """
    Đọc CSV thử nhiều delimiter (hỗ trợ ; , tab, |).
    Dùng giống train_and_save.py để fallback OK.
    """
    content = open(path, "rb").read()
    for sep in [";", ",", "\t", "|"]:
        try:
            df = pd.read_csv(pd.io.common.BytesIO(content), sep=sep)
            if isinstance(df, pd.DataFrame) and df.shape[1] >= 2:
                return df
        except Exception:
            pass
    return pd.read_csv(pd.io.common.BytesIO(content), sep=",")


def read_db_table(engine, table_name: str) -> pd.DataFrame | None:
    try:
        df = pd.read_sql(f"SELECT * FROM {table_name}", engine)
        df = df.replace({pd.NA: np.nan})
        df = df.infer_objects(copy=False)
        print(f"Loaded {len(df)} rows from DB table '{table_name}'")
        return df
    except Exception as e:
        print(f"Warning: cannot read table {table_name}: {e}")
        return None


def _prepare_df(df: pd.DataFrame):
    # Ensure target exists
    if TARGET not in df.columns:
        raise ValueError(f"Target column '{TARGET}' not found in data")

    # Remove leakage (keep copy)
    feature_cols = [c for c in df.columns if c not in LEAKAGE_COLS]
    X = df[feature_cols].copy()
    y = df[TARGET].astype(int).copy()

    cat_cols = X.select_dtypes(include=[object, "category"]).columns.tolist()
    num_cols = X.select_dtypes(include=[np.number, "bool"]).columns.tolist()
    required_cols = num_cols + cat_cols  # thứ tự ổn định

    print(f"[PREP] num_cols={len(num_cols)}, cat_cols={len(cat_cols)}, "
          f"required_cols={len(required_cols)}")
    return X, y, required_cols, num_cols, cat_cols


def build_pipelines(num_cols, cat_cols):
    prep_logit = ColumnTransformer([
        ("num", Pipeline([
            ("imp", SimpleImputer(strategy="median")),
            ("sc", StandardScaler())
        ]), num_cols),
        ("cat", Pipeline([
            ("imp", SimpleImputer(missing_values=pd.NA, strategy="most_frequent")),
            ("oh", OneHotEncoder(handle_unknown="ignore"))
        ]), cat_cols),
    ])

    prep_tree = ColumnTransformer([
        ("num", SimpleImputer(strategy="median"), num_cols),
        ("cat", Pipeline([
            ("imp", SimpleImputer(missing_values=pd.NA, strategy="most_frequent")),
            ("oh", OneHotEncoder(handle_unknown="ignore"))
        ]), cat_cols),
    ])

    logit = Pipeline([
        ("prep", prep_logit),
        ("clf", LogisticRegression(max_iter=3000, class_weight="balanced"))
    ])

    rf = Pipeline([
        ("prep", prep_tree),
        ("clf", RandomForestClassifier(
            n_estimators=400,
            random_state=RANDOM_STATE,
            n_jobs=-1,
            class_weight="balanced_subsample"
        ))
    ])

    try:
        from xgboost import XGBClassifier
        xgb = Pipeline([
            ("prep", prep_tree),
            ("clf", XGBClassifier(
                n_estimators=500,
                learning_rate=0.05,
                max_depth=6,
                subsample=0.8,
                colsample_bytree=0.8,
                reg_lambda=1.0,
                eval_metric="logloss",
                tree_method="hist",
                random_state=RANDOM_STATE
            ))
        ])
        xgb_name = "xgboost"
    except Exception:
        xgb = Pipeline([
            ("prep", prep_tree),
            ("clf", GradientBoostingClassifier(random_state=RANDOM_STATE))
        ])
        xgb_name = "gradientboosting"

    supervised_models = {
        "logistic_regression": logit,
        "random_forest": rf,
        xgb_name: xgb,
    }

    # (Tùy chọn) nếu đặt TRAIN_MODEL thì chỉ train một model phân loại
    train_model = os.environ.get("TRAIN_MODEL")
    if train_model:
        train_model = str(train_model).strip()
        if train_model in supervised_models:
            supervised_models = {train_model: supervised_models[train_model]}
        else:
            print(
                f"Warning: TRAIN_MODEL={train_model} not recognized; "
                f"training all models."
            )

    print(f"[BUILD] Supervised models: {list(supervised_models.keys())}")
    return supervised_models


def train_and_save_bundles(
    Xtr, Xte, ytr, yte,
    supervised_models,
    required_cols, num_cols, cat_cols
):
    """
    Train tất cả model phân loại + kmeans và ghi 1 file ZIP
    với format đúng như app.py đang expect.
    """
    best_auc = -1.0
    best_name = None
    bundles = {}

    # ---- Supervised models ----
    for name, pipe in supervised_models.items():
        print(f"\n====== Train: {name} ======")
        pipe.fit(Xtr, ytr)
        proba = pipe.predict_proba(Xte)[:, 1]
        auc = roc_auc_score(yte, proba)
        print(f"AUC: {auc:.4f}")

        bundle = {
            "pipe": pipe,
            "target": TARGET,
            "required_input_columns": required_cols,
            "numeric_columns": num_cols,
            "categorical_columns": cat_cols,
            "created_at": datetime.now().strftime("%Y%m%d_%H%M%S"),
            "model_name": name,
        }
        bundles[name] = bundle

        if auc > best_auc:
            best_auc = auc
            best_name = name

    # ---- KMeans (unsupervised) ----
     
    print("\n====== Train: kmeans (unsupervised) ======")
    kmeans_pipe = Pipeline([
        ("prep", ColumnTransformer([
            ("num", SimpleImputer(strategy="median"), num_cols),
            ("cat", Pipeline([
                ("imp", SimpleImputer(
                    missing_values=pd.NA,
                    strategy="most_frequent"
                )),
                ("oh", OneHotEncoder(handle_unknown="ignore"))
            ]), cat_cols),
        ])),
        ("kmeans", KMeans(
            n_clusters=3,              # 3 cụm cho k-chart
            random_state=RANDOM_STATE,
            n_init=10
        ))
    ])

    # dùng full train+test để học cụm
    X_all = pd.concat([Xtr, Xte], axis=0)
    y_all = pd.concat([ytr, yte], axis=0)
    kmeans_pipe.fit(X_all)

    # 🔁 Chuẩn hoá nhãn cluster:
    #    0 = low churn, 1 = medium, 2 = high
    labels_all = kmeans_pipe.predict(X_all)
    labels_all = np.asarray(labels_all)

    cluster_stats = []
    for cid in range(kmeans_pipe.named_steps["kmeans"].n_clusters):
        mask = (labels_all == cid)
        if mask.sum() == 0:
            avg_churn = 0.0
        else:
            avg_churn = float(y_all[mask].mean())
        cluster_stats.append((cid, avg_churn))

    # sắp xếp theo churn tăng dần → 0 low, 1 medium, 2 high
    cluster_stats_sorted = sorted(cluster_stats, key=lambda x: x[1])
    order = [cid for cid, _ in cluster_stats_sorted]  # ví dụ [2,0,1]

    kmeans = kmeans_pipe.named_steps["kmeans"]
    old_centers = kmeans.cluster_centers_.copy()
    kmeans.cluster_centers_ = old_centers[order]

    # cập nhật labels_ cho đẹp (không bắt buộc, nhưng nên có)
    if hasattr(kmeans, "labels_"):
        kmeans.labels_ = np.take(order, kmeans.labels_)

    # lưu thêm mapping vào bundle (nếu sau này muốn xài ở app)
    cluster_order_meta = {
        "low": int(order[0]),
        "medium": int(order[1]),
        "high": int(order[2]),
    }

    bundles["kmeans"] = {
        "pipe": kmeans_pipe,
        "target": None,
        "required_input_columns": required_cols,
        "numeric_columns": num_cols,
        "categorical_columns": cat_cols,
        "created_at": datetime.now().strftime("%Y%m%d_%H%M%S"),
        "model_name": "kmeans",
        "cluster_order": cluster_order_meta,   # metadata thêm
    }


    # ---- Ghi 1 file ZIP chứa tất cả bundle ----
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    zip_name = f"churn_models_{ts}.zip"
    zip_path = os.path.join(OUT_ZIP_DIR, zip_name)

    with ZipFile(zip_path, mode="w", compression=ZIP_DEFLATED) as zf:
        for name, bundle in bundles.items():
            data = pickle.dumps(bundle)
            zf.writestr(f"models/{name}.pkl", data)
        zf.writestr("meta/best_model.txt", best_name or "")
        zf.writestr("meta/created_at.txt", ts)
        zf.writestr("meta/target.txt", TARGET)
        zf.writestr("meta/required_columns.txt", "\n".join(required_cols))

    print(f"[SAVED] Multi-model ZIP: {zip_path}")
    print(f"[INFO] Best supervised model: {best_name}  AUC={best_auc:.4f}")
    return bundles, best_name, zip_path


def risk_bucket_binary(p, pred):
    # pred = 0 → luôn low
    if int(pred) == 0:
        return "low"
    # pred = 1
    if p >= 0.75:
        return "high"
    if p >= 0.5:
        return "medium"
    return "low"

def risk_level(p, pred):
    if int(pred) == 0:
        return 0
    if p >= 0.75:
        return 2
    if p >= 0.5:
        return 1
    return 0



def export_churn_cus(
    engine,
    df_in: pd.DataFrame,
    pipe,
    model_name: str,
    zip_path: str,
    table_name: str = None,
    sql_path: str = None,
    csv_path: str = None,
):
    """
    Export churn predictions ra:
      - 1 bảng trong DB (MySQL)
      - 1 file .sql (CREATE + INSERT)
      - 1 file .csv

    Giờ bổ sung luôn:
      - risk_level (0/1/2 như KMeans)
    """
    # 1) Predict probabilities trên full df
    proba = pipe.predict_proba(df_in)[:, 1]
    pred = (proba >= 0.5).astype(int)

    out = df_in.copy()
    if "customerID" in out.columns:
        cust = out["customerID"].copy()
    else:
        cust = pd.Series(range(1, len(out) + 1), name="customerID")

    # 2) Tạo bảng kết quả đầy đủ
    result = pd.DataFrame({
        "customerID": cust,
        "probability": proba,
        "prediction": pred,
        "risk_bucket": [
            risk_bucket_binary(float(p), int(y))
            for p, y in zip(proba, pred)
        ],
        "risk_level": [
            risk_level(float(p), int(y))   # ⭐ ADD MỚI
            for p, y in zip(proba, pred)
        ],
        "model_name": model_name,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    })

    # 3) Tên bảng/file
    table = table_name or TABLE_NAME_OUT

    export_mode = os.environ.get("EXPORT_MODE", "append").lower()
    if export_mode not in {"append", "replace"}:
        export_mode = "append"

    # 4) Ghi vào MySQL
    try:
        result.to_sql(table, engine, if_exists=export_mode, index=False)
        print(f"Wrote {len(result)} rows to DB table '{table}' (mode={export_mode})")
    except Exception as e:
        print(f"Failed to write table to DB: {e}")

    # 5) Xuất file SQL
    if sql_path is None:
        base_dir = os.path.dirname(EXPORT_SQL_PATH)
        os.makedirs(base_dir, exist_ok=True)
        if table == TABLE_NAME_OUT:
            sql_path = EXPORT_SQL_PATH
        else:
            sql_path = os.path.join(base_dir, f"{table}.sql")

    try:
        if export_mode == "replace" or not os.path.exists(sql_path):
            mode = "w"
        else:
            mode = "a"

        with open(sql_path, mode, encoding="utf-8") as f:
            if mode == "w":
                f.write(f"-- Dumped churn cus predictions (start) model={model_name}\n")
                f.write(f"CREATE TABLE IF NOT EXISTS {table} (\n")
                f.write("  customerID TEXT,\n")
                f.write("  probability DOUBLE,\n")
                f.write("  prediction INT,\n")
                f.write("  risk_bucket TEXT,\n")
                f.write("  risk_level INT,\n")  # ⭐ ADD MỚI
                f.write("  model_name TEXT,\n")
                f.write("  created_at TEXT\n")
                f.write(");\n\n")

            # INSERT rows
            for _, row in result.iterrows():
                cid = str(row["customerID"]).replace("'", "''")
                prob = float(row["probability"])
                predv = int(row["prediction"])
                rb = str(row["risk_bucket"]).replace("'", "''")
                rl = int(row["risk_level"])
                mn = str(row["model_name"]).replace("'", "''")
                ca = str(row["created_at"]).replace("'", "''")

                f.write(
                    f"INSERT INTO {table} "
                    f"(customerID, probability, prediction, risk_bucket, risk_level, model_name, created_at) "
                    f"VALUES ('{cid}', {prob}, {predv}, '{rb}', {rl}, '{mn}', '{ca}');\n"
                )

        print(f"Exported SQL to: {sql_path}")

    except Exception as e:
        print(f"Failed to export SQL: {e}")

    # 6) Xuất CSV
    if csv_path is None:
        if table == TABLE_NAME_OUT:
            csv_path = os.path.join(OUT_ZIP_DIR, "churn_cus.csv")
        else:
            csv_path = os.path.join(OUT_ZIP_DIR, f"{table}.csv")

    try:
        if table == TABLE_NAME_OUT and export_mode == "append" and os.path.exists(csv_path):
            # nối thêm nếu append
            result.to_csv(csv_path, mode="a", header=False, index=False)
        else:
            result.to_csv(csv_path, index=False)

        print(f"Exported CSV to: {csv_path}")

    except Exception as e:
        print(f"Failed to export CSV: {e}")

    return csv_path


def main(model_choice: str = None):
    """
    Train models (optionally only a single model by name) and export predictions.
    Được app.py gọi từ endpoint /train_and_export.

    Trả về:
      {
        zip_path, csv_path, rows_written,
        best_name, chosen_name, trained_models
      }
    """
    print(f"[TRAIN] Starting training; requested model_choice={model_choice!r}")
    engine = create_engine(DB_URL)

    df = read_db_table(engine, TABLE_SOURCE)
    if df is None:
        # fallback CSV giống train_and_save.py
        if os.path.exists(CSV_FALLBACK):
            print(f"Falling back to CSV: {CSV_FALLBACK}")
            df = _read_csv_smart(CSV_FALLBACK)
        else:
            print("No data available to train. Exiting.")
            return {"error": "no_data"}

    # ----- chuẩn bị dữ liệu -----
    X, y, required_cols, num_cols, cat_cols = _prepare_df(df)

    # ----- train / test split -----
    Xtr, Xte, ytr, yte = train_test_split(
        X, y,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=y if STRATIFY else None,
    )

    # ----- build model pipelines -----
    supervised_models = build_pipelines(num_cols, cat_cols)
    print(f"[TRAIN] Available supervised model keys: {list(supervised_models.keys())}")

    # Nếu có request 1 model cụ thể thì chỉ train model đó
    if model_choice:
        model_choice = str(model_choice)
        if model_choice in supervised_models:
            supervised_models = {model_choice: supervised_models[model_choice]}
        else:
            print(
                f"Requested model '{model_choice}' not in available trainers. "
                f"Ignoring and training all."
            )

    # ----- Train & save all bundles (logit, rf, xgb, kmeans) -----
    bundles, best_name, zip_path = train_and_save_bundles(
        Xtr, Xte, ytr, yte,
        supervised_models,
        required_cols, num_cols, cat_cols,
    )
    print(f"[TRAIN] Bundles trained: {list(bundles.keys())}; best_name={best_name}")

    trained_models = list(bundles.keys())

    # Model chọn để hiển thị status (nếu user chọn 1 model cụ thể)
    if model_choice and model_choice in bundles:
        chosen_name = model_choice
    else:
        chosen_name = best_name

    # Chuẩn hoá X_full theo required_cols cho export chung churn_cus
    X_full = (
        X[required_cols]
        if set(required_cols).issubset(set(X.columns))
        else X.copy()
    )

    # ----- Export predictions cho TẤT CẢ các model phân loại (trừ kmeans) -----
    original_export_mode = os.environ.get("EXPORT_MODE", None)

    first = True
    for name, bundle in bundles.items():
        if name == "kmeans":
            # kmeans không có predict_proba
            continue

        pipe = bundle["pipe"]

        # model đầu tiên: replace; các model sau: append
        if first:
            os.environ["EXPORT_MODE"] = "replace"
            first = False
        else:
            os.environ["EXPORT_MODE"] = "append"

        print(f"[EXPORT] Writing predictions for model: {name}")
        export_churn_cus(engine, X_full, pipe, name, zip_path)

    # restore EXPORT_MODE
    if original_export_mode is not None:
        os.environ["EXPORT_MODE"] = original_export_mode
    else:
        os.environ.pop("EXPORT_MODE", None)

    # ----- Thông tin CSV xuất ra (chung, chứa cả 3 model) -----
    out_csv_path = os.path.join(OUT_ZIP_DIR, "churn_cus.csv")
    rows_written = 0
    try:
        if os.path.exists(out_csv_path):
            with open(out_csv_path, "r", encoding="utf-8") as f:
                rows_written = sum(1 for _ in f) - 1  # trừ header
    except Exception:
        rows_written = 0

    return {
        "zip_path": zip_path,
        "csv_path": out_csv_path,
        "rows_written": rows_written,
        "best_name": best_name,
        "chosen_name": chosen_name,
        "trained_models": trained_models,
    }


if __name__ == "__main__":
    main()
