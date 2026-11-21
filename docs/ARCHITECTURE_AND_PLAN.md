# RailKavach & RailKavach Copilot — Master Architecture & Tactical Plan of Action
> **Platform:** RailKavach AI Ecosystem (WDD • Locate • Railcomm) & RailKavach Copilot  
> **Organization:** AiSPRY Technologies | **Client/Industry:** Indian Railways  
> **Event Track:** Startup Buildathon India 2026 (Google DeepMind × Google Cloud × Hack2skill)  
> **Architecture Principle:** Pluggable, Cloud-Agnostic Core with On-Prem/Edge Priority & Google Cloud/AI Adapters  

---

## 1. Executive Summary & Master Project Context

### 1.1 The RailKavach AI Platform
**RailKavach** is an integrated AI-powered railway safety, inspection, monitoring, and operational intelligence ecosystem developed by **AiSPRY Technologies** for Indian Railways. 

RailKavach is not an isolated AI prototype; it is an end-to-end operational platform spanning data acquisition, real-time edge AI inference, event attribution, operational dashboards, alerts, human-in-the-loop verification, statutory reporting, and cryptographic evidence management.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                RAILKAVACH PLATFORM CORE                                │
│                                                                                        │
│   ┌──────────────────────┐    ┌──────────────────────┐    ┌────────────────────────┐   │
│   │     PROJECT 01       │    │     PROJECT 02       │    │      PROJECT 03        │   │
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

The ecosystem connects three specialized pillars:
1. **Wagon Damage Detection (WDD):** Automated freight rolling-stock inspection using 6 gantry cameras, YOLOv11-L, and PaddleOCR to identify 8 damage classes and compare entry-vs-exit condition differentials (reducing inspection time from 5–8 hours to ~2 hours).
2. **Locate – Locomotive Cabin Video Analytics:** 24×7 edge-deployed CVVRS camera monitoring classifying **5 safety violations** (phone use, sleeping, eating/drinking, hand signal not returned, unauthorized occupant) while explicitly respecting **3 compliant activities** (walkie-talkie, reading/writing, controlling). Operates with mandatory human reviewer verification.
3. **Railcomm – Audio Analytics:** Real-time AI denoising filtering 9+ railway noise classes while preserving safety-critical vocabulary (Caution, Stop, Signal, Block, Train numbers) in Hindi and English. Governed by a strict **FAIL-OPEN** architectural rule (audio never goes silent if AI stalls).

### 1.2 The RailKavach Copilot Role
While RailKavach processes vast amounts of data (at North Western Railway alone: **11,354 audio files**, **3.68 million transcript lines**, **1,583 loco pilots**), safety review and incident inquiry remain heavily manual. Officers spend days reading dashboard logs line-by-line.

**RailKavach Copilot** introduces an intelligent conversational query layer across all three pillars. Officers ask in Hindi or English: *"What went wrong on Train 12414 near Suratgarh?"* and the Copilot instantly correlates Railcomm audio, Locate cabin vision, and WDD wagon logs, providing grounded answers with exact timestamps (`[03:14:15]`), evidence clips, and ready-to-sign statutory reports.

---

## 2. Flexible, Cloud-Agnostic & On-Premise Architecture

### 2.1 Design Philosophy: Modularity & Zero Rigid Lock-In
Indian Railways operates under strict data sovereignty, security, and physical isolation (air-gapped networks, remote hill sections, tunnels). Therefore:
* **The core architecture does NOT hardcode or lock into proprietary cloud tools.**
* The base operational stack is open, industry-standard, and self-hostable on railway premises: **FastAPI, React + Vite, PostgreSQL, MongoDB, Celery, and Redis**.
* Cloud tools (such as Google Cloud Vertex AI, BigQuery Vector Search, and Cloud Storage) are implemented as **pluggable deployment adapters**, switchable via configuration without touching business logic.

