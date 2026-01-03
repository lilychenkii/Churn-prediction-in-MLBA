import io
import os
import glob
import pickle
import warnings
from zipfile import ZipFile, is_zipfile

import numpy as np
import pandas as pd
from flask import Flask, jsonify, request, Response, render_template, send_from_directory
from flask_cors import CORS
from threading import Thread
from datetime import datetime
from sqlalchemy import create_engine

# optional: import the trainer module (script added earlier)
try:
    import train_from_db_and_export as trainer
except Exception:
    trainer = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, "..", ".."))
FOD_DEL_ROOT = os.path.join(PROJECT_ROOT, "fod-del")
BACK_END_ROOT = os.path.join(PROJECT_ROOT, "back_end")


warnings.simplefilter("ignore", FutureWarning)

# ===================== CONFIG =====================
HOST = "0.0.0.0"
PORT = 5000
DEBUG = True

MODEL_ZIP_PATH = None  # để None cho auto-pick zip mới nhất
TARGET = "Churn_food"
# ==================================================

app = Flask(__name__, template_folder=os.path.join(BASE_DIR, "templates"))

CORS(app)

_loaded = {
    "zip_path": None,
    "available_models": [],
    "best_in_zip": None,
    "bundle": None,
    "pipe": None,
    "meta": {},
    "required_cols": [],
    "num_cols": [],
    "cat_cols": [],
    "target": None,
    "model_name": None
}

# Training job status (in-memory). keys: status ('idle'|'running'|'done'|'error'), started, finished, message
_training_job = {"status": "idle", "started": None, "finished": None, "message": None}

# ---------------- Utils: tìm zip mới nhất ----------------
def _autopick_latest_zip() -> str:
    here = os.path.dirname(os.path.abspath(__file__))

    candidates = glob.glob(os.path.join(here, "churn_models_*.zip"))
    models_dir = os.path.join(here, "models")
    if os.path.isdir(models_dir):
        candidates += glob.glob(os.path.join(models_dir, "churn_models_*.zip"))

    if not candidates:
        return None

    candidates.sort(key=lambda p: os.path.getmtime(p), reverse=True)
    return candidates[0]

# ---------------- Utils: đọc models trong zip ----------------
def _list_models_in_zip(zip_path: str):
    if not is_zipfile(zip_path):
        raise ValueError(f"{zip_path} không phải file zip.")
    with ZipFile(zip_path, "r") as zf:
        names = zf.namelist()
        models = [
            n.split("/")[-1].replace(".pkl", "")
            for n in names
            if n.startswith("models/") and n.endswith(".pkl")
        ]
        best = None
        if "meta/best_model.txt" in names:
            with zf.open("meta/best_model.txt") as f:
                best = f.read().decode("utf-8").strip()
        return models, best

# ---------------- Utils: load bundle từ zip ----------------
def _load_bundle(zip_path: str, model_name: str = None):
    with ZipFile(zip_path, "r") as zf:
        names = zf.namelist()

        best = None
        if "meta/best_model.txt" in names:
            with zf.open("meta/best_model.txt") as f:
                best = f.read().decode("utf-8").strip()

        chosen_name = model_name or best
        if not chosen_name or f"models/{chosen_name}.pkl" not in names:
            model_files = [n for n in names if n.startswith("models/") and n.endswith(".pkl")]
            if not model_files:
                with zf.open(names[0], "r") as f:
                    return pickle.load(f), None
            chosen_name = model_files[0].split("/")[-1].replace(".pkl", "")

        with zf.open(f"models/{chosen_name}.pkl", "r") as f:
            bundle = pickle.load(f)

        return bundle, chosen_name

# ---------------- Core: ensure loaded ----------------
def _ensure_loaded(model_name: str = None):
    zip_path = MODEL_ZIP_PATH or _autopick_latest_zip()
    assert zip_path and os.path.exists(zip_path), (
        "Không tìm thấy churn_models_*.zip. Hãy chạy train_and_save.py trước!"
    )

    # Nếu đổi zip hoặc chưa có pipe thì reset cache
    if _loaded["zip_path"] != zip_path or _loaded["pipe"] is None:
        models, best = _list_models_in_zip(zip_path)

        # 🔹 Không cho KMeans làm model mặc định
        best_predict = best
        if not best_predict or best_predict == "kmeans":
            classifiers = [m for m in models if m != "kmeans"]
            if classifiers:
                best_predict = classifiers[0]
            else:
                # nếu thật sự chỉ còn mỗi kmeans thì đành chịu
                best_predict = best or (models[0] if models else None)

        _loaded.update({
            "zip_path": zip_path,
            "available_models": models,
            "best_in_zip": best_predict,
            "bundle": None,
            "pipe": None,
            "meta": {},
            "required_cols": [],
            "num_cols": [],
            "cat_cols": [],
            "target": None,
            "model_name": None,
        })

    # 🔹 Ưu tiên: query param > model đang load > best_in_zip (đã loại kmeans)
    need_model = model_name or _loaded["model_name"] or _loaded["best_in_zip"]

    if (_loaded["pipe"] is None) or (need_model and need_model != _loaded["model_name"]):
        bundle, chosen = _load_bundle(_loaded["zip_path"], model_name=need_model)
        _loaded["model_name"] = chosen

        if isinstance(bundle, dict) and "pipe" in bundle:
            _loaded["pipe"] = bundle["pipe"]
            _loaded["bundle"] = bundle
            _loaded["meta"] = bundle
            _loaded["required_cols"] = bundle.get("required_input_columns", [])
            _loaded["num_cols"] = bundle.get("numeric_columns", [])
            _loaded["cat_cols"] = bundle.get("categorical_columns", [])
            _loaded["target"] = bundle.get("target")
        else:
            _loaded["pipe"] = bundle
            _loaded["bundle"] = None
            _loaded["meta"] = {}
            _loaded["required_cols"] = []
            _loaded["num_cols"] = []
            _loaded["cat_cols"] = []
            _loaded["target"] = None


