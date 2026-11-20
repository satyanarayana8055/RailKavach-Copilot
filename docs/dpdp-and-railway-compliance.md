# Legal, Privacy & Statutory Compliance — RailKavach Copilot
> **Frameworks:** Digital Personal Data Protection (DPDP) Act 2023 • The Railways Act, 1989 • Indian Railways General & Subsidiary Rules (G&SR)

---

## 1. Digital Personal Data Protection (DPDP) Act, 2023 Compliance

As Indian Railways modernizes with locomotive cab cameras (CVVRS) and wayside sensors, crew audio and video constitute personal biometric and behavioral data. RailKavach Copilot enforces strict DPDP 2023 alignment:

### 1.1 Grounds for Processing & Purpose Limitation (Section 4 & Section 7)
* **Lawful Purpose:** Data acquisition from locomotive cabs is strictly authorized under **Section 7(b)** (performance of statutory functions under the Railways Act, 1989) and national public safety imperatives.
* **Purpose Restriction:** CVVRS footage and voice transcripts are cryptographically ring-fenced. They are legally barred from being used for commercial analytics, general advertising, or non-safety performance profiling.

### 1.2 Data Fiduciary & Processor Obligations (Section 8)
* **Zonal Railway as Data Fiduciary:** Indian Railways (e.g. North Western Railway) acts as the Data Fiduciary; AiSPRY Technologies acts as the verified Data Processor.
* **PII Masking & Pseudonymization:** 
  - In non-inquiry views (general dashboards, pattern analytics, or third-party audits), driver identity is masked: `LP-4412 (Rajesh Kumar)` ➔ `LP-**** (Anonymized)`.
  - Facial features in CVVRS clips undergo automated edge blurring unless unmasked by a gazetted safety officer with cryptographic credentials.

### 1.3 Human-in-the-Loop as a Safeguard Against Automated Penalty
* Under DPDP and natural justice principles, **no disciplinary action, off-rostering, or penalty can be issued based solely on raw AI model outputs**.
* Every alert enters `STATUS: PENDING_VERIFICATION`. Only an authorized human safety officer (Reviewer ID, Designation, Timestamp) can promote an alert to `STATUS: CONFIRMED` or `STATUS: REJECTED`.

---

## 2. Indian Railways Statutory Safety Framework

### 2.1 The Railways Act, 1989 (Sections 113 to 121)
* **Statutory Notice of Accidents (Section 113):** Whenever an accident, avoided collision, or near-SPAD occurs, the railway administration must report immediately to the **Commissioner of Railway Safety (CRS)**.
* **Evidentiary Grounding:** RailKavach Copilot structures reports according to Section 113 G&SR formats, embedding cryptographic evidence hashes (`HMAC-SHA256`) to ensure legal admissibility during formal CRS inquiry boards.

### 2.2 General & Subsidiary Rules (G&SR) Operating Compliance
1. **Signal Compliance (Rule 113 / 114):**
   - Mandatory callout and repeat between Loco Pilot (LP) and Assistant Loco Pilot (ALP).
   - Speed restrictions enforced on Loop Line entry (maximum 30 kmph or 15 kmph as per Caution Order T/409).
2. **Brake Pipe (BP) Telemetry:**
   - Continuous verification of 5.0 kg/cm² pressure in twin-pipe air brake trains.
   - Automatic detection of rapid emergency exhaust ($5.0 \to 0.0\text{ kg/cm}^2$) triggered by the RS Valve.

### 2.3 Railway Board Mobile Phone Directive (2020)
* Prohibits personal mobile phones on locomotive footplates while the train is in motion.
* **Compliant Act Differentiation:** The system explicitly distinguishes operational communication (**Walkie-Talkie VHF**) and **Caution Order Reading** from illegal smartphone use, preventing wrongful crew penalization.

### 2.4 The Fail-Open Architectural Mandate (Section 178)
* Under Indian Railways safety doctrine, communication lines are life-critical.
* If AI denoising encounters GPU starvation, out-of-memory, or software latency, the system **automatically bypasses the AI processor and passes raw radio audio directly to the driver**.
* Safety communication is non-blocking; the AI operates in parallel side-channel mode.
