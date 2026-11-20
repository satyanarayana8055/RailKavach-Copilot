# Functional & Non-Functional Requirements — RailKavach Copilot

## 1. Stakeholders & User Roles

| Role | Operational Context | Primary Goals in Copilot |
| :--- | :--- | :--- |
| **Sr. Divisional Safety Officer (Sr. DSO)** | Division Headquarters | Conduct statutory inquiries on avoided SPADs; identify section-level safety hazards; review evidence clips. |
| **Sr. DEE / TRO (Traction Rolling Operation)** | Locomotive Operations | Track crew compliance; monitor mobile phone distractions and micro-sleep events; audit loco logbooks. |
| **Crew Controller (Lobby In-Charge)** | Crew Lobby Terminals | Issue pre-trip safety warning slips in Hindi Devanagari during biometric sign-on; counsel high-risk crews. |
| **Zonal Safety Cell / CRS** | Zonal Headquarters (NWR) | Cross-division safety trend audits; contractor rolling stock damage dispute settlements. |

---

## 2. Functional Requirements (FR)

* **FR-01: Voice Transcript Search**: The system shall search denoised VHF/Tetra radio transcripts by train number, section, time range, and Hindi/English safety vocabulary (*Caution Order, Home Signal, Loop Line, BP Pressure*).
* **FR-02: Compliant Activity Filtering**: The system shall distinguish legitimate operational acts (`WALKIE_TALKIE`, `READING_WRITING`, `CONTROLLING`) from actual safety violations, suppressing false alerts.
* **FR-03: Human-in-the-Loop Review**: The system shall track and display human reviewer verification status (`CONFIRMED`, `PENDING`, `REJECTED`) with reviewer ID and timestamp for every cabin violation alert.
* **FR-04: Wagon Damage Differential**: The system shall compare PaddleOCR wagon numbers and 8 defect classes across entry and exit gantries to isolate new transit damage liability.
* **FR-05: Multimodal Timeline Synchronization**: The system shall fuse radio callouts, cabin video alerts, and wagon defects into a single split-second chronological timeline.
* **FR-06: Bilingual Artifact Synthesis**: The system shall generate preliminary statutory inquiry reports in English (Rule 113 G&SR format) and crew lobby sign-on warning slips in Devanagari Hindi.
* **FR-07: Fatigue Cluster Analytics**: The system shall aggregate driver micro-sleep and distraction events across shifts and sections, highlighting high-risk night windows (02:00–05:00 AM).
* **FR-08: Zero-Latency Demo Mode**: The system shall provide instant pre-computed responses for core evaluation scenarios via a deterministic cache.

---

## 3. Non-Functional Requirements (NFR)

* **NFR-01: Fail-Open Safety Mandate**: Communication and telemetry pipelines must never block or silence live operational radio channels if AI processing crashes or stalls.
* **NFR-02: Token & Context Efficiency**: Context injected into the reasoning model shall not exceed 2,500 tokens per inquiry.
* **NFR-03: Response Latency**: Pre-cached demo queries shall respond in $< 100\text{ms}$; dynamic skill-augmented queries shall respond in $< 2.5\text{s}$.
* **NFR-04: Security & Air-Gap Compatibility**: The core operational stack must be deployable on-premises without mandatory public internet connectivity.
* **NFR-05: Accessibility**: UI must comply with WCAG 2.2 AA standards with a color contrast ratio $> 4.5:1$.