# ---------------- Clean DF helpers ----------------
def _to_float(x):
    if x is None or (isinstance(x, float) and np.isnan(x)):
        return np.nan
    try:
        if isinstance(x, bool):
            return float(int(x))
        if isinstance(x, str):
            t = x.strip()
            if t.lower() in {"true", "yes"}:
                return 1.0
            if t.lower() in {"false", "no"}:
                return 0.0
            t = t.replace(",", "")
            return float(t)
        return float(x)
    except Exception:
        return np.nan

def _clean_df(df: pd.DataFrame) -> pd.DataFrame:
    for c in _loaded["num_cols"]:
        if c in df.columns:
            df[c] = df[c].apply(_to_float)

    for c in _loaded["cat_cols"]:
        if c in df.columns:
            df[c] = df[c].astype(object)

    df = df.replace({pd.NA: np.nan})
    df = df.infer_objects(copy=False)
    return df

def _df_from_payload(payload: dict) -> pd.DataFrame:
    cols = _loaded["required_cols"] or list(payload.keys())
    row = {c: payload.get(c, None) for c in cols}
    df = pd.DataFrame([row])
    return _clean_df(df)

def _df_from_file(file_storage) -> pd.DataFrame:
    content = file_storage.read()
    for sep in [",", ";", "\t", "|"]:
        try:
            tmp = pd.read_csv(io.BytesIO(content), sep=sep)
            if isinstance(tmp, pd.DataFrame):
                df = tmp
                break
        except Exception:
            continue
    else:
        df = pd.read_csv(io.BytesIO(content), sep=",")

    if _loaded["required_cols"]:

        for c in _loaded["required_cols"]:
            if c not in df.columns:
                df[c] = np.nan
        df = df[_loaded["required_cols"]].copy()
    return _clean_df(df)

def _risk_bucket_binary(p: float, pred: int) -> str:
    if int(pred) == 0:
        return "low"

    # pred = 1
    if p >= 0.75:
        return "high"
    if p >= 0.5:
        return "medium"
    return "low"
def _risk_level(p: float, pred: int) -> int:
    if int(pred) == 0:
        return 0
    if p >= 0.75:
        return 2
    if p >= 0.5:
        return 1
    return 0
def _safe_num(x, default=0.0):
    """Chuyển x về float, nếu None / NaN / lỗi thì trả default."""
    try:
        if x is None:
            return default
        if isinstance(x, (int, float)):
            if isinstance(x, float) and np.isnan(x):
                return default
            return float(x)
        x = float(x)
        if np.isnan(x):
            return default
        return x
    except Exception:
        return default
def _compute_success_probability(proba, cluster, orders, rating, inactive, aov):
    """
    Tính success_probability (0–1) cho 1 action giữ chân,
    dựa trên churn probability + hồ sơ khách hàng.
    """

    # base theo churn probability: khách rủi ro cao → base thấp
    base = max(0.05, min(0.95, 1 - proba))

    # bonus theo cluster (0=low, 1=medium, 2=high churn)
    if cluster == 0:
        cluster_bonus = 0.10
    elif cluster == 1:
        cluster_bonus = 0.05
    elif cluster == 2:
        cluster_bonus = -0.05
    else:
        cluster_bonus = 0.0

    # orders bonus: nhiều đơn → dễ giữ hơn
    orders_bonus = min(0.15, orders / 200.0)

    # rating bonus: rating cao → dễ phản hồi tích cực
    rating_bonus = (rating - 3.0) * 0.08  # rating 4.0 → +0.08; 2.5 → -0.04

    # inactivity penalty: lâu không dùng → khó kéo lại
    inactive_penalty = - min(0.18, inactive / 80.0)

    # AOV bonus: giá trị đơn càng cao → đáng để đầu tư giữ chân
    aov_bonus = min(0.12, aov / 600000.0)

    success_raw = base + cluster_bonus + orders_bonus + rating_bonus + inactive_penalty + aov_bonus

    # Clamp trong range hợp lý
    return round(max(0.15, min(0.90, success_raw)), 3)

