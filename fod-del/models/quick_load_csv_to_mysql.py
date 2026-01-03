# quick_load_csv_to_mysql.py
import os
import re
import csv
import pandas as pd
from sqlalchemy import create_engine

# Path to the CSV (relative to this script file). Adjust if your CSV is elsewhere.
csv_path = os.path.join(os.path.dirname(__file__), "FoodDelivery_Churn_Minimal_fixed.csv")

# Detect delimiter using csv.Sniffer (best-effort). Fall back to comma.
sep = ','
try:
	with open(csv_path, 'r', encoding='utf-8') as f:
		sample = f.read(8192)
		dialect = csv.Sniffer().sniff(sample, delimiters=';,|\t')
		sep = dialect.delimiter
except Exception:
	# keep default
	pass

print(f"Reading CSV '{csv_path}' with delimiter '{sep}'")
df = pd.read_csv(csv_path, sep=sep, engine='python')

# Sanitize column names to avoid illegal/too-long MySQL identifiers
def sanitize_col(c: str) -> str:
	# Replace non-alphanumeric characters with underscore
	s = re.sub(r'[^0-9a-zA-Z_]', '_', str(c))
	# Trim to 64 chars (MySQL identifier max length)
	return s[:64]

df.columns = [sanitize_col(c) for c in df.columns]

engine = create_engine("mysql+pymysql://root:123456789@localhost:3306/dataforml")
try:
	df.to_sql("churn_prediction", engine, if_exists="replace", index=False)
	print("table created")
except Exception as e:
	print(f"Failed to write table to MySQL: {e}")