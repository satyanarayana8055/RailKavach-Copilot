# Global Railway Use Cases & Multimodal Voice Assistant — RailKavach Copilot
> **Vision:** The World's Most Advanced AI Operational Intelligence & Voice Assistant for Modern Railways

---

## 1. The Global Railway Vision
Modern railways across India, Europe (ERTMS/ETCS), North America (PTC), and East Asia (Shinkansen) produce vast oceans of operational media: radio audio, cabin video, wayside optical scans, signalling event logs, and printed caution orders. 

RailKavach Copilot unites all these fragmented silos into a **single conversational, voice-enabled intelligence layer**.

---

## 2. Ingestion Matrix: All 6 Railway File Types

| File Type | Extension | Railway Source | Extracted Insights |
| :--- | :---: | :--- | :--- |
| **Cab Radio Audio** | `.wav`, `.mp3` | VHF / Tetra Cab Channels, Intercom | Denoised speech-to-text, safety vocabulary (*Caution, Stop, Signal, BP Pressure*), Fail-Open status. |
| **Cabin & Track Video** | `.mp4`, `.mkv` | CVVRS Cab Cameras, Forward Track Cam, Pantograph Cam | Mobile phone distraction, micro-sleep, compliant acts (walkie-talkie), track obstacles, pantograph sparking. |
| **Optical Gantry Scans** | `.jpg`, `.png` | 6-Gantry Wayside Rolling Stock Inspection | 11-digit PaddleOCR wagon serials, 8 damage classes, entry-vs-exit transit damage differentials. |
| **Statutory Documents** | `.pdf`, `.txt` | Caution Order T/409, Line Clear Tickets, Loco Logbooks | Speed restrictions, temporary speed cautions, authorization tickets, crew sign-on timestamps. |
| **Brake & Speed Telemetry**| `.csv`, `.json`| Speed-o-Meter (SPM), Brake Pipe (BP) Recorders | Emergency brake application curves ($5.0 \to 0.0\text{ kg/cm}^2$), overspeeding violations. |
| **Interlocking & Signalling**| `.log`, `.dat` | Electronic Interlocking (EI), Kavach RFID Logs | Signal aspect transitions (Green $\to$ Yellow $\to$ Red), track circuit drop times. |

---

## 3. Comprehensive Global Use Cases

### 3.1 Division Control Room Voice Assistant (Hands-Free Dispatch)
* **Persona:** Senior Divisional Safety Officer (Sr. DSO), Section Controllers.
* **Workflow:** Instead of looking away from high-density signalling screens to type, controllers speak directly into their headsets:
  - *"Copilot, show all red signal callout discrepancies on Bikaner-Suratgarh line between 02:00 and 05:00 AM."*
  - Copilot responds verbally with instant voice synthesis while plotting the timeline.

### 3.2 Automated Multi-Document Cross-Verification (PDF vs Telemetry)
* **Persona:** Safety Audit Cell.
* **Workflow:** Uploads Caution Order PDF (mandating 30 kmph) alongside the locomotive's digital Speed-o-Meter CSV log. The Copilot detects speed overshoots to the exact second.

### 3.3 Sick-Line Shunting & Contractor Damage Recovery
* **Persona:** Senior Divisional Mechanical Engineer (Sr. DME / C&W).
* **Workflow:** Compares entry gantry photos against exit gantry photos across a 58-wagon freight rake. Automatically generates:
  - Digital Shunting Sick-Line Work Order for critical mechanical defects (broken spring, detached brake beam).
  - Transit Damage Debit Note legally holding siding contractors accountable for transit mishandling.

### 3.4 In-Cab Driver Alertness & Proactive Voice Warning (Edge Gemma)
* **Persona:** Loco Pilots (LP) and Assistant Loco Pilots (ALP).
* **Workflow:** Powered by on-device Gemma models inside the locomotive cab. When approaching a Caution Order section, the assistant verbally speaks:
  - *"सावधान: 2 किलोमीटर आगे होम सिग्नल लाल है। कौशन गति 30 किमी/घंटा बनाए रखें।"*

### 3.5 Biometric Lobby Sign-On Personalized Safety Briefing
* **Persona:** Crew Lobby Controllers.
* **Workflow:** Biometric driver check-in triggers an automated 20-second voice briefing summarizing hazards specific to their assigned train and route.

---

## 4. Voice Architecture & Accessibility
* **Bilingual Speech-to-Text (STT):** Leverages Web Speech API / Google Speech-to-Text supporting English and Devanagari Hindi.
* **Bilingual Text-to-Speech (TTS):** Authoritative audio playback with natural cadence.
* **Zero-Latency Fallback:** Pre-synthesized audio cues ensuring 100% demo resilience during live evaluation.