```mermaid
flowchart TD
    subgraph STAGE1 ["STAGE 01: CAPTURE (Locomotive & Wayside)"]
        WDD_CAM["WDD: 6 Gantry Cameras<br/>(Entry & Exit Inspection)"]
        CAB_CAM["Locate: CVVRS Cabin Camera<br/>(Continuous Driver Monitoring)"]
        VHF_AUD["Railcomm: VHF / Tetra Radio<br/>(Operational Voice Streams)"]
    end

    subgraph STAGE2 ["STAGE 02: INFER (Edge & Real-Time AI Engines)"]
        WDD_AI["WDD Pipeline<br/>• YOLOv11-L (8 Damage Classes)<br/>• PaddleOCR (Wagon Numbers)"]
        LOCATE_AI["Locate Pipeline<br/>• YOLOv8 Activity Classification<br/>• 5 Violations & 3 Compliant Acts"]
        RAILCOMM_AI["Railcomm Pipeline<br/>• AI Denoising<br/>• Hindi/Eng Transcripts • FAIL-OPEN"]
        
        WDD_CAM --> WDD_AI
        CAB_CAM --> LOCATE_AI
        VHF_AUD --> RAILCOMM_AI
    end

    subgraph STAGE3 ["STAGE 03: ATTRIBUTE (Operational Normalization)"]
        WDD_ATTR["Entry vs Exit Damage Delta<br/>Bogie/Door/Coupler Tagging"]
        LOCATE_ATTR["Severity Classification<br/>Duplicate Suppression<br/>Reviewer Verification Queue"]
        RAILCOMM_ATTR["Audio Quality Scoring<br/>Safety Vocabulary Spotting<br/>(Caution, Stop, Signal, Block)"]

        WDD_AI --> WDD_ATTR
        LOCATE_AI --> LOCATE_ATTR
        RAILCOMM_AI --> RAILCOMM_ATTR
    end

    subgraph ADAPTERS ["STORAGE & VECTOR BACKEND (Pluggable Adapters)"]
        direction TB
        subgraph ONPREM ["Adapter A: On-Premise / Edge (Air-Gapped Default)"]
            PG["PostgreSQL (Relational/Audit)"]
            MONGO["MongoDB (Events/Detections)"]
            PGVEC["pgvector / Qdrant (Semantic Search)"]
            MINIO["MinIO / Local Object Store (Clips/Audio)"]
            REDIS["Celery + Redis (Task Queue)"]
        end

        subgraph CLOUD ["Adapter B: Cloud Deployment (Google Cloud Adapter)"]
            GCS["Cloud Storage (Audio/Video Media)"]
            BQ["BigQuery + Vector Search"]
            CR["Cloud Run (FastAPI Serverless)"]
        end
    end

    WDD_ATTR --> ADAPTERS
    LOCATE_ATTR --> ADAPTERS
    RAILCOMM_ATTR --> ADAPTERS

    subgraph COPILOT ["REASONING & INVESTIGATION: RAILKAVACH COPILOT"]
        direction TB
        ORCH["Copilot Orchestrator (FastAPI Service)"]
        
        subgraph LLM_PLUG ["Pluggable Reasoning Engine"]
            GEMINI["Google Gemini 1.5 Pro / Flash<br/>(Buildathon & Cloud Mode: Long-Context & Bilingual)"]
            GEMMA["Gemma 2B/7B / Local LLM<br/>(On-Prem Cab / Division Air-Gapped Mode)"]
        end

        subgraph SKILLS ["5 Google AI Agent Skills"]
            S1["Skill 1: railcomm_audio_search"]
            S2["Skill 2: locate_cabin_violation_check"]
            S3["Skill 3: wdd_wagon_damage_query"]
            S4["Skill 4: multimodal_timeline_synchronizer"]
            S5["Skill 5: bilingual_safety_report_generator"]
        end

        CACHE["Zero-Latency Fail-Safe Cache<br/>(cached_demo_responses.json)"]

        ORCH <--> LLM_PLUG
        ORCH <--> SKILLS
        ORCH <--> CACHE
        SKILLS <--> ADAPTERS
    end

    subgraph STAGE4 ["STAGE 04: SURFACE (Unified Platform UI)"]
        direction TB
        UI["Unified RailKavach Web Console (React / Streamlit)"]
        D1["Overview Dashboard"]
        D2["WDD Gantry Dashboard"]
        D3["Locate Cabin Dashboard"]
        D4["Railcomm Audio Dashboard"]
        D5["Copilot Conversational Console"]

        UI --> D1
        UI --> D2
        UI --> D3
        UI --> D4
        UI --> D5
        COPILOT <--> D5
    end

    subgraph STAGE5 ["STAGE 05: EVIDENCE & GOVERNANCE"]
        E1["Cryptographic Chain of Custody"]
        E2["Human Reviewer Verification Audit Trail"]
        E3["Division-Scoped RBAC & Data Isolation"]
        E4["Statutory Inquiry Reports (CRS / DSO)"]
        UI --> STAGE5
    end
```

