# RailKavach AI Platform & RailKavach Copilot 🚆🛡️
> **Integrated AI Ecosystem for Indian Railways Safety, Inspection & Operational Intelligence**  
> *Developed by AiSPRY Technologies • Startup Buildathon India 2026 (Google DeepMind × Google Cloud × Hack2skill)*

---

## 📌 Fast Navigation
* **[docs/ARCHITECTURE_AND_PLAN.md](file:///c:/Users/satya/OneDrive/Documents/Google-Buildathon/RailKavach-Copilot/docs/ARCHITECTURE_AND_PLAN.md)**: Master System Architecture & Phased Tactical Plan of Action (POA).
* **[docs/skills.md](file:///c:/Users/satya/OneDrive/Documents/Google-Buildathon/RailKavach-Copilot/docs/skills.md)**: Google Agent Skills specification (WDD, Locate, Railcomm tool signatures).
* **[docs/EVALUATION_GUIDE.md](file:///c:/Users/satya/OneDrive/Documents/Google-Buildathon/RailKavach-Copilot/docs/EVALUATION_GUIDE.md)**: Official evaluation matrix (30% Functional, 20% Architecture, 20% Google AI Depth) & winning pitch flow.
* **[docs/initial.md](file:///c:/Users/satya/OneDrive/Documents/Google-Buildathon/RailKavach-Copilot/docs/initial.md)**: Original shortlist briefing, schedule, and team communications.
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
