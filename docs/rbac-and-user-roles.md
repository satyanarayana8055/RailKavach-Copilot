# Role-Based Access Control (RBAC) & Administrative Hierarchy — RailKavach Copilot
> **Framework:** Indian Railways Administrative Governance • DPDP Act 2023 • General & Subsidiary Rules (G&SR)

---

## 1. Domain Research: Indian Railways Administrative Structure
Indian Railways operates under a rigorous four-tiered operational hierarchy spanning the **Railway Board (Apex)**, **17 Zonal Railways**, **68 Operating Divisions**, and **Field Units** (Stations, Yards, Crew Lobbies).

When safety incidents occur, access to evidence, video surveillance, and disciplinary documentation must be strictly partitioned across role specializations to ensure **evidentiary integrity**, **natural justice**, and **DPDP Act 2023 compliance**.

```
┌────────────────────────────────────────────────────────────────────────┐
│               INDIAN RAILWAYS SAFETY & OPERATIONAL HIERARCHY           │
│                                                                        │
│   [STATUTORY]     Commissioner of Railway Safety (CRS)                 │
│                   (Independent under Ministry of Civil Aviation)       │
│                                │                                       │
│   [ZONAL HQ]      Principal Chief Safety Officer (PCSO)                │
│                   (Zonal Safety Overseer, North Western Railway)       │
│                                │                                       │
│   [DIVISION]      Sr. Divisional Safety Officer (Sr. DSO)              │
│                   Sr. Divisional Electrical Engineer (Sr. DEE/TRO)     │
│                   Sr. Divisional Mechanical Engineer (Sr. DME/C&W)     │
│                                │                                       │
│   [FIELD LEVEL]   Crew Controller (Lobby In-Charge)                    │
│                   Station Master / Section Controller (Traffic)        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Granular Role Definitions & Personas

### Role 1: Commissioner of Railway Safety (CRS) — `ROLE_CRS`
* **Administrative Level:** Ministry of Civil Aviation (Statutory Independent).
* **Operational Goal:** Conduct formal statutory inquiries into serious railway accidents, SPADs, and passenger fatalities under **Sections 113–121 of the Railways Act, 1989**.
* **Access Scope:** All Zones, all Divisions. Unrestricted access to raw cryptographic evidence hashes, full multi-source timeline, unmasked crew PII, and final statutory report ratification.

### Role 2: Senior Divisional Safety Officer (Sr. DSO) — `ROLE_SR_DSO`
* **Administrative Level:** Divisional Headquarters (e.g., Bikaner Division, NWR).
* **Operational Goal:** Primary divisional authority for root-cause analysis (RCA), post-incident investigations, and safety rule enforcement.
* **Access Scope:** Division-scoped. Full multimodal cross-correlation (Audio + Video + Sensor). Sole authority to promote raw AI alerts from `PENDING_VERIFICATION` to `CONFIRMED` or `REJECTED`. Approves and signs Rule 113 Preliminary Inquiry Reports.

### Role 3: Senior Divisional Electrical Engineer / Traction Rolling Operation (Sr. DEE/TRO) — `ROLE_SR_DEE`
* **Administrative Level:** Divisional Locomotive Wing.
* **Operational Goal:** Custodian of locomotive footplate discipline, loco pilot rostering, and alertness monitoring.
* **Access Scope:** Division locomotive fleet. Inspects driver in-cab CVVRS alerts (mobile phone use, micro-sleep), filters compliant acts (walkie-talkie, caution orders), and initiates crew counseling / off-rostering.

### Role 4: Senior Divisional Mechanical Engineer / Carriage & Wagon (Sr. DME/C&W) — `ROLE_SR_DME`
* **Administrative Level:** Divisional Rolling Stock Wing.
* **Operational Goal:** Rolling stock mechanical safety, freight rake turnaround, and wagon damage liability recovery.
* **Access Scope:** Freight yards and wayside gantries. Inspects WDD 6-gantry differentials, PaddleOCR wagon serials, broken springs, and unlatched flaps. Issues sick-line shunting work-orders and transit damage debit notes to siding contractors.

### Role 5: Crew Controller / Lobby In-Charge (CC) — `ROLE_CREW_CONTROLLER`
* **Administrative Level:** Crew Booking Lobbies (e.g., Suratgarh / Lalgarh Lobby).
* **Operational Goal:** Administers driver sign-on / sign-off, biometric authentication, and route safety briefings.
* **Access Scope:** Station / Lobby-scoped. Generates and vocalizes bilingual pre-trip safety warning slips (Devanagari Hindi). **Strictly barred from raw disciplinary files and unmasked biometric footage under DPDP Act 2023**.

---

## 3. Comprehensive RBAC Permissions Matrix

| Granular System Permission | `ROLE_CRS` (Statutory) | `ROLE_SR_DSO` (Safety Head) | `ROLE_SR_DEE` (Loco Fleet) | `ROLE_SR_DME` (Wagons) | `ROLE_CREW_CONTROLLER` (Lobby) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **View Incident Timeline RCA** | ✅ Global | ✅ Division | ✅ Locomotives | ❌ | ❌ |
| **View Raw CVVRS Video Clips** | ✅ Unmasked | ✅ Unmasked | ✅ Unmasked | ❌ | ❌ Masked Only |
| **Verify Alerts (CONFIRM/REJECT)** | ✅ Statutory | ✅ Full Sign-off | ⚠️ Recommend | ❌ | ❌ |
| **View Unmasked Crew PII (DPDP)** | ✅ Full PII | ✅ Full PII | ✅ Crew Roster | ❌ Redacted | ❌ Redacted |
| **Sign & Export CRS Reports** | ✅ Ratify | ✅ Draft & Sign | ❌ Read-Only | ❌ | ❌ |
| **WDD Gantry Damage Differentials** | ✅ Audit | ✅ Safety Review | ❌ | ✅ Work-Order | ❌ |
| **Sick-Line Shunting Work-Orders** | ❌ | ❌ | ❌ | ✅ Full Author | ❌ |
| **Crew Lobby Sign-on Briefings** | ❌ | ⚠️ Review | ⚠️ Review | ❌ | ✅ Print & Speak |
| **Night Shift Fatigue Analytics** | ✅ Macro | ✅ Division | ✅ Crew Clusters| ❌ | ⚠️ Lobby Alerts |

---

## 4. DPDP Act 2023 Privacy Scoping by Role

In compliance with **Section 8 of the DPDP Act 2023 (Data Fiduciary & Processor Obligations)**:
* **Principle of Least Privilege (PoLP):** Field operators (Crew Controllers, Yard Masters) only receive data required to prevent an immediate accident. Biometric facial coordinates and personal phone logs are cryptographically masked.
* **Gazetted Officer Elevation:** Only gazetted railway officers (Sr. DSO / Sr. DEE / CRS) hold the cryptographic key to unmask crew PII, and every unmasking event writes an immutable audit record:
  $$\text{Audit Entry} = \{\text{Officer ID}, \text{Designation}, \text{Crew ID}, \text{Timestamp}, \text{Inquiry Case ID}\}$$
