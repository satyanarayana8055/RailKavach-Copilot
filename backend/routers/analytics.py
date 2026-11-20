from fastapi import APIRouter
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from src.skills.pattern_engine import analyze_fatigue_and_pattern_anomalies
from services.gemini_service import gemini_service

router = APIRouter(prefix="/analytics", tags=["Pattern Analytics"])

@router.get("/fatigue")
async def get_fatigue_analytics():
    """Returns circadian fatigue cluster analytics and HOER roster violation metrics."""
    locate_events = gemini_service.engine.registry.execute_tool(
        "get_locate_cabin_violations",
        {"loco_id": "WAP-7 30452", "violation_type": "ALL"}
    )
    return analyze_fatigue_and_pattern_anomalies(locate_events)
