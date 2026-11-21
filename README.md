# RailKavach Copilot 🚆🛡️
> **Integrated Multimodal Operational Intelligence & Safety Assistant for Indian Railways**  
> *Developed by AiSPRY Technologies for North Western Railway (NWR) • Startup Buildathon India 2026 (Google DeepMind × Google Cloud × Hack2skill)*

---

## 📌 Executive Architecture & Ecosystem Overview

RailKavach Copilot provides an autonomous conversational query layer across Indian Railways' three operational AI safety platforms:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              RAILKAVACH PLATFORM CORE                                  │
│                                                                                        │
│   ┌──────────────────────┐    ┌──────────────────────┐    ┌────────────────────────┐   │
│   │     PLATFORM 01      │    │     PLATFORM 02      │    │      PLATFORM 03       │   │
│   │ Wagon Damage         │    │ Locate: Cabin Video  │    │ Railcomm: Audio        │   │
│   │ Detection (WDD)      │    │ Analytics            │    │ Analytics              │   │
│   │                      │    │                      │    │                        │   │
│   │ • 6 Gantry Cameras   │    │ • CVVRS Edge AI      │    │ • Denoising (9+ Noise) │   │
│   │ • YOLOv11-L + OCR    │    │ • YOLOv8 Detection   │    │ • Safety Vocabulary    │   │
│   │ • 8 Damage Classes   │    │ • 5 Violations       │    │ • Hindi/Eng Speech-Txt │   │
│   │ • Entry vs Exit Cmp  │    │ • 3 Compliant Acts   │    │ • Fail-Open Safety     │   │
│   └──────────┬───────────┘    └──────────┬───────────┘    └───────────┬────────────┘   │
└──────────────┼───────────────────────────┼────────────────────────────┼────────────────┘
               │                           │                            │
               └───────────────────────────┼────────────────────────────┘
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        RAILKAVACH COPILOT (INTELLIGENCE LAYER)                         │
│   Conversational Multimodal Safety Assistant • Cross-Modal Evidence Synchronizer       │
│   Bilingual Regulatory Report Generator • Predictive Anomaly & Fatigue Engine          │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Wagon Damage Detection (WDD)**: Automated rolling stock inspection via 6 gantry cameras, YOLOv11-L, and PaddleOCR across 8 damage classes. Automates entry-vs-exit condition differentials, slashing inspection times from 5–8 hours to ~2 hours.
2. **Locate – Locomotive Cabin Video Analytics**: 24×7 edge CVVRS camera monitoring classifying **5 safety violations** (`MOBILE_PHONE`, `SLEEPING`, `EATING_DRINKING`, `HAND_SIGNAL_NOT_RETURNED`, `UNAUTHORIZED_PERSON`) while explicitly recognizing **3 compliant activities** (`WALKIE_TALKIE`, `READING_WRITING`, `CONTROLLING`).
3. **Railcomm – Audio Analytics**: Real-time deep learning denoising pipeline filtering 9+ noise classes while preserving safety vocabulary (*Caution, Stop, Signal, Loop Line, Brake Pipe 5 kg/cm²*). Governed by the strict **Fail-Open** safety mandate.

---

## 🚀 Quickstart & Running Locally

### 1. Backend (FastAPI + Google GenAI Engine)
```bash
cd backend
source .venv/bin/activate
# Run test suite (14 passing tests)
PYTHONPATH=. pytest -v

# Start FastAPI server on port 8000
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at: `http://localhost:8000/docs`

### 2. Frontend (Next.js 14 + TypeScript + Tailwind CSS)
```bash
cd frontend
# Start Next.js development server on port 3000
npm run dev
```
Open your browser to: `http://localhost:3000`

---

## 🎯 Buildathon Evaluation Strategy (The 70% Core)

In compliance with the official evaluation matrix (30% Functional Implementation, 20% Architecture, 20% Google AI Depth):

1. **One-Click Preloaded Scenarios**:
   - 🚨 **Scenario 1 (Near-SPAD Inquiry)**: Query Train 12414 near Suratgarh. Correlates VHF caution order with cab camera mobile phone detection and emergency brake application at `[03:14:15]`.
   - 🌙 **Scenario 2 (Fatigue Clustering)**: Detects 02:00–05:00 AM micro-sleep clusters on long-distance night freight runs.
   - 🔍 **Scenario 3 (Transit Damage Audit)**: 6-gantry optical differential isolating newly sustained in-transit damage from pre-existing dents.
2. **Zero-Latency Fallback Cache (`data/cached_demo_responses.json`)**: Guarantees 100% demo uptime and 0 token cost even during venue Wi-Fi stutters.
3. **Token & Cost Optimization**: Clamps context windows to $\pm 15$m around incident timestamps, saving > 99.5% tokens versus raw log dumping.
4. **Bilingual Statutory Generation**: 1-click export of English CRS inquiry reports (Rule 113 G&SR) and Devanagari Hindi crew lobby sign-on warning slips.

---

## 📚 Key Governance & Instruction Files
* **[AGENTS.md](file:///Users/saibhargav/Documents/Projects/RailKavach-Copilot/AGENTS.md)**: Multi-agent coordination, Google Antigravity & Gemini guidelines.
* **[CLAUDE.md](file:///Users/saibhargav/Documents/Projects/RailKavach-Copilot/CLAUDE.md)**: Developer command reference & architecture rules.
* **[SKILLS.md](file:///Users/saibhargav/Documents/Projects/RailKavach-Copilot/SKILLS.md)**: Agent skills specifications & Pydantic tool schemas.
* **[docs/cloud-costs-and-tokenometrics.md](file:///Users/saibhargav/Documents/Projects/RailKavach-Copilot/docs/cloud-costs-and-tokenometrics.md)**: Mathematical token budget & cloud cost analysis.
* **[docs/requirements-traceability-matrix.md](file:///Users/saibhargav/Documents/Projects/RailKavach-Copilot/docs/requirements-traceability-matrix.md)**: Requirements traceability matrix (REQ-01 to REQ-10).
