import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "backend" / "railkavach.db"
OUTPUT_DIR = BASE_DIR / "scripts" / "alloydb_sql_batches"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()
cursor.execute('SELECT incident_id, train_no, division, section, incident_type, severity, reviewer_status, reviewer_notes, evidence_gcs_uri, bsa_section_63_hash FROM railkavach_incidents')
rows = cursor.fetchall()

def escape(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"

batch_size = 75
batch_num = 1

for i in range(0, len(rows), batch_size):
    chunk = rows[i:i + batch_size]
    values = []
    for r in chunk:
        v = f"({escape(r[0])}, {escape(r[1])}, {escape(r[2])}, {escape(r[3])}, {escape(r[4])}, {escape(r[5])}, {escape(r[6])}, {escape(r[7])}, {escape(r[8])}, {escape(r[9])}, NOW())"
        values.append(v)
    
    sql = "INSERT INTO railkavach_incidents (incident_id, train_no, division, section, incident_type, severity, reviewer_status, reviewer_notes, evidence_gcs_uri, bsa_section_63_hash, created_at)\nVALUES\n"
    sql += ",\n".join(values)
    sql += "\nON CONFLICT (incident_id) DO NOTHING;\n"
    
    out_file = OUTPUT_DIR / f"batch_{batch_num:02d}.sql"
    out_file.write_text(sql, encoding="utf-8")
    print(f"Wrote {len(chunk)} rows to {out_file.name}")
    batch_num += 1

print(f"Successfully generated {batch_num - 1} SQL batch files.")