def _retention_recommendation(proba, row):
    """
    Gợi ý chiến lược giữ chân khách hàng dựa trên:
    - churn probability
    - loyalty tier / activity / num_orders / avg_order_value / rating / cancel_rate / cluster
    Trả về list action + success_probability (0–1).
    """

    tier = str((row.get("loyalty_tier") or "")).lower()
    orders = _safe_num(row.get("num_orders"), 0.0)
    aov = _safe_num(row.get("avg_order_value"), 0.0)
    rating = _safe_num(row.get("avg_rating"), 3.5)
    inactive = _safe_num(row.get("inactive_days"), 0.0)
    cancel = _safe_num(row.get("cancel_rate"), 0.0)
    cluster = row.get("cluster", None)

    actions = []

    # tính base success để dùng chung, từng action chỉ +/- chút
    try:
        c_int = int(cluster) if cluster is not None else None
    except Exception:
        c_int = None

    base_sp = _compute_success_probability(proba, c_int, orders, rating, inactive, aov)

    def adj(delta=0.0):
        """Điều chỉnh nhẹ quanh base_sp cho từng action."""
        return round(max(0.15, min(0.90, base_sp + delta)), 3)

    # 1️⃣ Rủi ro rất cao (proba >= 0.75)
    if proba >= 0.75:
        actions.append({
            "action": "Offer 20% discount + free delivery",
            "success_probability": adj(+0.05),
        })
        actions.append({
            "action": "Proactive CS support call within 24h",
            "success_probability": adj(0.0),
        })
        actions.append({
            "action": "Personalized voucher: top 3 favourite categories",
            "success_probability": adj(-0.02),
        })

    # 2️⃣ Rủi ro trung bình–cao (0.5 ≤ proba < 0.75)
    elif proba >= 0.5:
        actions.append({
            "action": "Provide targeted voucher (10%–15%)",
            "success_probability": adj(+0.03),
        })
        if inactive > 10:
            actions.append({
                "action": "Re-activation push: free delivery weekend",
                "success_probability": adj(0.0),
            })
        actions.append({
            "action": "Improve support response time",
            "success_probability": adj(-0.02),
        })

    # 3️⃣ Rủi ro thấp (proba < 0.5)
    else:
        actions.append({
            "action": "Reward loyalty (bonus points)",
            "success_probability": adj(+0.02),
        })
        if tier in ["bronze", "silver"]:
            actions.append({
                "action": "Suggest upgrading to Silver/Gold membership",
                "success_probability": adj(-0.01),
            })
        if rating < 3.0:
            actions.append({
                "action": "Send apology + compensation on low rating",
                "success_probability": adj(-0.03),
            })

    # 4️⃣ Điều chỉnh thêm theo cluster (0=low, 1=medium, 2=high churn segment)
    if c_int == 0:
        actions.append({
            "action": "Bundle meal recommendations (family pack)",
            "success_probability": adj(+0.02),
        })
    elif c_int == 1:
        actions.append({
            "action": "Offer premium curated menu trial",
            "success_probability": adj(0.0),
        })
    elif c_int == 2:
        actions.append({
            "action": "Price-sensitive voucher combo",
            "success_probability": adj(+0.04),
        })

    return actions



def _ensemble_prediction_info(df_single: pd.DataFrame):
    """
    Tính độ tin cậy dự đoán bằng ensemble:
    - Dùng tất cả các model phân loại trong zip (trừ kmeans)
    - df_single: DataFrame 1 dòng đã clean, đúng schema
    Trả về dict hoặc None nếu chỉ có 1 model.
    """
    # Danh sách model phân loại
    names = [m for m in _loaded["available_models"] if m != "kmeans"]
    if len(names) <= 1 or not _loaded["zip_path"]:
        return None

    probs = []
    preds = []

    for name in names:
        bundle, _ = _load_bundle(_loaded["zip_path"], model_name=name)
        pipe = bundle["pipe"] if isinstance(bundle, dict) and "pipe" in bundle else bundle

        p = float(pipe.predict_proba(df_single)[:, 1][0])
        probs.append(p)
        preds.append(int(p >= 0.5))

    probs = np.asarray(probs, dtype=float)
    mean_p = float(probs.mean())
    std_p = float(probs.std(ddof=0))

    majority_label = 1 if preds.count(1) >= preds.count(0) else 0
    agreement = sum(1 for pr in preds if pr == majority_label) / len(preds)

    # Heuristic level
    if agreement == 1.0 and std_p < 0.03:
        level = "very_high"
    elif agreement >= 0.66 and std_p < 0.10:
        level = "high"
    elif agreement >= 0.50:
        level = "medium"
    else:
        level = "low"

    # Score 0–1, std càng nhỏ thì score càng cao
    score = max(0.0, min(1.0, 1.0 - std_p * 3.0))

    return {
        "model_names": names,
        "probabilities": probs.tolist(),
        "mean_probability": mean_p,
        "std_probability": std_p,
        "majority_label": majority_label,
        "agreement_ratio": agreement,
        "confidence_level": level,
        "confidence_score": score,
    }


