import os
import sys
from io import BytesIO

import pandas as pd
import requests
from sqlalchemy import create_engine

# Configuration
FLASK_URL = os.environ.get("FLASK_URL", "http://127.0.0.1:5000")
DB_URL = os.environ.get("DB_URL", "mysql+pymysql://root:123456789@localhost:3306/dataforml")
MODEL = os.environ.get("MODEL", None)  # optional model query param

OUT_PATH = os.path.join(os.path.dirname(__file__), "predictions_from_api.csv")


def get_schema():
    url = f"{FLASK_URL}/schema"
    try:
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"Error: cannot get schema from {url}: {e}")
        return None


def read_db_table(engine):
    sql = "SELECT * FROM churn_prediction"
    try:
        df = pd.read_sql(sql, engine)
        print(f"Loaded {len(df)} rows from DB table 'churn_prediction'")
        return df
    except Exception as e:
        print(f"Error reading DB table churn_prediction: {e}")
        return None


def ensure_columns(df: pd.DataFrame, required: list) -> pd.DataFrame:
    # Add any missing columns as None and reorder
    for c in required:
        if c not in df.columns:
            df[c] = None
    df = df[required].copy()
    return df


def post_csv(df: pd.DataFrame) -> bytes:
    buf = BytesIO()
    df.to_csv(buf, index=False)
    buf.seek(0)
    endpoint = f"{FLASK_URL}/predict_file"
    if MODEL:
        endpoint = endpoint + f"?model={MODEL}"
    try:
        r = requests.post(endpoint, files={"file": ("batch.csv", buf, "text/csv")}, timeout=30)
        r.raise_for_status()
        return r.content
    except Exception as e:
        print(f"Error posting to {endpoint}: {e}")
        return None


def main():
    # 1) get schema
    schema = get_schema()
    if not schema:
        print("Cannot continue without schema. Exiting.")
        sys.exit(1)
    required = schema.get("required_input_columns", [])
    if not required:
        print("Schema returned no required_input_columns. Exiting.")
        sys.exit(1)

    # 2) connect to DB and read table
    engine = create_engine(DB_URL)
    df = read_db_table(engine)

    # 3) fallback to local CSV if DB read failed
    if df is None:
        local_csv = os.path.join(os.path.dirname(__file__), "FoodDelivery_Churn_Minimal_fixed.csv")
        if os.path.exists(local_csv):
            print(f"Falling back to local CSV: {local_csv}")
            df = pd.read_csv(local_csv)
        else:
            print("No DB data and no local CSV fallback found. Exiting.")
            sys.exit(1)

    # 4) ensure columns match required schema
    df_req = ensure_columns(df, required)

    # 5) post to Flask API
    content = post_csv(df_req)
    if content:
        with open(OUT_PATH, "wb") as f:
            f.write(content)
        print(f"✅ Saved predictions to: {OUT_PATH}")
    else:
        print("Failed to get predictions from API.")


if __name__ == "__main__":
    main()
