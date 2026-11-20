import hashlib
import os
import time
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone

# -------------------------------------------------------------
# 1. Google Cloud Storage Integration
# -------------------------------------------------------------
try:
    from google.cloud import storage
    GCS_LIB_AVAILABLE = True
except ImportError:
    GCS_LIB_AVAILABLE = False


class GCSEvidenceVault:
    """
    Evidence vault using Google Cloud Storage (GCS) with local immutable fallback.
    Complies with Bharatiya Sakshya Adhiniyam (BSA) 2023 Section 63 electronic records.
    """

    def __init__(self, bucket_name: Optional[str] = None):
        self.bucket_name = bucket_name or os.getenv("GCS_BUCKET_NAME", "railkavach")
        self.client = None
        self.bucket = None
        self.is_connected = False
        self.local_vault_dir = Path(os.getenv("LOCAL_STORAGE_DIR", Path(__file__).resolve().parent.parent.parent / "data" / "storage"))
        self.local_vault_dir.mkdir(parents=True, exist_ok=True)

        self._init_gcs()

    def _init_gcs(self):
        if not GCS_LIB_AVAILABLE:
            return
        try:
            self.client = storage.Client()
            if self.bucket_name:
                self.bucket = self.client.bucket(self.bucket_name)
                # Verify bucket accessibility
                if self.bucket.exists():
                    self.is_connected = True
        except Exception:
            self.is_connected = False

    def upload_evidence(self, file_bytes: bytes, destination_path: str, content_type: str = "application/octet-stream") -> Dict[str, Any]:
        """
        Uploads evidence bytes to GCS and computes SHA-256 cryptographic hash.
        """
        sha256_hash = hashlib.sha256(file_bytes).hexdigest()
        size_bytes = len(file_bytes)
        timestamp = datetime.now(timezone.utc).isoformat()

        if self.is_connected and self.bucket:
            try:
                blob = self.bucket.blob(destination_path)
                blob.metadata = {
                    "sha256": sha256_hash,
                    "uploaded_at": timestamp,
                    "compliance": "BSA 2023 Section 63",
                    "platform": "RailKavach AI"
                }
                blob.upload_from_string(file_bytes, content_type=content_type)
                return {
                    "storage": "GCS_LIVE",
                    "bucket": self.bucket_name,
                    "uri": f"gs://{self.bucket_name}/{destination_path}",
                    "public_url": f"https://storage.googleapis.com/{self.bucket_name}/{destination_path}",
                    "sha256": sha256_hash,
                    "size_bytes": size_bytes,
                    "timestamp": timestamp
                }
            except Exception as e:
                # Degrade safely to local vault on any network disruption
                pass

        # Local fallback vault
        local_dest = self.local_vault_dir / destination_path
        local_dest.parent.mkdir(parents=True, exist_ok=True)
        local_dest.write_bytes(file_bytes)

        return {
            "storage": "LOCAL_VAULT_FALLBACK",
            "path": str(local_dest),
            "uri": f"file://{local_dest}",
            "sha256": sha256_hash,
            "size_bytes": size_bytes,
            "timestamp": timestamp
        }

    def list_evidence_objects(self, prefix: str = "") -> List[Dict[str, Any]]:
        if self.is_connected and self.bucket:
            try:
                blobs = list(self.bucket.list_blobs(prefix=prefix))
                return [
                    {
                        "name": b.name,
                        "size": b.size,
                        "updated": b.updated.isoformat() if b.updated else None,
                        "uri": f"gs://{self.bucket_name}/{b.name}"
                    }
                    for b in blobs
                ]
            except Exception:
                pass
        return []


# -------------------------------------------------------------
# 2. AlloyDB for PostgreSQL Integration
# -------------------------------------------------------------
try:
    from sqlalchemy import create_engine, text
    from sqlalchemy.orm import sessionmaker
    SQLALCHEMY_AVAILABLE = True
except ImportError:
    SQLALCHEMY_AVAILABLE = False


