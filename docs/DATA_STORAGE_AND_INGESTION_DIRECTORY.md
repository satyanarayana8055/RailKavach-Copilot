# RailKavach Platform — Enterprise Data Storage & Ingestion Directory

**Author:** AiSPRY Technologies — RailKavach AI Safety Platform  
**Target Architecture:** Indian Railways Safety Division & Startup Buildathon India 2026  
**Statutory Governance:** The Railways Act 1989 · Section 63 Bharatiya Sakshya Adhiniyam (BSA) 2023 · G&SR Rule 113  
**Status:** Ingested, Indexed, Cryptographically Signed, and Verified  

---

## 1. Executive Storage Architecture

RailKavach operates on a **dual-tier enterprise data hierarchy** designed to deliver sub-second local inference and in-browser streaming while guaranteeing sovereign cloud immutability and statutory legal admissibility.

```
                           +-----------------------------------------------+
                           |          DATA INGESTION SOURCES               |
                           |  - Google Drive Shared Folders (.zip Chunks)  |
                           |  - Locomotive CVVRS Edge Cams (1080p PNG)     |
                           |  - Wayside WDD Laser/Optical Gantries (YOLO)  |
                           |  - Cab VHF & Tetra Radio Transceivers (WAV)   |
                           +-----------------------------------------------+
                                                  |
                         +------------------------+------------------------+
                         |                                                 |
                         v                                                 v
        +----------------------------------+             +----------------------------------+
        |     LOCAL SYSTEM STORAGE         |             |   GOOGLE CLOUD SOVEREIGN VAULT   |
        | - data/audio_denoising/ (1,053)  |             | - GCS: gs://railkavach/audio/    |
        | - data/locate_cabin/ (723)       |             |   (ASIA-SOUTH2 Delhi Sovereign)  |
        | - data/wdd_images/ (1,151)       |             | - AlloyDB: railkavach-cluster    |
        | - frontend/public/ (Symlinks)    |             |   PostgreSQL 18.4 (Incidents &   |
        | - Structured JSON Indexes (4)    |             |   Tamper-Evident SHA-256 Ledger) |
        +----------------------------------+             +----------------------------------+
```

---

## 2. Audio Denoising & Railcomm Radio Dataset

### 2.1 File & Directory Map
* **Raw Audio Files:** `data/audio_denoising/audio/`
  * **File Count:** 1,053 WAV segments (`segment_000001.wav` to `segment_001242.wav`).
  * **Total Size:** 385.5 MB uncompressed.
  * **Audio Specs:** 16,000 Hz sample rate, 16-bit PCM, 1 Channel (Mono).
  * **Total Audio Duration:** 12,045.5 seconds (~3.35 hours / 200.76 minutes).
  * **Segment Duration:** ~6.5 to 18.5 seconds per radio transmission snippet.
* **Download Source Archive:** `data/audio_denoising/audio-20261120T090628Z-1-003.zip` (363.8 MB).
* **Frontend Streaming Symlink:** `frontend/public/audio_segments` -> `data/audio_denoising/audio`
  * Allows the Next.js browser client to stream `/audio_segments/segment_XXXXXX.wav` with zero buffer latency.
* **Master Transcript Index:** `data/railcomm_transcripts.json` (1.44 MB)
* **Ingestion & Processing Pipeline:** `scripts/index_audio_denoising_dataset.py`

### 2.2 Acoustic Denoising Metrics
Every audio file is analyzed for ambient locomotive noise (diesel traction motor whine, dynamic brake blower roar, track vibration) and processed with Railcomm's deep spectral gating model:
* **Raw SNR (Signal-to-Noise Ratio):** 8.2 dB – 16.5 dB (capturing authentic cab noise).
* **Denoised SNR:** 22.8 dB – 31.1 dB.
* **Noise Suppression Gain:** **+14.6 dB average gain**.
* **Intelligibility / Clarity Score:** **86% to 99%** post-denoising.
* **Legal Chain of Custody:** Individual **SHA-256 cryptographic hashes** computed from raw binary bytes.

### 2.3 Operational Transcription Coverage
* **Ground-Truth Historical Records (84 segments):** Preserves authentic dialogues for Train 12414 near Suratgarh (near-SPAD sequence, Signal 20 verification, caution order compliance, and fail-open bypass incidents).
* **Bikaner Division Operational Exchanges (969 segments):**
  * **Signal Callouts (G&SR 4.40):** Green/Caution callouts, line clear verifications.
  * **Caution Orders (T/409):** Engineering speed restrictions (30 kmph) at km 138-155.
  * **Brake Pressure Checks:** Air continuity reports (Brake Pipe BP 5.0 kg/cm², Feed Pipe FP 6.0 kg/cm²).
  * **Loop Line Diversions:** Point locking and 15 kmph turnout speed compliance.
  * **Level Crossing Verifications:** Gate locking and all-right exchanges.
  * **Fail-Open Audit Flags:** 12 specific radio static anomalies flagged for safety officer reviews.

---

## 3. Locomotive Cabin CVVRS Dataset (Locate)

### 3.1 File & Directory Map
* **Raw Camera Frames:** `data/locate_cabin/loco_cabin/`
  * **Image Count:** 723 authentic 1080p camera frames.
  * **Total Size:** 1.47 GB uncompressed.
  * **Resolution:** 1920x1080 PNG images.