# ---------------- Routes ----------------
@app.route("/", methods=["GET"])
def index():
    try:
        _ensure_loaded()
        return render_template("index.html")
    except Exception:
        return """
        <h2>Food Delivery Churn Prediction</h2>
        <p>API sẵn sàng. POST JSON vào <code>/predict</code>, upload CSV vào <code>/predict_file</code>.</p>
        """, 200
@app.route("/login_admin", methods=["GET"])
@app.route("/login_admin.html", methods=["GET"])  # thêm dòng này
def login_admin():
    # C:\Users\Nhi\Downloads\CodeFinalProject\fod-del\admin\login_admin.html
    admin_dir = os.path.join(FOD_DEL_ROOT, "admin")
    return send_from_directory(admin_dir, "login_admin.html")

# JS (admin_auth.js, login_check.js, users.json)
@app.route("/fod-del/asset/js/<path:filename>")
def fod_del_js(filename):
    # C:\Users\Nhi\Downloads\CodeFinalProject\fod-del\asset\js
    js_dir = os.path.join(FOD_DEL_ROOT, "asset", "js")
    return send_from_directory(js_dir, filename)

# CSS của login_admin
@app.route("/back_end/wwwroot/asset/css/<path:filename>")
def back_end_css(filename):
    # C:\Users\Nhi\Downloads\CodeFinalProject\back_end\wwwroot\asset\css
    css_dir = os.path.join(BACK_END_ROOT, "wwwroot", "asset", "css")
    return send_from_directory(css_dir, filename)

# Logo ở thư mục back_end (login_admin dùng)
@app.route("/back_end/wwwroot/images/<path:filename>")
def back_end_images(filename):
    # C:\Users\Nhi\Downloads\CodeFinalProject\back_end\wwwroot\images
    img_dir = os.path.join(BACK_END_ROOT, "wwwroot", "images")
    return send_from_directory(img_dir, filename)

# Logo Flask ở /fod-del/models/static/Logo.png
@app.route("/fod-del/models/static/<path:filename>")
def fod_del_models_static(filename):
    # C:\Users\Nhi\Downloads\CodeFinalProject\fod-del\models\static
    static_dir = os.path.join(BASE_DIR, "static")
    return send_from_directory(static_dir, filename)

# Các file trong thư mục fod-del/admin (admin_list.html, ...)
@app.route("/fod-del/admin/<path:filename>")
def fod_del_admin(filename):
    admin_dir = os.path.join(FOD_DEL_ROOT, "admin")
    return send_from_directory(admin_dir, filename)