---

### 2.2 The 5 Shared Platform Stages

| Stage | Operational Purpose | WDD Implementation | Locate Implementation | Railcomm Implementation |
| :--- | :--- | :--- | :--- | :--- |
| **Stage 01: CAPTURE** | Acquire raw data with split-second timestamps & spatial metadata. | 6 gantry camera streams (entry & exit gates). | In-cab CVVRS continuous video & audio streams. | Cab VHF/Tetra wireless channels & intercom audio. |
| **Stage 02: INFER** | Execute real-time or edge deep learning models. | YOLOv11-L for 8 damage classes; PaddleOCR for wagon codes. | YOLOv8 activity detection at the cab edge. | AI audio denoising + Hindi/English speech-to-text. |
| **Stage 03: ATTRIBUTE** | Convert model raw detections into structured railway events. | Entry vs exit damage differential comparison. | 5 violations vs 3 compliant acts, severity levels, duplicate suppression. | Noise classification (9+ classes), clarity score, safety vocabulary extraction. |
| **Stage 04: SURFACE** | Present actionable telemetry on role-based operator consoles. | Gantry damage viewer, defect heatmap, OCR logs. | Cabin alert feed, trip compliance scorecards, review queue. | Channel quality meters, live transcript streams, alert triggers. |
| **Stage 05: EVIDENCE** | Preserve tamper-proof operational records & audit trails. | Historical entry/exit image pairs, wagon repair orders. | Video evidence clips, reviewer decision logs, timestamp attribution. | Denoised + raw audio archive, fail-open audit log, communication transcripts. |

---

## 3. Strict Safety & Regulatory Compliance Principles

### 3.1 The Fail-Open Architectural Mandate (Railcomm)
Under Indian Railways safety doctrine, communication channels are life-critical.
* **The AI pipeline must NEVER become the cause of silence.**
* If the audio enhancement or speech-to-text service experiences latency, crash, or GPU exhaustion, the architecture immediately bypasses the AI layer and passes raw, unprocessed radio audio directly to the loco pilot and controller.
* AI processing is strictly side-channel/parallel; safety communication is non-blocking.

### 3.2 Human-in-the-Loop Reviewer Verification (Locate & WDD)
* **Never represent an unverified AI prediction as a confirmed operational violation.**
* Detections (e.g. mobile phone usage, drowsiness, or damaged draft gear) are initially tagged as `STATUS: PENDING_VERIFICATION`.
* Senior safety officers or designated reviewers must review the evidence clip and mark `STATUS: CONFIRMED` or `STATUS: REJECTED`.
* Every reviewer action stores an immutable audit record: Reviewer ID, Designation, Timestamp, and Justification.
* RailKavach Copilot explicitly indicates verification state during inquiries: e.g. *"Cab Cam detected mobile phone usage at [03:14:15] (Verified by Reviewer DSO-BKN at 06:30:00)"*.

### 3.3 Compliant Activity Distinction (Locate)
To prevent false alarms that degrade crew trust, the system explicitly recognizes and suppresses alerts for compliant operational tasks:
1. **Walkie-Talkie Usage:** Differentiated from illegal personal mobile phone use.
2. **Reading/Writing:** Differentiated from inattention (reviewing Caution Orders, Loco Logbook, or Line Clear Tickets).
3. **Controlling:** Operating throttle, dynamic brake, or vigilant foot pedal (A9/SA9 brake handles).

