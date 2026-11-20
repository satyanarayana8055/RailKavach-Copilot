from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from src.skills.timeline_sync import build_incident_timeline
from src.skills.report_gen import generate_statutory_inquiry_report
from services.gemini_service import gemini_service
from services.postgres_service import db_service

router = APIRouter(prefix="/reports", tags=["Statutory Reports"])

class VerificationRequest(BaseModel):
    event_id: str
    status: str  # CONFIRMED or REJECTED
    reviewer_id: str
    reviewer_name: str
    remarks: str

@router.get("/crs/{train_no}")
async def get_crs_report(train_no: str, incident_id: str = "INC-12414-20261118"):
    """
    Generates the official Commission of Railway Safety (CRS) Statutory Report
    with embedded Section 63 BSA 2023 Electronic Evidence Certificate.
    """
    try:
        timeline = build_incident_timeline(gemini_service.engine.registry, train_no=train_no)
        report = generate_statutory_inquiry_report(
            incident_id=incident_id,
            train_no=train_no,
            loco_id="WAP-7 30452",
            section="Suratgarh - Bikaner",
            timeline_events=timeline
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify")
async def verify_evidence(req: VerificationRequest):
    """Logs human reviewer verification decision (Mandatory under Railways Act Sec 175)."""
    db_service.log_reviewer_decision(
        event_id=req.event_id,
        status=req.status,
        reviewer_id=req.reviewer_id,
        reviewer_name=req.reviewer_name,
        remarks=req.remarks
    )
    return {"status": "SUCCESS", "message": f"Event {req.event_id} marked as {req.status}"}
