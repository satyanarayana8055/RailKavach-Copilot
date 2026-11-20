# RailKavach AI Platform & RailKavach Copilot 🚆🛡️
> **Integrated AI Ecosystem for Indian Railways Safety, Inspection & Operational Intelligence**  
> *Developed by AiSPRY Technologies • Startup Buildathon India 2026 (Google DeepMind × Google Cloud × Hack2skill)*

---

## 📌 Fast Navigation
* **[docs/ENTERPRISE_SCALE_BEYOND_CLOUD_RUN.md](docs/ENTERPRISE_SCALE_BEYOND_CLOUD_RUN.md)**: Enterprise Scale Beyond Cloud Run (Dedicated GKE GPUs, Kafka, Cloud Interconnect, Edge AI).
* **[docs/HIGH_CONCURRENCY_ZERO_FAILURE_GUIDE.md](docs/HIGH_CONCURRENCY_ZERO_FAILURE_GUIDE.md)**: High-Concurrency & Zero-Failure Architecture (10,000+ users without Docker, K8s, or cloud services).
* **[docs/MASTER_STRATEGIC_DOSSIER.md](docs/MASTER_STRATEGIC_DOSSIER.md)**: Master Strategic, Technical & Presentation Dossier (Pitch Narrative, Google Cloud Suite, Legal Acts, ROCP Protocol).
* **[docs/GOOGLE_CLOUD_ENTERPRISE_ARCHITECTURE.md](docs/GOOGLE_CLOUD_ENTERPRISE_ARCHITECTURE.md)**: National-scale Google Cloud Backend Architecture (Cloud Run, AlloyDB, BigQuery, GCS, MCP, Vertex AI, Pub/Sub).
* **[docs/GOOGLE_AI_STUDIO_GUIDE.md](docs/GOOGLE_AI_STUDIO_GUIDE.md)**: Google AI Studio System Prompt & 3 Golden Demo Prompts.
* **[docs/HACK2SKILL_SUBMISSION_TEMPLATE.md](docs/HACK2SKILL_SUBMISSION_TEMPLATE.md)**: Official Event Submission answers (Problem, Solution, Architecture, Models).
* **[docs/PLUGGABLE_CONNECTORS_AND_EXTENSIBILITY.md](docs/PLUGGABLE_CONNECTORS_AND_EXTENSIBILITY.md)**: Open Connector Protocol (ROCP) & Pluggable Architecture for connecting future railway products (WILD, OHE, Kavach-TCAS).
* **[docs/STATUTORY_AND_LEGAL_COMPLIANCE.md](docs/STATUTORY_AND_LEGAL_COMPLIANCE.md)**: Statutory, Legal & Regulatory Compliance Framework (DPDP Act, Railways Act, BSA 2023, RDSO, CERT-In, RPF/RPUP, HOER).
* **[docs/ARCHITECTURE_AND_PLAN.md](docs/ARCHITECTURE_AND_PLAN.md)**: Master System Architecture & Phased Tactical Plan of Action (POA).
* **[docs/skills.md](docs/skills.md)**: Google Agent Skills specification (WDD, Locate, Railcomm tool signatures).
* **[docs/EVALUATION_GUIDE.md](docs/EVALUATION_GUIDE.md)**: Official evaluation matrix (30% Functional, 20% Architecture, 20% Google AI Depth) & winning pitch flow.
* **[docs/initial.md](docs/initial.md)**: Original shortlist briefing, schedule, and team communications.
* **[assets/railkavach_architecture.jpg](file:///c:/Users/satya/OneDrive/Documents/Google-Buildathon/RailKavach-Copilot/assets/railkavach_architecture.jpg)**: Pitch deck architecture infographic image (16:9 JPG).
* **[assets/architecture_diagram.svg](file:///c:/Users/satya/OneDrive/Documents/Google-Buildathon/RailKavach-Copilot/assets/architecture_diagram.svg)**: High-resolution visual architecture vector diagram (SVG).
* **[assets/architecture_visual.html](file:///c:/Users/satya/OneDrive/Documents/Google-Buildathon/RailKavach-Copilot/assets/architecture_visual.html)**: Interactive visual architecture web dashboard.

---

## 🏗️ The RailKavach Ecosystem: 3 Production Platforms

RailKavach is an integrated operational intelligence ecosystem connecting three specialized AI solutions:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               RAILKAVACH AI PLATFORMS                                  │
│                                                                                        │
│   ┌──────────────────────┐    ┌──────────────────────┐    ┌────────────────────────┐   │
│   │     PROJECT 01       │    │     PROJECT 02       │    │      PROJECT 03        │   │
│   │ Wagon Damage         │    │ Locate: Cabin Video  │    │ Railcomm: Audio        │   │
│   │ Detection (WDD)      │    │ Analytics            │    │ Analytics              │   │
│   │                      │    │                      │    │                        │   │
│   │ • 6 Gantry Cameras   │    │ • CVVRS Edge AI      │    │ • Denoising (9+ Noise) │   │
│   │ • YOLOv11-L + OCR    │    │ • YOLOv8 Detection   │    │ • U-Net + Transformer  │   │
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

1. **Wagon Damage Detection (WDD):** Automated freight wagon inspection using 6 gantry cameras, YOLOv11-L, and PaddleOCR across 8 damage classes. Automates entry-vs-exit condition differentials, slashing manual review from 5–8 hours to ~2 hours.
2. **Locate – Locomotive Cabin Video Analytics:** 24×7 edge-deployed CVVRS camera monitoring. Classifies **5 safety violations** (phone use, sleeping, eating/drinking, hand signal not returned, unauthorized occupant) while explicitly respecting **3 compliant activities** (walkie-talkie, reading/writing, controlling). Enforces human reviewer verification.
3. **Railcomm – Audio Analytics:** Real-time deep learning denoising pipeline (CNN + RNN + U-Net + Transformer) filtering 9+ noise classes while preserving safety-critical vocabulary (Caution, Stop, Signal, Block, Line Clear, BP Pressure). Enforces the strict **FAIL-OPEN** safety architecture (audio never goes silent if AI stalls).

---

## 🎯 What is RailKavach Copilot?
Indian Railways safety officers (Sr DEE/TRO, crew controllers, zonal safety cells) currently spend 3–5 days manually scrubbing gigabytes of audio and video dashboards to investigate incidents. At North Western Railway (NWR) alone, RailKavach processes **11,354 audio files**, **3.68M transcript lines**, and **1,583 loco pilots**.

**RailKavach Copilot** provides an autonomous conversational query layer on top of all three platforms:
1. **Cross-Modal Evidence Correlation:** Instantly links what was *said* (Railcomm radio transcript) with what was *seen* (Locate cab camera alert) and what was *sensed* (WDD wagon damage).
2. **Strict Grounding with Timestamp Citations:** Anchors every finding to exact split-second timestamps (`[03:14:15]`) and video clips.
3. **Bilingual Statutory Generation:** Drafts formal Indian Railways Inquiry Reports in English and crew lobby sign-on safety warning slips in Devanagari Hindi.
4. **Predictive Anomaly Engine:** Aggregates risk patterns (e.g. 02:00–05:00 AM micro-sleep clusters on specific sections).

---

## ⚙️ Architecture: Cloud-Agnostic & On-Premise Priority

The architecture is designed to operate seamlessly across on-premise railway infrastructure and cloud environments:
* **Core Base Stack:** FastAPI, React + Vite, PostgreSQL (relational/audit), MongoDB (events/detections), Celery + Redis (background processing), Edge Computing.
* **Storage & Vector Search Adapters:**
  * *Adapter A (On-Prem / Air-Gapped Priority):* PostgreSQL + `pgvector` / Qdrant, MinIO / Local Object Store.
  * *Adapter B (Cloud / Buildathon Mode):* Google Cloud Storage (GCS) and BigQuery Vector Search.
* **Pluggable Reasoning Engine:**
  * *Cloud / Buildathon Mode:* Google Gemini 1.5 Pro / Flash (long-context multimodal reasoning & function calling).
  * *On-Prem / Edge Mode:* Gemma 2B/7B or local LLM running directly inside locomotive cabs or division servers.
* **Zero-Latency Fallback Cache (`cached_demo_responses.json`):** Ensures 100% demo uptime at the Buildathon venue even during Wi-Fi dropouts.

---

## 🚀 How to Run the End-to-End Full-Stack System

### Quick Start (One Command)
```bash
./run_fullstack.sh
```
This launches:
1. **FastAPI Backend:** [http://localhost:8000](http://localhost:8000) (Interactive Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs))
2. **Next.js Frontend:** [http://localhost:3000](http://localhost:3000)

### Manual Service Launch

#### 1. Backend (FastAPI + GCS + Postgres + Gemini)
```bash
cd backend
.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend (Next.js 16 + React 19 + Tailwind CSS)
```bash
cd frontend
npm run dev
```

#### 3. Lightweight Streamlit Alternative
```bash
streamlit run app.py
```