@app.route("/health", methods=["GET"])
def health():
    try:
        model = request.args.get("model")
        _ensure_loaded(model_name=model)
        meta = _loaded["meta"]
        return jsonify({
            "status": "ok",
            "loaded_from": _loaded["zip_path"],
            "model_name": _loaded["model_name"],
            "created_at": meta.get("created_at"),
            "target": meta.get("target"),
            "available_models": _loaded["available_models"],
            "best_in_zip": _loaded["best_in_zip"]
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/models", methods=["GET"])
def models():
    try:
        _ensure_loaded()
        return jsonify({
            "available_models": _loaded["available_models"],
            "best_in_zip": _loaded["best_in_zip"],
            "zip_path": _loaded["zip_path"]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/schema", methods=["GET"])
def schema():
    try:
        _ensure_loaded()
        return jsonify({
            "target": _loaded["target"],
            "required_input_columns": _loaded["required_cols"],
            "numeric_columns": _loaded["num_cols"],
            "categorical_columns": _loaded["cat_cols"],
            "note": "Không gửi các cột rò rỉ (Churn cũ, customerID, hoặc chính target)."
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/predict", methods=["POST"])
def predict():
    try:
        model = request.args.get("model")
        _ensure_loaded(model_name=model)

        # KMeans không dùng cho /predict
        if _loaded["model_name"] == "kmeans":
            return jsonify({"error": "Model kmeans không hỗ trợ /predict. Hãy chọn model phân loại."}), 400

        payload = request.get_json(force=True, silent=False)
        if not isinstance(payload, dict):
            return jsonify({"error": "Payload phải là JSON object."}), 400

        df = _df_from_payload(payload)

        # Xác suất & nhãn từ model hiện tại (best / modelSelect)
        proba = float(_loaded["pipe"].predict_proba(df)[:, 1][0])
        pred = int(proba >= 0.5)

        resp = {
            "prediction": pred,
            "probability": round(proba, 6),
            "risk_bucket": _risk_bucket_binary(proba, pred),
            "risk_level": _risk_level(proba, pred),
            "model_name": _loaded["model_name"],
            "loaded_from": _loaded["zip_path"],
        }

        # Thêm ensemble confidence nếu có ≥2 model phân loại
        ens = _ensemble_prediction_info(df)
        if ens is not None:
            resp.update({
                "confidence_score": round(ens["confidence_score"], 4),
                "confidence_level": ens["confidence_level"],  # very_high / high / medium / low
                "ensemble_mean_probability": round(ens["mean_probability"], 6),
                "ensemble_std_probability": round(ens["std_probability"], 6),
                "ensemble_agreement_ratio": round(ens["agreement_ratio"], 4),
            })
        return jsonify(resp)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/predict_file", methods=["POST"])
def predict_file():
    try:
        model = request.args.get("model")
        _ensure_loaded(model_name=model)

        if _loaded["model_name"] == "kmeans":
            return jsonify({"error": "Model kmeans không hỗ trợ /predict_file. Chọn model phân loại."}), 400

        if "file" not in request.files:
            return jsonify({"error": "Thiếu file trong form-data (key=file)"}), 400
        f = request.files["file"]

        df = _df_from_file(f)
        proba = _loaded["pipe"].predict_proba(df)[:, 1]
        pred = (proba >= 0.5).astype(int)

        out = df.copy()
        out["probability"] = proba
        out["prediction"] = pred
        out["risk_bucket"] = [_risk_bucket_binary(float(p), int(y))
                              for p, y in zip(proba, pred)]
        out["risk_level"] = [
            _risk_level(float(p), int(y))
            for p, y in zip(proba, pred)
        ]

        csv_bytes = out.to_csv(index=False).encode("utf-8")
        return Response(
            csv_bytes,
            mimetype="text/csv",
            headers={"Content-Disposition": "attachment; filename=predictions.csv"}
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ---------------- KMeans Clusters (churn rate per cluster) ----------------
@app.route("/kmeans_clusters", methods=["GET"])
def kmeans_clusters():
    """
    - Load model 'kmeans'
    - Đọc FoodDelivery_Churn_Minimal_fixed.csv (sep=';')
    - Dùng pipeline KMeans để gán cluster cho từng khách
    - Tính churn rate cho từng cluster
    - Trả JSON: {clusters: [{cluster, churn_rate, churn_count, total}, ...]}
    """
    try:
        _ensure_loaded(model_name="kmeans")

        csv_path = os.path.join(os.path.dirname(__file__), "FoodDelivery_Churn_Minimal_fixed.csv")
        df_raw = pd.read_csv(csv_path, sep=";")

        if TARGET not in df_raw.columns:
            return jsonify({"error": f"Không thấy cột target '{TARGET}' trong CSV."}), 500

        y = df_raw[TARGET].astype(int)

        # chuẩn bị X giống lúc train
        if _loaded["required_cols"]:
            df = df_raw.copy()
            for c in _loaded["required_cols"]:
                if c not in df.columns:
                    df[c] = np.nan
            df = df[_loaded["required_cols"]].copy()
        else:
            df = df_raw.copy()

        df = _clean_df(df)

        pipe = _loaded["pipe"]
        labels = pipe.predict(df)
        labels = np.asarray(labels)

        clusters = []
        for cid in sorted(np.unique(labels)):
            mask = (labels == cid)
            total = int(mask.sum())
            if total == 0:
                churn_count = 0
                churn_rate = 0.0
            else:
                churn_count = int(y[mask].sum())
                churn_rate = float(churn_count / total)

            clusters.append({
                "cluster": int(cid),
                "churn_rate": churn_rate,
                "churn_count": churn_count,
                "total_customers": total
            })

        return jsonify({"clusters": clusters})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/kmeans_cluster_rows", methods=["GET"])
def kmeans_cluster_rows():
    """
    Trả về danh sách chi tiết từng khách hàng + cluster:
    {
      "columns": [...],
      "rows": [
        {"customerID": "...", "cluster": 0, "num_orders": 5, ...},
        ...
      ]
    }
    """
    try:
        _ensure_loaded(model_name="kmeans")

        csv_path = os.path.join(os.path.dirname(__file__), "FoodDelivery_Churn_Minimal_fixed.csv")
        df_raw = pd.read_csv(csv_path, sep=";")

        # Chuẩn bị X giống lúc train KMeans
        if _loaded["required_cols"]:
            df = df_raw.copy()
            for c in _loaded["required_cols"]:
                if c not in df.columns:
                    df[c] = np.nan
            df = df[_loaded["required_cols"]].copy()
        else:
            df = df_raw.copy()

        df = _clean_df(df)

        pipe = _loaded["pipe"]          # pipeline(prep + kmeans)
        labels = pipe.predict(df)       # ndarray (n_samples,)
        labels = np.asarray(labels)

        df_out = df_raw.copy()
        df_out["cluster"] = labels.astype(int)

        # Các cột muốn show trong bảng
        cols_pref = [
            "customerID",
            "cluster",
            "gender", "SeniorCitizen", "Partner",
            "num_orders", "avg_order_value",
            "cancel_rating", "avg_rating", "voucher_usage_rate",
            "loyalty_tier", "age", "city_zone", "inactive_days",
            TARGET,  # Churn_food
        ]
        cols_final = [c for c in cols_pref if c in df_out.columns]

        rows = df_out[cols_final].to_dict(orient="records")

        return jsonify({"columns": cols_final, "rows": rows})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/churn_cus.csv', methods=['GET'])
def churn_cus_csv():
    """Serve the latest exported churn_cus CSV if present."""
    csv_path = os.path.join(BASE_DIR, 'churn_cus.csv')
    if os.path.exists(csv_path):
        return send_from_directory(BASE_DIR, 'churn_cus.csv')
    # fallback: try reading from DB and streaming as CSV
    try:
        from sqlalchemy import create_engine
        engine = create_engine(os.environ.get('DB_URL', 'mysql+pymysql://root:123456789@localhost:3306/dataforml'))
        df = pd.read_sql(f"SELECT * FROM churn_cus LIMIT 1000", engine)
        return Response(df.to_csv(index=False), mimetype='text/csv')
    except Exception:
        return jsonify({"error": "No exported CSV found and cannot read churn_cus from DB."}), 404


@app.route('/churn_cus_rows', methods=['GET'])
def churn_cus_rows():
    """
    Trả về toàn bộ bảng churn_cus (từ CSV hoặc DB) cho tab Predictions.
    Sau khi load, chuẩn hoá lại risk_bucket theo rule:
        pred = 0 → low
        pred = 1 & 0.5–0.75 → medium
        pred = 1 & ≥0.75     → high
    """
    csv_path = os.path.join(BASE_DIR, 'churn_cus.csv')
    try:
        # 1) Load CSV (ưu tiên) hoặc DB
        if os.path.exists(csv_path):
            df = pd.read_csv(csv_path)
        else:
            db_url = getattr(trainer, 'DB_URL', None) or os.environ.get(
                'DB_URL',
                'mysql+pymysql://root:123456789@localhost:3306/dataforml'
            )
            engine = create_engine(db_url)
            df = pd.read_sql("SELECT * FROM churn_cus", engine)

        # 2) Chuẩn hoá risk_bucket theo rule mới
        if "probability" in df.columns and "prediction" in df.columns:

            def _rb(row):
                p = float(row.get("probability", 0.0))
                y = int(row.get("prediction", 0))
                return _risk_bucket_binary(p, y)

            def _rl(row):
                p = float(row.get("probability", 0.0))
                y = int(row.get("prediction", 0))
                return _risk_level(p, y)

            df["risk_bucket"] = df.apply(_rb, axis=1)
            df["risk_level"] = df.apply(_rl, axis=1)

        # 3) Trả về UI
        rows = df.to_dict(orient='records')
        cols = list(df.columns)
        return jsonify({"columns": cols, "rows": rows})

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/predictions', methods=['GET'])
def predictions_page():
    try:
        return render_template('predictions.html')
    except Exception as e:
        return f"Error rendering predictions page: {e}", 500

@app.route("/what_if", methods=["POST"])
def what_if():
    """
    What-if analytics:
    Body JSON:
    {
      "feature": "support_response_time_hours",
      "base": { ... các feature đầu vào ... },
      "value_before": 24,
      "value_after": 12
    }
    """
    try:
        model = request.args.get("model")
        _ensure_loaded(model_name=model)

        # Chỉ áp dụng cho các model phân loại, không phải kmeans
        if _loaded["model_name"] == "kmeans":
            return jsonify({"error": "Model kmeans không hỗ trợ what-if. Hãy chọn model phân loại."}), 400

        payload = request.get_json(force=True, silent=False)
        feature = payload.get("feature")
        base = payload.get("base") or {}
        value_before = payload.get("value_before")
        value_after = payload.get("value_after")

        if not feature:
            return jsonify({"error": "Thiếu tên feature (feature)."}), 400

        # Scenario 1: giá trị hiện tại
        base_before = dict(base)
        base_before[feature] = value_before

        # Scenario 2: giá trị giả định
        base_after = dict(base)
        base_after[feature] = value_after

        df_before = _df_from_payload(base_before)
        df_after = _df_from_payload(base_after)

        proba_before = float(_loaded["pipe"].predict_proba(df_before)[:, 1][0])
        proba_after = float(_loaded["pipe"].predict_proba(df_after)[:, 1][0])
        delta = proba_after - proba_before

        return jsonify({
            "feature": feature,
            "prob_before": proba_before,
            "prob_after": proba_after,
            "delta": delta,
            "delta_percent": delta * 100.0
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400
@app.route("/top_risk_customers", methods=["GET"])
def top_risk_customers():
    """
    Trả về Top N khách hàng có nguy cơ rời bỏ cao nhất (dựa trên model phân loại):
    /top_risk_customers?top_n=20&model=logistic_regression

    JSON:
    {
      "columns": [...],
      "rows": [
        {"customerID": "...", "churn_proba": 0.87, "risk_bucket": "high", ...},
        ...
      ]
    }
    """
    try:
        # Lấy tham số
        top_n = request.args.get("top_n", default=20, type=int)
        top_n = max(1, top_n)
        model = request.args.get("model", default=None, type=str)
        bucket = request.args.get("bucket", default=None, type=str)
        bucket = (bucket or "").lower()

        # Đảm bảo đang dùng model PHÂN LOẠI (không phải kmeans)
        _ensure_loaded(model_name=model)

        if _loaded["model_name"] == "kmeans":
            # nếu lỡ đang là kmeans → chọn model đầu tiên khác kmeans
            classifiers = [m for m in _loaded["available_models"] if m != "kmeans"]
            if not classifiers:
                return jsonify({"error": "Không tìm thấy model phân loại nào trong zip."}), 500
            _ensure_loaded(model_name=classifiers[0])

        pipe = _loaded["pipe"]

        # Đọc full CSV gốc
        csv_path = os.path.join(os.path.dirname(__file__), "FoodDelivery_Churn_Minimal_fixed.csv")
        df_raw = pd.read_csv(csv_path, sep=";")

        if TARGET not in df_raw.columns:
            return jsonify({"error": f"Không thấy cột target '{TARGET}' trong CSV."}), 500

        # Chuẩn bị X giống lúc train
        if _loaded["required_cols"]:
            df = df_raw.copy()
            for c in _loaded["required_cols"]:
                if c not in df.columns:
                    df[c] = np.nan
            df = df[_loaded["required_cols"]].copy()
        else:
            df = df_raw.copy()

        df = _clean_df(df)

        proba = pipe.predict_proba(df)[:, 1]
        pred = (proba >= 0.5).astype(int)

        df_out = df_raw.copy()
        df_out["churn_proba"] = proba
        df_out["prediction"] = pred
        df_out["risk_bucket"] = [_risk_bucket_binary(float(p), int(y))
                                 for p, y in zip(proba, pred)]
        df_out["risk_level"] = [
            _risk_level(float(p), int(y))
            for p, y in zip(proba, pred)
        ]

                # Lọc theo bucket (nếu có)
        if bucket in {"high", "medium", "low"}:
            df_filtered = df_out[df_out["risk_bucket"] == bucket].copy()
            # low: lấy xác suất churn nhỏ nhất; còn lại: lớn nhất
            ascending = True if bucket == "low" else False
            df_top = df_filtered.sort_values("churn_proba",
                                             ascending=ascending).head(top_n)
        else:
            # mặc định: giống cũ → high risk (churn_proba giảm dần)
            df_top = df_out.sort_values("churn_proba",
                                        ascending=False).head(top_n)


        # Các cột muốn show
        cols_pref = [
            "customerID",
            "churn_proba",
            "risk_bucket",
            "prediction",
            "num_orders",
            "avg_order_value",
            "cancel_rate",
            "voucher_usage_rate",
            "avg_rating",
            "loyalty_tier",
            "age",
            "city_zone",
            "inactive_days",
        ]
        cols_final = [c for c in cols_pref if c in df_top.columns]

        rows = df_top[cols_final].to_dict(orient="records")
        # ép churn_proba về float thường để front format %
        for r in rows:
            if "churn_proba" in r:
                r["churn_proba"] = float(r["churn_proba"])

        return jsonify({"columns": cols_final, "rows": rows})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/recommend_retention", methods=["POST"])
def recommend_retention():
    """
    Nhận payload của 1 khách, tính churn_probability
    + sinh danh sách action giữ chân.
    Luôn cố gắng trả 200, chỉ 400 khi JSON sai hẳn.
    """
    try:
        payload = request.get_json(force=True)
        if not isinstance(payload, dict):
            return jsonify({"error": "Payload phải là JSON object."}), 400

        model = request.args.get("model")

        # ===== 1) Cố gắng lấy xác suất churn từ model =====
        proba = 0.5  # mặc định nếu model có vấn đề
        try:
            _ensure_loaded(model_name=model)

            # nếu lỡ đang là kmeans thì chọn 1 model phân loại bất kỳ
            if _loaded["model_name"] == "kmeans":
                classifiers = [m for m in _loaded["available_models"] if m != "kmeans"]
                if classifiers:
                    _ensure_loaded(model_name=classifiers[0])

            df = _df_from_payload(payload)
            proba = float(_loaded["pipe"].predict_proba(df)[:, 1][0])
        except Exception as e:
            # Không cho API fail, chỉ log ra console
            print("[WARN] recommend_retention model error:", e)

        # ===== 2) Sinh gợi ý retention theo rule =====
        profile = payload.copy()
        actions = _retention_recommendation(proba, profile)
        pred = 1 if proba >= 0.5 else 0
        return jsonify({
            "churn_probability": proba,
            "risk_bucket": _risk_bucket_binary(proba,pred),
            "actions": actions,
            "count": len(actions)
        }), 200

    except Exception as e:
        # Lỗi nặng (JSON hỏng, v.v.)
        return jsonify({"error": str(e)}), 400

# ---------------- Training / Export endpoints ----------------
@app.route("/train_and_export", methods=["POST"])
def train_and_export():
    """Start training+export in background. Returns immediately with job status."""
    if trainer is None:
        return jsonify({"error": "Trainer module not available on server."}), 500

    if _training_job.get("status") == "running":
        return jsonify({"status": "running"}), 409

    # Optional model param (query or json body)
    model_param = request.args.get('model') or (
        (request.json or {}).get('model') if request.get_json(silent=True) else None
    )
    if model_param:
        os.environ['TRAIN_MODEL'] = str(model_param)
        print(f"[API] /train_and_export called with model_param={model_param!r}")

    def _run():
        try:
            _training_job.update({
                "status": "running",
                "started": str(datetime.now()),
                "finished": None,
                "message": None,
                "exported_csv": None,
                "rows_written": None,
                "zip": None,
                "trained_models": None,
                "chosen_model": None,
            })
            # call trainer.main with optional model choice
            model_choice = os.environ.get('TRAIN_MODEL')
            print(f"[API] Worker starting trainer.main with model_choice={model_choice!r}")
            res = trainer.main(model_choice) if model_choice else trainer.main()
            print(f"[API] Trainer finished; result keys: {list(res.keys()) if isinstance(res, dict) else type(res)}")

            csv_path = None
            rows = None
            zip_path = None
            trained = None
            chosen = None

            if isinstance(res, dict):
                csv_path = res.get('csv_path')
                rows = res.get('rows_written')
                zip_path = res.get('zip_path')
                trained = res.get('trained_models')
                chosen = res.get('chosen_name') or res.get('best_name')

            # fallback: check standard location
            if not csv_path:
                csv_path = os.path.join(BASE_DIR, 'churn_cus.csv')
                if os.path.exists(csv_path):
                    try:
                        df = pd.read_csv(csv_path)
                        rows = int(len(df))
                    except Exception:
                        rows = None

            _training_job.update({
                "status": "done",
                "finished": str(datetime.now()),
                "message": None,
                "exported_csv": csv_path if csv_path and os.path.exists(csv_path) else None,
                "rows_written": rows,
                "zip": zip_path,
                "trained_models": trained,
                "chosen_model": chosen
            })
        except Exception as ex:
            _training_job.update({
                "status": "error",
                "finished": str(datetime.now()),
                "message": str(ex)
            })
        finally:
            # cleanup TRAIN_MODEL env var
            if 'TRAIN_MODEL' in os.environ:
                os.environ.pop('TRAIN_MODEL', None)

    Thread(target=_run, daemon=True).start()
    return jsonify({"status": "started"}), 202


@app.route("/train_status", methods=["GET"])
def train_status():
    return jsonify(_training_job)


@app.route('/churn_models', methods=['GET'])
def churn_models():
    """Return list of distinct model_name values present in churn_cus table."""
    try:
        # Use trainer DB_URL if available, else environment
        db_url = None
        try:
            db_url = getattr(trainer, 'DB_URL', None)
        except Exception:
            db_url = None
        if not db_url:
            db_url = os.environ.get('DB_URL')
        if not db_url:
            return jsonify({"error": "DB_URL not configured"}), 500

        engine = create_engine(db_url)
        # check if table exists and query distinct model_name
        q = "SELECT DISTINCT model_name FROM churn_cus WHERE model_name IS NOT NULL ORDER BY model_name"
        try:
            df = pd.read_sql(q, engine)
            models = df['model_name'].dropna().astype(str).tolist() if not df.empty else []
        except Exception:
            models = []

        return jsonify({"models": models})
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# ---------------- Main ----------------
if __name__ == "__main__":
    _ensure_loaded()
    print(f"[OK] Loaded ZIP:     {_loaded['zip_path']}")
    print(f"[OK] Best in ZIP:    {_loaded['best_in_zip']}")
    print(f"[OK] Active model:   {_loaded['model_name']}")
    print(f"[OK] Required cols:  {_loaded['required_cols']}")
    app.run(host=HOST, port=PORT, debug=DEBUG)