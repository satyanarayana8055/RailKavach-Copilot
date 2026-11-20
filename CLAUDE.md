# Developer Reference & Build Guide — RailKavach Copilot

## 1. Quick Reference & Technology Stack
* **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide React.
* **Backend**: FastAPI (Python 3.10+), Pydantic v2, Google GenAI SDK (`google-genai`), Uvicorn.
* **Observability**: Langfuse v5 (`app/observability.py`). Off locally without keys; mandatory on Cloud Run (`LANGFUSE_REQUIRED=true`, keys in Secret Manager).
* **Data Layer**: Structured synthetic JSON datasets (`data/`) modeling authentic NWR operations with zero live client exposure.

---

## 2. Common Developer Commands

### Backend (FastAPI)
```bash
# Setup virtual environment
cd backend
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Run test suite
pytest tests/ -v
```

### Frontend (Next.js)
```bash
# Setup and install
cd frontend
npm install

# Run development server
npm run dev

# Run production build
npm run build
npm run lint
```

---

## 3. Architecture & Code Conventions
* **Clean Architecture**: Separate API routes (`app/main.py`), Pydantic schemas (`app/schemas/`), skill modules (`app/skills/`), and the reasoning orchestrator (`app/engine.py`).
* **Type Safety**: Enforce strict Pydantic models for all tool inputs, outputs, and API payloads.
* **No Secrets Committed**: Store `GEMINI_API_KEY` in `.env` (never commit `.env`).
* **Deterministic Fallback**: All core demo scenarios must have verified entries in `data/cached_demo_responses.json`.
* **Governance (server-side, `backend/app/governance.py`)**: every data endpoint takes `Depends(get_principal)` (role via `X-RailKavach-Role`, purpose via `X-RailKavach-Purpose`; demo trust — swap for IdP tokens in prod). Role scope = `RoleProfile.data_scopes`; out-of-scope queries are refused and out-of-scope citations stripped. Personal data is pseudonymised by default for all roles; only `can_view_unmasked_pii` roles with purpose `SAFETY_INQUIRY`/`STATUTORY_INQUIRY` see identities. Every decision goes to the hash-chained audit log (`GET /api/audit`, Sr. DSO/CRS). Langfuse traces are always masked. New endpoints must use `require()` + `protect()`; register routes before the static `/` mount at the end of `main.py`. The frontend must never replace a 401/403 with cached data.
* **Accessibility**: Next.js UI must target WCAG 2.2 AA (color contrast, keyboard navigation, clear ARIA labels).
* **AiSPRY design system**: Tokens live in `frontend/tailwind.config.ts` (values from aispry.ai). Fonts: Fraunces (display), Geist (sans), JetBrains Mono (labels), Noto Sans Devanagari (Hindi). Orange `#f48220` is a fill; use `text-orange-ink` for orange text on light surfaces. Buttons 6px radius, cards 12px. Visual-first, minimal copy; every animation must degrade under `prefers-reduced-motion`.
* **Product order (always, everywhere)**: 1) Railcomm Analytics — Audio Analytics → nwradt.aispry.ai, 2) Locate — Locomotive Cabin Video Analytics → nwrlcva.aispry.ai, 3) Wagon Damage Detection → nwrwdd.aispry.ai. Logo → aispry.ai.

---

## 4. Key Directory Structure
```
RailKavach-Copilot/
├── AGENTS.md                  # Autonomous agent instructions & safety standards
├── CLAUDE.md                  # Developer commands & conventions
├── SKILLS.md                  # Agent skills specification & tool signatures
├── README.md                  # Master project overview & quickstart
├── data/                      # Synthetic railway datasets & fallback cache
│   ├── railcomm_transcripts.json
│   ├── locate_alerts.json
│   ├── wdd_inspections.json
│   └── cached_demo_responses.json
├── backend/                   # FastAPI backend service
│   ├── app/
│   │   ├── main.py            # API routes & middleware
│   │   ├── config.py          # Settings & model routing
│   │   ├── engine.py          # Gemini & Antigravity reasoning engine
│   │   ├── schemas/           # Pydantic v2 data models
│   │   └── skills/            # 6 Google AI Agent Skills
│   ├── tests/                 # Unit & integration tests
│   └── requirements.txt
├── frontend/                  # Next.js + TypeScript UI
│   ├── app/                   # App Router: layout (fonts), page (state), globals.css
│   ├── components/            # Navbar, Hero, ProductSuite, visuals, workspace/* panels
│   ├── lib/                   # api.ts (NEXT_PUBLIC_API_URL), data.ts, types.ts, privacy.ts
│   ├── package.json
│   └── tailwind.config.ts     # AiSPRY design tokens (single source of truth)
└── docs/                      # Architectural & compliance documentation
    ├── ARCHITECTURE_AND_PLAN.md
    ├── EVALUATION_GUIDE.md
    ├── cloud-costs-and-tokenometrics.md
    └── requirements-traceability-matrix.md
```
