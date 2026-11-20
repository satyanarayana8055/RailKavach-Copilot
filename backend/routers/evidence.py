from fastapi import APIRouter, UploadFile, File, HTTPException
from services.gcs_service import gcs_service

router = APIRouter(prefix="/evidence", tags=["Evidence & GCS Vault"])

@router.post("/upload")
async def upload_evidence_file(file: UploadFile = File(...)):
    """
    Uploads an evidence file (audio, video clip, wagon photo) to Google Cloud Storage (GCS)
    or local secure vault, generating cryptographic SHA-256 hash.
    """
    try:
        content = await file.read()
        res = gcs_service.upload_evidence(
            filename=file.filename,
            file_bytes=content,
            content_type=file.content_type or "application/octet-stream"
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