class AlloyDBManager:
    """
    Manages operational transactions, incident logs, and Section 63 BSA reviewer trails.
    Targets AlloyDB for PostgreSQL with automatic fallback to local SQLite.
    """

    def __init__(self, database_url: Optional[str] = None):
        self.db_url = database_url or os.getenv("DATABASE_URL", "")
        self.engine = None
        self.SessionLocal = None
        self.is_connected = False
        self._init_db()

    def _init_db(self):
        if not SQLALCHEMY_AVAILABLE:
            return

        # Attempt AlloyDB connection if configured
        if self.db_url:
            try:
                # Add connect_timeout to avoid hangs
                self.engine = create_engine(
                    self.db_url,
                    connect_args={"connect_timeout": 5},
                    pool_pre_ping=True
                )
                with self.engine.connect() as conn:
                    conn.execute(text("SELECT 1;"))
                self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
                self.is_connected = True
                return
            except Exception:
                self.is_connected = False

        # Fallback to local SQLite database
        sqlite_path = Path(__file__).resolve().parent.parent.parent / "railkavach.db"
        sqlite_url = f"sqlite:///{sqlite_path}"
        try:
            self.engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
            self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
            self._ensure_sqlite_tables()
        except Exception:
            pass

    def _ensure_sqlite_tables(self):
        if not self.engine:
            return
        with self.engine.begin() as conn:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS railkavach_incidents (
                    incident_id VARCHAR(64) PRIMARY KEY,
                    train_no VARCHAR(32) NOT NULL,
                    division VARCHAR(64) NOT NULL,
                    section VARCHAR(128),
                    incident_type VARCHAR(64) NOT NULL,
                    severity VARCHAR(16) NOT NULL,
                    reviewer_status VARCHAR(32) DEFAULT 'PENDING_VERIFICATION',
                    reviewer_notes TEXT,
                    evidence_gcs_uri VARCHAR(256),
                    bsa_section_63_hash VARCHAR(128),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """))
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS railkavach_audit_ledger (
                    audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    incident_id VARCHAR(64),
                    action VARCHAR(64) NOT NULL,
                    reviewer_badge_no VARCHAR(64) NOT NULL,
                    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    cryptographic_signature VARCHAR(256) NOT NULL,
                    dpdp_consent_verified BOOLEAN DEFAULT 1
                );
            """))

    def record_incident(self, incident_data: Dict[str, Any]) -> bool:
        if not self.engine:
            return False
        stmt = text("""
            INSERT INTO railkavach_incidents 
            (incident_id, train_no, division, section, incident_type, severity, reviewer_status, reviewer_notes, evidence_gcs_uri, bsa_section_63_hash)
            VALUES (:id, :train, :div, :sec, :type, :sev, :status, :notes, :gcs, :hash)
            ON CONFLICT (incident_id) DO UPDATE SET
            reviewer_status = EXCLUDED.reviewer_status,
            reviewer_notes = EXCLUDED.reviewer_notes;
        """)
        try:
            with self.engine.begin() as conn:
                conn.execute(stmt, {
                    "id": incident_data.get("incident_id"),
                    "train": incident_data.get("train_no", "12414"),
                    "div": incident_data.get("division", "Bikaner"),
                    "sec": incident_data.get("section", "Suratgarh Jn"),
                    "type": incident_data.get("incident_type", "NEAR_SPAD"),
                    "sev": incident_data.get("severity", "CRITICAL"),
                    "status": incident_data.get("reviewer_status", "PENDING_VERIFICATION"),
                    "notes": incident_data.get("reviewer_notes", ""),
                    "gcs": incident_data.get("evidence_gcs_uri", ""),
                    "hash": incident_data.get("bsa_section_63_hash", "")
                })
            return True
        except Exception:
            return False

    def list_incidents(self, limit: int = 50) -> List[Dict[str, Any]]:
        if not self.engine:
            return []
        try:
            with self.engine.connect() as conn:
                res = conn.execute(text("SELECT * FROM railkavach_incidents ORDER BY created_at DESC LIMIT :lim;"), {"lim": limit})
                cols = res.keys()
                return [dict(zip(cols, row)) for row in res.fetchall()]
        except Exception:
            return []


# Global Singletons
gcs_vault = GCSEvidenceVault()
alloydb_manager = AlloyDBManager()
