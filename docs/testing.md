# Testing Strategy & Quality Assurance — RailKavach Copilot

## 1. Testing Strategy Overview
In compliance with **Section 7 of the Master Engineering Prompt**, RailKavach Copilot adheres to a multi-tiered testing hierarchy ensuring reliability, safety, and speed across all operational modules.

```
┌────────────────────────────────────────────────────────┐
│                   TEST HIERARCHY                       │
│                                                        │
│   [E2E / Jury Scenarios]     Fast-Action Flow Tests    │
│   [Integration Tests]        FastAPI Endpoints         │
│   [Component / Skill Tests]  6 Agent Skills Schemas    │
│   [Unit Tests]               Filtering, Hash, Parsing  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Test Suites & Execution

### 2.1 Backend Automated Tests (Pytest)
* **Location**: `backend/tests/`
* **Test Modules**:
  * `test_skills.py`: Validates all 6 agent skills (keyword search, violation filtering, compliant activity suppression, wagon transit delta, timeline sync, report generation, and fatigue aggregation).
  * `test_api.py`: Validates FastAPI REST endpoints, status codes, CORS headers, and response schemas.
* **Execution Command**:
  ```bash
  cd backend && source .venv/bin/activate && PYTHONPATH=. pytest -v
  ```
* **Current Status**: **14 passing tests in 0.14s**.

### 2.2 Coverage Summary by Skill

| Skill / Target | Test Function | Verified Behavior | Status |
| :--- | :--- | :--- | :---: |
| `search_railcomm_transcripts` | `test_railcomm_search_by_keyword` | Keyword matching across Hindi, English, and railway vocabulary | ✅ PASS |
| `search_railcomm_transcripts` | `test_railcomm_search_by_train` | Train filter + Fail-Open safety flag integrity | ✅ PASS |
| `get_locate_cabin_violations` | `test_locate_violations_filtering` | Filter by violation type (`MOBILE_PHONE`, `SLEEPING`) | ✅ PASS |
| `get_locate_cabin_violations` | `test_locate_compliant_suppression`| Suppression of compliant acts (`WALKIE_TALKIE`, etc.) | ✅ PASS |
| `get_wdd_wagon_damages` | `test_wdd_wagon_damage_transit_delta` | Entry-vs-exit gantry delta isolates transit liability | ✅ PASS |
| `build_incident_timeline` | `test_timeline_synchronization` | Cross-modal chronological fusion across Audio + Video | ✅ PASS |
| `generate_safety_artifacts` | `test_report_generation` | CRS report + Devanagari Hindi crew lobby briefing | ✅ PASS |
| `analyze_safety_patterns` | `test_pattern_anomaly` | Identifies 02:00–05:00 AM micro-sleep night cluster | ✅ PASS |
| `/api/chat` (SPAD Scenario) | `test_chat_cached_spad_scenario` | Zero-token cache hit, split-second timestamp citations | ✅ PASS |
| `/api/chat` (Fatigue Scenario) | `test_chat_fatigue_scenario` | Preloaded fatigue response with corrective actions | ✅ PASS |

### 2.3 Frontend Verification (Next.js)
* **Build Verification**: `npm run build` executed and verified. Static optimization and bundle traces compiled with zero type or lint errors.
* **Bundle Budget**: Total First Load JS = **97.5 kB** (well within the < 150 kB recommended performance target).

---

## 3. Continuous Integration & Quality Gates
Before any commit or release, the following automated quality gates must pass:
1. Python type validation via `mypy` / Pydantic.
2. Backend test execution via `pytest` with zero failures.
3. Next.js TypeScript build check via `npm run build`.
4. Secret scanning preventing leakage of `.env` or credentials.
