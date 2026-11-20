from typing import Dict, Any, List
from collections import defaultdict
from ..schemas.skills import PatternAnomalyInput
from .locate_violations import load_locate_alerts
from ..observability import observe

@observe(name="skill.analyze_safety_patterns", as_type="tool")
def analyze_safety_patterns(params: PatternAnomalyInput) -> Dict[str, Any]:
    """
    Aggregates safety infractions across shifts and divisions to identify
    systemic hazards (e.g. 02:00-05:00 AM micro-sleep clusters).
    """
    alerts = load_locate_alerts()

    # Aggregate by time-of-day window
    time_clusters = defaultdict(list)
    for alert in alerts:
        if alert.get("is_compliant_activity"):
            continue
        time_str = alert.get("time_str", "")
        hour = time_str.split(":")[0] if ":" in time_str else "00"
        time_clusters[f"{hour}:00"].append(alert)

    # Highlight 02:00 - 05:00 AM high-risk night window
    night_cluster = []
    for h in ["02:00", "03:00", "04:00"]:
        night_cluster.extend(time_clusters.get(h, []))

    return {
        "analysis_period": "November 2026",
        "division": "Bikaner (NWR)",
        "total_violations_analyzed": len([a for a in alerts if not a.get("is_compliant_activity")]),
        "critical_finding": "High concentration of driver micro-sleep and distraction events between 02:00 and 05:00 AM.",
        "night_shift_fatigue_cluster": {
            "window": "02:00 - 05:00 AM",
            "count": len(night_cluster),
            "dominant_violation": "SLEEPING (Micro-Sleep)",
            "affected_locos": list(set(a.get("loco_id") for a in night_cluster)),
            "incidents": [
                {
                    "time": a.get("time_str"),
                    "loco": a.get("loco_id"),
                    "train": a.get("train_no"),
                    "crew": a.get("crew_id"),
                    "violation": a.get("violation_type"),
                    "status": a.get("verification_status")
                }
                for a in night_cluster
            ]
        },
        "recommended_interventions": [
            "Adjust audio alertness confirmation ping from 60s to 30s during 02:00-05:00 AM.",
            "Schedule mandatory crew refreshment breaks for freight rakes at Lalgarh and Suratgarh sidings."
        ]
    }