---

## 4. Google Agent Skills Specification (Grounded in Master Context)

The 5 Google AI Agent Skills are upgraded to seamlessly integrate with the authentic RailKavach data models:

### Skill 1: `railcomm_audio_search`
* **Trigger:** Queries regarding verbal exchanges, line clear tickets, caution orders, emergency calls, brake pipe tests, or signal confirmations.
* **Domain Context:** Searches Railcomm denoised transcripts; flags safety vocabulary (**Caution, Stop, Signal, Block, Train No, Loop Line, 5 kg/cm² BP**); handles Hindi, English, and railway Hinglish; logs Fail-Open status.
* **Signature:**
  ```json
  {
    "name": "search_railcomm_transcripts",
    "description": "Searches denoised radio communications across VHF/Tetra channels with railway vocabulary.",
    "parameters": {
      "type": "object",
      "properties": {
        "train_no": { "type": "string" },
        "section": { "type": "string" },
        "keyword": { "type": "string", "description": "e.g., 'लाल सिग्नल', 'Caution Order', 'Loop Line'" },
        "start_time": { "type": "string" },
        "end_time": { "type": "string" }
      },
      "required": ["keyword"]
    }
  }
  ```

### Skill 2: `locate_cabin_violation_check`
* **Trigger:** Queries regarding crew alertness, mobile phone usage, unauthorized persons, sleeping, or hand signal compliance.
* **Domain Context:** Queries Locate YOLOv8 detections; returns violation category, confidence, duration, evidence clip URI, and human reviewer status (`PENDING`, `CONFIRMED`, `REJECTED`); explicitly confirms no false triggers on compliant acts.
* **Signature:**
  ```json
  {
    "name": "get_locate_cabin_violations",
    "description": "Fetches verified and pending cabin video violation events from CVVRS footage.",
    "parameters": {
      "type": "object",
      "properties": {
        "loco_id": { "type": "string" },
        "violation_type": { 
          "type": "string", 
          "enum": ["MOBILE_PHONE", "SLEEPING", "EATING_DRINKING", "HAND_SIGNAL_NOT_RETURNED", "UNAUTHORIZED_PERSON", "ALL"] 
        },
        "verification_status": { "type": "string", "enum": ["ALL", "CONFIRMED_ONLY", "PENDING_ONLY"] },
        "time_window": { "type": "string" }
      },
      "required": ["loco_id"]
    }
  }
  ```

### Skill 3: `wdd_wagon_damage_query`
* **Trigger:** Queries regarding damaged rolling stock, hot axles, brake binding, hanging parts, or entry-vs-exit gantry discrepancies.
* **Domain Context:** Queries WDD 6-camera gantry records; correlates PaddleOCR wagon identification numbers with YOLOv11 8-class damage detections; computes entry-exit delta.
* **Signature:**
  ```json
  {
    "name": "get_wdd_wagon_damages",
    "description": "Retrieves freight wagon damage detections and entry-versus-exit comparison records.",
    "parameters": {
      "type": "object",
      "properties": {
        "train_no": { "type": "string" },
        "wagon_no": { "type": "string" },
        "damage_class": { "type": "string", "enum": ["BODY_PANEL", "DOOR_DEFECT", "BOGIE_CRACK", "COUPLER", "HANDRAIL", "BRAKE_BEAM", "SPRING_BROKEN", "ALL"] },
        "comparison_mode": { "type": "string", "enum": ["ALL", "NEW_DAMAGE_AT_EXIT_ONLY"] }
      }
    }
  }
  ```

