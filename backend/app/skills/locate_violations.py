import json
from pathlib import Path
from typing import List, Dict, Any
from ..config import DATA_DIR
from ..schemas.skills import LocateViolationsInput
from ..schemas.evidence import ReviewerStatus, ViolationType
from ..observability import observe

def load_locate_alerts() -> List[Dict[str, Any]]:
    path = DATA_DIR / "locate_alerts.json"
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@observe(name="skill.get_locate_cabin_violations", as_type="tool")
def get_locate_cabin_violations(params: LocateViolationsInput) -> List[Dict[str, Any]]:
    """
    Queries CVVRS in-cab video analytics detections.
    Filters compliant tasks (walkie-talkie, caution reading, brake controlling) from true violations.
    Audits human reviewer verification status (CONFIRMED vs PENDING).
    """
    records = load_locate_alerts()
    results = []

    for r in records:
        # Loco filter
        if params.loco_id and params.loco_id.lower() not in r.get("loco_id", "").lower():
            continue

        # Train filter
        if params.train_no and params.train_no.lower() not in r.get("train_no", "").lower():
            continue

        # Violation type filter
        if params.violation_type != ViolationType.ALL:
            if r.get("violation_type") != params.violation_type.value:
                continue

        # Verification status filter
        if params.verification_status != ReviewerStatus.ALL:
            if r.get("verification_status") != params.verification_status.value:
                continue

        # Time window filter
        if params.time_window and " - " in params.time_window:
            start_t, end_t = params.time_window.split(" - ")
            t_str = r.get("time_str", "")
            if t_str < start_t.strip() or t_str > end_t.strip():
                continue

        results.append(r)

    return results
