import os
import io
import pickle
from datetime import datetime
from zipfile import ZipFile, ZIP_DEFLATED

import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import classification_report, roc_auc_score

# ===================== CONFIG =====================
CSV_PATH = os.path.join(os.path.dirname(__file__), "FoodDelivery_Churn_Minimal_fixed.csv")
TARGET = "Churn_food"
LEAKAGE_COLS = ["Churn", "customerID", TARGET]
TEST_SIZE = 0.2
RANDOM_STATE = 42
STRATIFY = True
# ==================================================


def _read_csv_smart(path: str) -> pd.DataFrame:
    """Đọc CSV thử nhiều delimiter (hỗ trợ cả ; , tab, |)."""
    content = open(path, "rb").read()
    for sep in [";", ",", "\t", "|"]:
        try:
            df = pd.read_csv(pd.io.common.BytesIO(content), sep=sep)
            if isinstance(df, pd.DataFrame) and df.shape[1] >= 2:
                return df
        except Exception:
            pass
    return pd.read_csv(pd.io.common.BytesIO(content), sep=",")


def main():
    # ----- 0) Read -----
    df = _read_csv_smart(CSV_PATH)
    assert TARGET in df.columns, f"Không thấy cột target '{TARGET}' trong CSV!"

    # ----- 1) Features/Target -----
    feature_cols = [c for c in df.columns if c not in LEAKAGE_COLS]
    X = df[feature_cols].copy()
    y = df[TARGET].astype(int).copy()

    # ----- 2) Column types -----
    cat_cols = X.select_dtypes(include=["object", "category"]).columns.tolist()
    num_cols = X.select_dtypes(include=[np.number, "bool"]).columns.tolist()
    required_cols = num_cols + cat_cols  # giữ thứ tự ổn định

    # ----- 3) Preprocess -----
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

    # ----- 4) Split -----
    Xtr, Xte, ytr, yte = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE,
        stratify=y if STRATIFY else None
    )
    print(f"[INFO] Training on {len(Xtr)} rows; testing on {len(Xte)} rows.")

    # ----- 5) Supervised models (phân loại churn) -----
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
                n_estimators=500, learning_rate=0.05, max_depth=6,
                subsample=0.8, colsample_bytree=0.8, reg_lambda=1.0,
                eval_metric="logloss", tree_method="hist", random_state=RANDOM_STATE
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

    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_dir = os.path.dirname(__file__)

    best_auc = -1.0
    best_name = None
    bundles = {}

    # ----- 6) Train/Eval supervised, collect bundles -----
    for name, pipe in supervised_models.items():
        print(f"\n====== Train: {name} ======")
        pipe.fit(Xtr, ytr)

        proba = pipe.predict_proba(Xte)[:, 1]
        pred = (proba >= 0.5).astype(int)
        auc = roc_auc_score(yte, proba)
        print(f"AUC: {auc:.4f}")
        print(classification_report(yte, pred, digits=4))

        bundle = {
            "pipe": pipe,
            "target": TARGET,
            "required_input_columns": required_cols,
            "numeric_columns": num_cols,
            "categorical_columns": cat_cols,
            "created_at": ts,
            "model_name": name,
        }
        bundles[name] = bundle

        if auc > best_auc:
            best_auc = auc
            best_name = name

    # ----- 7) Train KMeans (unsupervised) -----
    print("\n====== Train: kmeans (unsupervised) ======")
    kmeans_pipe = Pipeline([
        ("prep", prep_tree),
        ("kmeans", KMeans(n_clusters=2, random_state=RANDOM_STATE, n_init=10))
    ])
    kmeans_pipe.fit(X)  # dùng toàn bộ dữ liệu để phân cụm

    kmeans_bundle = {
        "pipe": kmeans_pipe,
        "target": None,
        "required_input_columns": required_cols,
        "numeric_columns": num_cols,
        "categorical_columns": cat_cols,
        "created_at": ts,
        "model_name": "kmeans",
    }
    bundles["kmeans"] = kmeans_bundle

    # ----- 8) WRITE ONE ZIP with all models -----
    zip_name = f"churn_models_{ts}.zip"
    zip_path = os.path.join(out_dir, zip_name)

    with ZipFile(zip_path, mode="w", compression=ZIP_DEFLATED) as zf:
        for name, bundle in bundles.items():
            data = pickle.dumps(bundle)
            zf.writestr(f"models/{name}.pkl", data)

        zf.writestr("meta/best_model.txt", best_name or "")
        zf.writestr("meta/created_at.txt", ts)
        zf.writestr("meta/target.txt", TARGET)
        zf.writestr("meta/required_columns.txt", "\n".join(required_cols))

    print(f"\n[SAVED] Multi-model ZIP: {zip_path}")
    print(f"[INFO] Best supervised model: {best_name}  AUC={best_auc:.4f}")


if __name__ == "__main__":
    main()
