# Developer Reference & Build Guide — RailKavach Copilot

## 1. Quick Reference & Technology Stack
* **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide React.
* **Backend**: FastAPI (Python 3.10+), Pydantic v2, Google GenAI SDK (`google-genai`), Uvicorn.
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
* **Accessibility**: Next.js UI must target WCAG 2.2 AA (color contrast, keyboard navigation, clear ARIA labels).

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
│   ├── src/
│   │   ├── app/               # Next.js App Router pages
│   │   ├── components/        # Reusable design system components
│   │   └── lib/               # API clients & bilingual dictionary
│   ├── package.json
│   └── tailwind.config.ts
└── docs/                      # Architectural & compliance documentation
    ├── ARCHITECTURE_AND_PLAN.md
    ├── EVALUATION_GUIDE.md
    ├── cloud-costs-and-tokenometrics.md
    └── requirements-traceability-matrix.md
```
