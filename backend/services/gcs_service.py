import os
import hashlib
from typing import Optional, Dict, Any
from config import settings

class GCSService:
    """
    Google Cloud Storage (GCS) Service.
    Stores and retrieves safety evidence (audio, video clips, wagon photos, sensor dumps).
    Computes immutable SHA-256 digests and falls back gracefully to local disk.
    """
    
    def __init__(self):
        self.bucket_name = settings.GCS_BUCKET_NAME
        self.local_dir = settings.LOCAL_STORAGE_DIR
        os.makedirs(self.local_dir, exist_ok=True)
        self.client = None
        self._init_client()

    def _init_client(self):
        try:
            from google.cloud import storage
            self.client = storage.Client(project=settings.GCS_PROJECT_ID)
            print(f"[GCS Service] Connected to Google Cloud Storage bucket: {self.bucket_name}")
        except Exception as e:
            print(f"[GCS Service] Operating in Local Storage mode (fallback enabled): {e}")

    def upload_evidence(self, filename: str, file_bytes: bytes, content_type: str = "application/octet-stream") -> Dict[str, Any]:
        """Uploads evidence to GCS or local disk and returns cryptographic SHA-256 hash."""
        sha256_hash = hashlib.sha256(file_bytes).hexdigest()
        
        # If GCS client is authenticated
        if self.client:
            try:
                bucket = self.client.bucket(self.bucket_name)
                blob = bucket.blob(filename)
                blob.upload_from_string(file_bytes, content_type=content_type)
                return {
                    "storage_backend": "GOOGLE_CLOUD_STORAGE",
                    "uri": f"gs://{self.bucket_name}/{filename}",
                    "public_url": f"https://storage.googleapis.com/{self.bucket_name}/{filename}",
                    "sha256_hash": sha256_hash,
                    "size_bytes": len(file_bytes)
                }
            except Exception as e:
                print(f"[GCS Upload Error] Falling back to local storage: {e}")

        # Local storage fallback
        local_path = os.path.join(self.local_dir, filename)
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        with open(local_path, "wb") as f:
            f.write(file_bytes)

        return {
            "storage_backend": "LOCAL_SECURE_VAULT",
            "uri": f"file://{local_path}",
            "public_url": f"/api/v1/evidence/file/{filename}",
            "sha256_hash": sha256_hash,
            "size_bytes": len(file_bytes)
        }

    def verify_integrity(self, file_bytes: bytes, expected_hash: str) -> bool:
        """Verifies if the file bitstream matches the certified SHA-256 hash."""
        current_hash = hashlib.sha256(file_bytes).hexdigest()
        return current_hash.lower() == expected_hash.lower()

gcs_service = GCSService()