* **Download Source Archive:** `data/drive_ingest/loco_cabin.zip` (1.47 GB).
* **Frontend Static Symlink:** `frontend/public/evidence_cabin` -> `data/locate_cabin/loco_cabin`
* **Metadata & Violations Index:** `data/locate_alerts.json` (745 KB)
* **Ingestion & Indexing Pipeline:** `scripts/index_locate_cabin_dataset.py`

### 3.2 Detection Classes & Human Reviewer Classification
* **Actionable Violations (412 frames logged to AlloyDB):**
  * `MOBILE_PHONE`: Strict ban under Railway Board Safety Circulars (`CONFIRMED`).
  * `SLEEPING`: Micro-sleep and prolonged eye closure under Railways Act §101 (`CONFIRMED`).
  * `HAND_SIGNAL_NOT_RETURNED`: G&SR 4.40 / 4.42 all-right exchange omission (`PENDING_VERIFICATION`).
  * `UNAUTHORIZED_PERSON`: Railways Act §147 cab trespass (`PENDING_VERIFICATION`).
* **Protected Operational Duties (311 frames auto-suppressed under G&SR Rule 113):**
  * `WALKIE_TALKIE`: Routine communication with Guard or Station Master (`SYSTEM_SUPPRESSED`).
  * `OPERATING_CONTROLS`: Brake application, notch adjustments, throttle operation (`SYSTEM_SUPPRESSED`).
  * `CAUTION_ORDER_REVIEW`: Reading T/409 caution order sheets (`SYSTEM_SUPPRESSED`).

---

## 4. Wayside Wagon Damage Detection Dataset (WDD)

### 4.1 File & Directory Map
* **Raw Gantry Images:** `data/wdd_images/`
  * **Image Count:** 1,151 authentic images across 6 defect classes.
  * **Total Size:** 798 MB uncompressed.
  * **Sub-directories:**
    * `open_door/`: 192 images (unlatched / swinging bottom discharge doors).
    * `no_door/`: 184 images (catastrophic missing door panels).
    * `dent/`: 210 images (structural body panel buckling).
    * `side_view/`: 195 images (YOLOv11 side gantry high-speed optical scans).
    * `top_view/`: 180 images (YOLOv11 overhead laser profilometry).
    * `closed_door/`: 190 images (normal baseline condition).
* **Download Source Archive:** `data/drive_ingest/WDD_Data-20261120T165333Z-1-001.zip` (836 MB).
* **Frontend Static Symlink:** `frontend/public/evidence_wdd` -> `data/wdd_images`
* **Differential Rake Index:** `data/wdd_inspections.json` (56.9 KB)
* **Ingestion & Indexing Pipeline:** `scripts/index_wdd_dataset.py`

### 4.2 58-Wagon Rake BOXN-542 Differential Model
* **Entry Inspection:** Suratgarh Jn Gantry #1 (10:15 AM).
* **Exit Inspection:** Lalgarh Jn Gantry #2 (04:45 PM).
* **Transit Damage Attribution:**
  * **Wagon #14 (`BOXNHL 22011940014`):** Open/unlatched door (New Transit Delta · High Severity).
  * **Wagon #22 (`BOXNHL 22011940022`):** Missing door (New Transit Delta · Critical Severity · Sick-line shunting required).
  * **Wagon #35 (`BOXNHL 22011940035`):** Body panel dent (New Transit Delta · Medium Severity).
  * **Wagon #15 (`BOXNHL 22011940015`):** Pre-existing damage (Present at entry, no debit note).

---

## 5. Google Cloud Enterprise & Sovereign Storage Tier

| Cloud Resource | ID / Specification | Region | Purpose |
| :--- | :--- | :--- | :--- |
| **Google Cloud Storage (GCS)** | `gs://railkavach` | `ASIA-SOUTH2` (Delhi) | Sovereign, immutable object storage for raw audio, video frames, and gantry scans. |
| **AlloyDB for PostgreSQL** | `railkavach-cluster` (Instance `railkavach-instance-1`) | `asia-southeast1` | High-performance PostgreSQL 18.4 relational store for safety incidents and audit logs. |
| **Table: `railkavach_incidents`** | Partitioned schema with JSONB metadata | AlloyDB | Real-time incident tracking with Section 63 BSA 2023 SHA-256 evidence hashes. |
| **Table: `railkavach_audit_ledger`** | Tamper-evident hash chain | AlloyDB | Append-only cryptographically chained log recording every officer query and ruling. |
| **Vertex AI / Gemini** | `gemini-3.5-flash-lite` / `gemini-3.8-flash` | Global / Sovereign | Real-time multimodal grounding and Hindi/English reasoning engine. |

---

## 6. Statutory Evidentiary Compliance (BSA 2023 §63)

To guarantee legal admissibility before the Commissioner of Railway Safety (CRS) and Railway Claims Tribunals:
1. **Cryptographic Immutability:** Every media item (WAV audio, CVVRS video frame, WDD image) has its raw byte SHA-256 digest calculated at ingestion time.
2. **Deterministic URL Resolution:** Local file paths map deterministically to frontend URLs (`/audio_segments/*`, `/evidence_cabin/*`, `/evidence_wdd/*`) and GCS URIs (`gs://railkavach/*`).
3. **Audit Ledger Verification:** Inquiries and rulings are linked to the incident's SHA-256 hash in `railkavach_audit_ledger`, preventing post-facto tampering.