### Skill 4: `multimodal_timeline_synchronizer`
* **Trigger:** Queries requiring root cause analysis (RCA), incident reconstruction, or cross-referencing radio audio with cabin video and track defects.
* **Domain Context:** Combines Railcomm audio callout timestamps with Locate cabin camera video timestamps and WDD wayside detections into a unified split-second sequence.
* **Signature:**
  ```json
  {
    "name": "build_incident_timeline",
    "description": "Fuses Railcomm voice, Locate video alerts, and WDD rolling stock records into a unified chronological timeline.",
    "parameters": {
      "type": "object",
      "properties": {
        "incident_id": { "type": "string" },
        "window_minutes_before": { "type": "integer", "default": 15 },
        "window_minutes_after": { "type": "integer", "default": 5 }
      },
      "required": ["incident_id"]
    }
  }
  ```

### Skill 5: `bilingual_safety_report_generator`
* **Trigger:** Drafting statutory Indian Railways inquiry documents or lobby sign-on safety instructions.
* **Domain Context:** Generates structured English statutory reports (following CRS/Sr DSO guidelines) and Devanagari Hindi crew lobby sign-on warning slips.
* **Signature:**
  ```json
  {
    "name": "generate_safety_artifacts",
    "description": "Generates bilingual inquiry reports and crew lobby sign-on slips with timestamp citations.",
    "parameters": {
      "type": "object",
      "properties": {
        "incident_id": { "type": "string" },
        "format": { "type": "string", "enum": ["STATUTORY_INQUIRY_REPORT", "CREW_LOBBY_BRIEFING", "ALL"] },
        "language": { "type": "string", "enum": ["BILINGUAL_HI_EN", "HINDI", "ENGLISH"] }
      },
      "required": ["incident_id", "format", "language"]
    }
  }
  ```

---

## 5. Master Plan of Action (POA) — Phased Implementation

### Phase 1: Context & Dataset Alignment (`data/`)
* [x] Integrate Master Context across WDD, Locate, and Railcomm.
* [ ] Generate realistic synthetic data reflecting authentic schemas:
  * `data/railcomm_transcripts.json`: 75+ lines of VHF audio transcripts with safety vocabulary (Caution, Stop, Signal, Block, Line Clear, BP Pressure) in Hindi/English with fail-open status.
  * `data/locate_alerts.json`: 25+ CVVRS detections (5 violation types + 3 compliant activities, confidence, reviewer confirmation state).
  * `data/wdd_inspections.json`: 15+ wagon gantry records (PaddleOCR wagon numbers, 8 damage classes, entry-vs-exit comparison).
  * `data/cached_demo_responses.json`: 5 pre-computed responses ensuring 100% demo uptime at the event venue.

### Phase 2: Core Engine & Skills Scaffolding (`src/`)
* [ ] Implement `src/skills/railcomm_search.py`
* [ ] Implement `src/skills/locate_violations.py`
* [ ] Implement `src/skills/wdd_damage.py`
* [ ] Implement `src/skills/timeline_sync.py`
* [ ] Implement `src/skills/report_gen.py`
* [ ] Build `src/engine.py`: Supports both Gemini API (cloud/Buildathon mode) and Local/Gemma mode via modular abstraction. Includes automatic failover to `cached_demo_responses.json`.

### Phase 3: Unified Dashboard & Copilot Console (`app.py`)
* [ ] Streamlit interface implementing:
  * Top navigation covering the Unified RailKavach ecosystem (Overview, WDD, Locate, Railcomm, Copilot Console).
  * 3 One-Click Scenario Buttons (SPAD Investigation, Fatigue Trend Analysis, Entry-vs-Exit Wagon Damage Audit).
  * Multi-Source Evidence Inspector (Side-by-side radio transcript + cab video badge + wagon damage record).
  * Reviewer verification status badge (`🟢 Verified by Reviewer` vs `🟡 Pending Verification`).
  * Bilingual toggle (English ⇋ हिन्दी Devanagari).
  * 1-Click PDF/Markdown Statutory Inquiry Export.

### Phase 4: Pitch Deck & Presentation Prep
* [ ] Update presentation slides with the 3 pillars, the 5 stages, and the flexible/on-prem architecture.
* [ ] Rehearse the 3-minute pitch emphasizing zero hardware footprint, NWR scale, and safety fail-open resilience.
