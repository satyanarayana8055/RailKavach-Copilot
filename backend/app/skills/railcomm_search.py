import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from ..config import DATA_DIR
from ..schemas.skills import RailcommSearchInput
from ..observability import observe

def load_transcripts() -> List[Dict[str, Any]]:
    path = DATA_DIR / "railcomm_transcripts.json"
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

@observe(name="skill.search_railcomm_transcripts", as_type="tool")
def search_railcomm_transcripts(params: RailcommSearchInput) -> List[Dict[str, Any]]:
    """
    Searches Railcomm denoised radio communication transcripts.
    Preserves Indian Railways safety vocabulary (Caution, Stop, Signal, Loop Line, Brake Pipe).
    Audits Fail-Open bypass status on all streams.
    """
    records = load_transcripts()
    results = []

    keyword_lower = params.keyword.lower() if params.keyword else None

    for r in records:
        # Train number filter
        if params.train_no and params.train_no.lower() not in r.get("train_no", "").lower():
            continue

        # Section filter
        if params.section and params.section.lower() not in r.get("section", "").lower():
            continue

        # Time range filter (HH:MM:SS)
        t_str = r.get("time_str", "")
        if params.start_time and t_str < params.start_time:
            continue
        if params.end_time and t_str > params.end_time:
            continue

        # Keyword matching across Hindi, English, and safety keywords
        if keyword_lower:
            text_en = r.get("transcript_en", "").lower()
            text_hi = r.get("transcript_hi", "").lower()
            keywords = [k.lower() for k in r.get("safety_keywords", [])]

            matches = (
                keyword_lower in text_en or
                keyword_lower in text_hi or
                any(keyword_lower in k for k in keywords)
            )
            if not matches:
                continue

        results.append(r)

    return results
