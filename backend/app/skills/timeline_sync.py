from typing import List, Dict, Any
from ..schemas.skills import TimelineSyncInput, RailcommSearchInput, LocateViolationsInput
from .railcomm_search import search_railcomm_transcripts
from .locate_violations import get_locate_cabin_violations
from .wdd_damage import load_wdd_inspections

def build_incident_timeline(params: TimelineSyncInput) -> List[Dict[str, Any]]:
    """
    Cross-modal temporal synchronizer: fuses Railcomm radio dialogues,
    Locate cabin CVVRS video alerts, and WDD wayside wagon damage logs into a single
    chronological sequence around the critical event window.
    """
    timeline_events = []

    # 1. Fetch relevant Railcomm calls
    rc_calls = search_railcomm_transcripts(RailcommSearchInput(train_no=params.train_no))
    for call in rc_calls:
        timeline_events.append({
            "timestamp": call.get("timestamp"),
            "time_str": call.get("time_str"),
            "source": "RAILCOMM_AUDIO",
            "channel": call.get("channel"),
            "speaker": call.get("speaker"),
            "event": f"[{call.get('speaker')}]: {call.get('transcript_en')}",
            "event_hi": f"[{call.get('speaker')}]: {call.get('transcript_hi')}",
            "clarity": call.get("clarity_score"),
            "fail_open": call.get("fail_open_bypassed"),
            "severity": "CRITICAL" if any(k in ["लाल (Danger)", "Emergency Brake", "Phone"] for k in call.get("safety_keywords", [])) else "INFO"
        })

    # 2. Fetch Locate cabin video alerts
    loc_alerts = get_locate_cabin_violations(LocateViolationsInput(train_no=params.train_no))
    for alert in loc_alerts:
        timeline_events.append({
            "timestamp": alert.get("timestamp"),
            "time_str": alert.get("time_str"),
            "source": "LOCATE_CABIN_CAM",
            "channel": "CVVRS Edge",
            "speaker": alert.get("crew_id"),
            "event": f"Locate CVVRS Alert: {alert.get('violation_type')} ({alert.get('duration_seconds')}s duration, {int(alert.get('confidence', 0)*100)}% conf). Status: {alert.get('verification_status')}",
            "event_hi": f"केबिन कैमरा अलर्ट: {alert.get('violation_type')} ({alert.get('duration_seconds')} सेकंड, {alert.get('verification_status')})",
            "clarity": alert.get("confidence"),
            "reviewer_status": alert.get("verification_status"),
            "reviewer_id": alert.get("reviewer_id"),
            "severity": "CRITICAL" if not alert.get("is_compliant_activity") else "COMPLIANT"
        })

    # Sort chronologically by timestamp
    timeline_events.sort(key=lambda x: x.get("time_str", ""))

    return timeline_events
