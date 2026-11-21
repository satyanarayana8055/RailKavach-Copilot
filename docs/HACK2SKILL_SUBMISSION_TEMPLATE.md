# Hack2skill Submission Checklist & Pitch Guide

> **Event:** Startup Buildathon India 2026 (Google DeepMind × Google Cloud × Hack2skill × NASSCOM × Headstart)  
> **Team:** AiSPRY Technologies | **Shortlisted Idea:** RailKavach Copilot  
> **Venue:** G. Narayanamma Institute of Technology and Science (GNITS), Hyderabad (20–21 Nov 2026)

---

## 1. Official Submission Parameter Mapping

Use this exact text and structure when filling the Hack2skill event submission template:

### 1. Problem Statement
> **Manual Safety Review Bottleneck at Scale:**  
> Indian Railways safety review remains overwhelmingly manual. At North Western Railway (NWR) alone, AiSPRY's deployed systems process **11,354 audio files, 3.68 million transcript lines, and tens of thousands of video feeds across 1,583 loco pilots**.  
> When a critical incident occurs (such as a Signal Passed at Danger - SPAD or derailment), safety officers (Sr. DEE/TRO, Sr. DSO) spend **3 to 5 days manually scrubbing and cross-referencing 3 disconnected dashboards**. Because data is siloed across separate systems, investigations are painfully slow, fatigue patterns are missed, and statutory Commission of Railway Safety (CRS) inquiries face severe reporting delays.

### 2. Proposed Solution
> **RailKavach Copilot — Autonomous Multimodal Safety Intelligence Layer:**  
> A conversational, multimodal safety assistant that sits on top of existing railway sensors with **zero new hardware footprint**. Railway officers ask in Hindi or English what went wrong on any train run, and the Copilot instantly cross-correlates:
> 1. What was **heard** on the locomotive cab radio (Railcomm VHF/Tetra speech-to-text transcripts),
> 2. What was **seen** inside the driver cabin (Locate CVVRS video vigilance detections),
> 3. What was **sensed** on the rolling stock and track (WDD 6-camera wagon inspection and Kavach axle sensors).  
> In under 15 seconds, it reconstructs a millisecond-grounded chronological timeline, highlights regulatory violations (mobile use, micro-sleep, brake binding), drafts statutory CRS inquiry reports, and issues bilingual crew lobby safety slips.

### 3. Solution Architecture
> **5-Stage Cloud-Agnostic Core with Pluggable Edge/Cloud Adapters:**
> * **Stage 01 (Capture):** Ingests in-cab CVVRS video, VHF wireless radio, wayside 6-camera gantry feeds, and trackside sensor streams with NTP microsecond clock synchronization.
> * **Stage 02 (Infer):** YOLOv8 cabin vigilance, YOLOv8 rolling stock damage detection, PaddleOCR wagon numbers, and deep learning audio denoising (Fail-Open architecture).
> * **Stage 03 (Attribute):** RailKavach Open Connector Protocol (ROCP) normalizing data into Canonical Railway Event envelopes.
> * **Stage 04 (Surface & Copilot Orchestration):** Google Gemini API / Gemma edge reasoning engine orchestrating 5 Google Agent Skills via dynamic tool discovery.
> * **Stage 05 (Evidence & Governance):** SHA-256 cryptographic chain of custody, Human-in-the-Loop review verification, and Section 63 Bharatiya Sakshya Adhiniyam, 2023 (BSA) electronic evidence certification.

### 4. Google AI Tools Used
> * **Google AI Studio:** Rapid prototyping, prompt engineering, multi-turn system instruction calibration, and multimodal function-calling testing.
> * **Google Agent Skills:** 5 custom tool contracts (`railcomm_audio_search`, `locate_cabin_violations`, `wdd_wagon_damages`, `multimodal_timeline_sync`, `bilingual_safety_report`).
> * **Google Antigravity:** CLI agent orchestration, subagent workflows, and multi-tool workspace scaffolding.

### 5. Google AI Models Used
> * **Google Gemini 1.5 Pro / Flash:** Core reasoning engine utilizing long-context windows (up to 2M tokens) for ingesting entire shifts of radio transcripts without fragmentation, structured tool calling, strict timestamp grounding, and bilingual English ⇋ Hindi Devanagari translation.
> * **Google Gemma (2B / 7B):** On-premise air-gapped deployment option running directly inside locomotive cabs or division servers for 100% offline edge privacy and zero cloud dependence.

---

## 2. Pitch Deck Checklist (Maximum 5 MB PDF)

Ensure the pitch deck follows the prescribed Hack2skill template and satisfies:
* [x] **File Format:** PDF only.
* [x] **File Size:** Under **5 MB** (compress images if necessary).
* [x] **Key Visuals Included:**
  * 3 Pillars diagram (WDD, Locate, Railcomm).
  * 5-Stage Architecture diagram (`docs/ARCHITECTURE_AND_PLAN.md`).
  * NWR Real Scale proof points (11,354 audio files, 3.68M lines, 1,583 pilots).
  * Pluggable ROCP Extensibility diagram.
  * Section 63 BSA 2023 evidence certification seal.

---

## 3. Important Reminders for Hackathon Logistics

1. **Google Cloud Event Credits Caution:**
   * Valid for 24 hours (12 hours to redeem, 12 hours to build).
   * **Do NOT redeem immediately** until confirming the designated billing account with the team lead.
2. **Offline Resilience (Venue Wi-Fi):**
   * The venue Wi-Fi may become congested. RailKavach Copilot includes **`data/cached_demo_responses.json`**, so the 3 demo scenarios will run at 0.1s latency even if internet drops completely!
3. **Data Privacy at Venue:**
   * All sample files in `data/` use synthetic and anonymized train numbers, loco IDs, and dates. No classified client files or live NWR credentials are exposed.
