# Requirements Traceability Matrix (RTM) — RailKavach Copilot

This matrix traces requirements from Indian Railways operational challenges to system features, agent skills, implementation modules, and verification tests in accordance with **Section 8 of the Master Engineering Prompt**.

---

## 1. Traceability Mapping

| Req ID | Business & Operational Need (NWR) | System Capability | Agent Skill / Component | API / Code Module | Verification Test | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **REQ-01** | Eliminate 3–5 day manual delay in reviewing cab radio recordings for incident investigations. | Speech-to-text transcript search with railway safety vocabulary preservation. | `search_railcomm_transcripts` | `backend/app/skills/railcomm_search.py` | `tests/test_railcomm_search.py` | Verified |
| **REQ-02** | Detect driver distraction and fatigue without false alarms on legitimate operational duties. | CVVRS video analytics distinguishing 5 violations from 3 compliant acts. | `get_locate_cabin_violations` | `backend/app/skills/locate_violations.py` | `tests/test_locate_violations.py` | Verified |
| **REQ-03** | Prevent unverified AI detections from being cited as confirmed operational violations. | Human-in-the-loop review queue with immutable reviewer ID and decision audit. | Reviewer Status Attributes (`CONFIRMED`, `PENDING`) | `backend/app/schemas/evidence.py` | `tests/test_reviewer_status.py` | Verified |
| **REQ-04** | Identify newly sustained rolling-stock transit damage to attribute contractor/terminal liability. | 6-gantry camera PaddleOCR wagon number + YOLOv8 entry-vs-exit damage delta. | `get_wdd_wagon_damages` | `backend/app/skills/wdd_damage.py` | `tests/test_wdd_damage.py` | Verified |
| **REQ-05** | Reconstruct multi-source incident chronology for inquiry boards (CRS / Sr DSO). | Cross-modal temporal fusion linking radio callouts, driver alerts, and wayside defects. | `build_incident_timeline` | `backend/app/skills/timeline_sync.py` | `tests/test_timeline_sync.py` | Verified |
| **REQ-06** | Generate formal bilingual inquiry documentation for headquarters and crew lobby sign-ons. | Dual-format bilingual statutory report and Devanagari Hindi crew safety briefing note. | `generate_safety_artifacts` | `backend/app/skills/report_gen.py` | `tests/test_report_gen.py` | Verified |
| **REQ-07** | Proactively identify repeat risk clusters across sections, shifts, and crews before accidents. | Multi-dimensional aggregation of micro-sleep and signal callout failures. | `analyze_safety_patterns` | `backend/app/skills/pattern_anomaly.py` | `tests/test_pattern_anomaly.py` | Verified |
| **REQ-08** | Ensure 100% demo uptime at the Buildathon venue regardless of network connectivity. | Pre-validated deterministic fallback response cache for core scenarios. | Zero-Latency Fail-Safe Cache | `backend/app/engine.py` (`cached_demo_responses.json`) | `tests/test_cache_fallback.py` | Verified |
| **REQ-09** | Adhere to Indian Railways Fail-Open safety mandate on all communications. | Audit logging of fail-open bypass status on audio streams. | Fail-Open Safety Metadata | `backend/app/schemas/railcomm.py` | `tests/test_fail_open_integrity.py` | Verified |
| **REQ-10** | Minimize token consumption and API operational expenditure (< 2,500 tokens/query). | Bounded context windowing ($\pm 15$m) and Gemini 1.5 Flash model routing. | Tokenometrics Engine | `backend/app/engine.py` | `tests/test_token_budget.py` | Verified |

---

## 2. Change Impact Assessment Matrix

| Target Component | Dependent Modules | Affected Tests | Documentation Impact |
| :--- | :--- | :--- | :--- |
| `skills/railcomm_search.py` | `engine.py`, `timeline_sync.py` | `test_railcomm_search.py`, `test_timeline_sync.py` | `SKILLS.md`, `README.md` |
| `skills/locate_violations.py` | `engine.py`, `timeline_sync.py` | `test_locate_violations.py`, `test_timeline_sync.py` | `SKILLS.md` |
| `skills/wdd_damage.py` | `engine.py`, `timeline_sync.py` | `test_wdd_damage.py`, `test_timeline_sync.py` | `SKILLS.md` |
| `data/cached_demo_responses.json` | `engine.py`, `main.py` | `test_cache_fallback.py` | `EVALUATION_GUIDE.md` |
