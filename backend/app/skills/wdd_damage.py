import json
from pathlib import Path
from typing import List, Dict, Any
from ..config import DATA_DIR
from ..schemas.skills import WddDamagesInput
from ..schemas.evidence import DamageClass

def load_wdd_inspections() -> List[Dict[str, Any]]:
    path = DATA_DIR / "wdd_inspections.json"
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def get_wdd_wagon_damages(params: WddDamagesInput) -> List[Dict[str, Any]]:
    """
    Retrieves Wagon Damage Detection records from 6-gantry optical scans.
    Correlates PaddleOCR wagon numbers with 8 damage classes.
    Computes entry-vs-exit condition differentials to identify transit damage liability.
    """
    records = load_wdd_inspections()
    results = []

    for r in records:
        # Train filter
        if params.train_no and params.train_no.lower() not in r.get("train_no", "").lower():
            continue

        # Wagon number filter
        if params.wagon_no and params.wagon_no.lower() not in r.get("wagon_no", "").lower():
            continue

        # Transit damage filter
        if params.new_damage_only and not r.get("delta_transit_damage", False):
            continue

        # Damage class filter
        if params.damage_class != DamageClass.ALL:
            has_defect = any(d.get("class") == params.damage_class.value for d in r.get("exit_defects", []))
            if not has_defect:
                continue

        results.append(r)

    return results
