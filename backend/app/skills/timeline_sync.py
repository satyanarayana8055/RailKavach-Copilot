from typing import List, Dict, Any
from ..schemas.skills import TimelineSyncInput, RailcommSearchInput, LocateViolationsInput
from .railcomm_search import search_railcomm_transcripts
from .locate_violations import get_locate_cabin_violations
from .wdd_damage import load_wdd_inspections
from ..observability import observe

@observe(name="skill.build_incident_timeline", as_type="tool")

def _alert_event(alert: dict, hindi: bool = False) -> str:
    """Describe a Locate alert from the fields the record actually carries (duration/confidence are optional)."""
    vtype = str(alert.get("violation_type", "")).replace("_", " ").title()
    meta = []
    if alert.get("duration_seconds") is not None:
        meta.append(f"{alert['duration_seconds']} सेकंड" if hindi else f"{alert['duration_seconds']}s")
    if alert.get("confidence") is not None:
        meta.append(f"{int(float(alert['confidence']) * 100)}%" + ("" if hindi else " conf"))
    head = ("केबिन कैमरा अलर्ट: " if hindi else "Locate CVVRS alert: ") + vtype + (f" ({', '.join(meta)})" if meta else "")
    desc = "" if hindi else (alert.get("description") or "").strip().rstrip(".")
    status = alert.get("verification_status")
    return head + (f" — {desc}" if desc else "") + (f". Status: {status}" if status else "")

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
            "event": _alert_event(alert),
            "event_hi": _alert_event(alert, hindi=True),
            "clarity": alert.get("confidence", 0.95),
            "reviewer_status": alert.get("verification_status"),
            "reviewer_id": alert.get("reviewer_id", "DSO-BKN"),
            "severity": alert.get("severity", "CRITICAL"),
            "image_url": alert.get("image_url"),
            "gcs_uri": alert.get("gcs_uri"),
            "statutory_rule": alert.get("statutory_rule")
        })

    # Sort chronologically by timestamp
    timeline_events.sort(key=lambda x: x.get("time_str", ""))

    return timeline_events


_INCIDENT_TERMS = ("Home Signal", "Caution Order", "SPAD", "halt", "Emergency", "Brake Pipe", "Put down the phone", "Distant Signal")


def _secs(t: str) -> int:
    h, m, s = (int(x) for x in (t or "00:00:00").split(":"))
    return h * 3600 + m * 60 + s


def focus_incident(events: List[Dict[str, Any]], before_min: int = 4, after_min: int = 2, cap: int = 22) -> List[Dict[str, Any]]:
    """
    The events that matter for an incident question: everything around the first CRITICAL radio call
    (signal / caution-order / brake / halt exchanges and any non-routine cab alert), in time order.
    Falls back to the opening of the shift when no critical call exists.
    """
    anchors = [e for e in events if e.get("source") == "RAILCOMM_AUDIO" and e.get("severity") == "CRITICAL"]
    if not anchors:
        return events[:12]
    t0 = _secs(anchors[0].get("time_str"))
    lo, hi = t0 - before_min * 60, t0 + after_min * 60
    keep = []
    for e in events:
        t = _secs(e.get("time_str"))
        if not lo <= t <= hi:
            continue
        if e.get("source") == "RAILCOMM_AUDIO":
            if e.get("severity") == "CRITICAL" or any(k.lower() in (e.get("event") or "").lower() for k in _INCIDENT_TERMS):
                keep.append(e)
        elif e.get("reviewer_status") != "SYSTEM_SUPPRESSED":
            keep.append(e)
    return keep[:cap]


def cab_phone_summary(events: List[Dict[str, Any]]) -> str:
    """Computed line about confirmed phone alerts around the first critical call (so the model never guesses)."""
    anchors = [e for e in events if e.get("source") == "RAILCOMM_AUDIO" and e.get("severity") == "CRITICAL"]
    phone = [e for e in events if e.get("source") == "LOCATE_CABIN_CAM" and e.get("reviewer_status") == "CONFIRMED"
             and "phone" in (e.get("event") or "").lower()]
    if not anchors or not phone:
        return ""
    t0 = _secs(anchors[0].get("time_str"))
    near = [e for e in phone if abs(_secs(e.get("time_str")) - t0) <= 60]
    before = [e for e in phone if _secs(e.get("time_str")) < t0]
    after = [e for e in phone if _secs(e.get("time_str")) > t0]
    return (f"CAB CAMERA FACTS: {len(phone)} confirmed phone-use alerts on this train this shift; "
            f"{len(near)} within one minute of the critical call at {anchors[0].get('time_str')}"
            + (f"; nearest before {before[-1].get('time_str')}" if before else "")
            + (f"; nearest after {after[0].get('time_str')}" if after else "") + ".")
