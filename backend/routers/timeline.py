from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from src.skills.timeline_sync import build_incident_timeline
from services.gemini_service import gemini_service

router = APIRouter(prefix="/timeline", tags=["Timeline"])

@router.get("/{train_no}")
async def get_timeline(train_no: str):
    """
    Returns the synchronized multimodal chronological timeline fusing:
    Audio (Railcomm) + Video (Locate) + Wayside Sensors (WDD) + New Products (WILD).
    """
    try:
        events = build_incident_timeline(gemini_service.engine.registry, train_no=train_no)
        return {
            "train_no": train_no,
            "total_events": len(events),
            "events": events
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
