# Google Agent Skills Specification — RailKavach Copilot

This document specifies the **Google AI Agent Skills** powering **RailKavach Copilot**. Each skill is exposed as a typed Python function with a corresponding JSON schema for Google Gemini and Antigravity SDK tool calling.

---

## 1. Skill Registry Summary

| Skill Identifier | Functional Purpose | Data Source | Token Budget (I/O) |
| :--- | :--- | :--- | :---: |
| `search_railcomm_transcripts` | Search cab radio audio transcripts by keywords, section, train | `data/railcomm_transcripts.json` | 150 / 450 |
| `get_locate_cabin_violations` | Retrieve CVVRS video alerts (5 violations vs 3 compliant acts) | `data/locate_alerts.json` | 120 / 350 |
| `get_wdd_wagon_damages` | Query 6-gantry rolling stock defects & entry-vs-exit deltas | `data/wdd_inspections.json` | 100 / 300 |
| `build_incident_timeline` | Fuse audio, video, and wayside events into chronological timeline | Cross-modal synchronizer | 200 / 600 |
| `generate_safety_artifacts` | Synthesize bilingual CRS inquiry reports & Hindi sign-on slips | Template & LLM engine | 250 / 1200 |
| `analyze_safety_patterns` | Detect repeat micro-sleep clusters & section-level hazard trends | Aggregation analytics | 120 / 400 |

---

## 2. Detailed Tool Schemas

### Skill 1: `search_railcomm_transcripts`
* **Purpose**: Query denoised speech-to-text transcripts between Loco Pilot, ALP, Guard, and Station Master.
* **Safety Vocabulary**: `Caution Order`, `Stop`, `Home Signal`, `Loop Line`, `5.0 kg/cm² BP`, `Line Clear`.
* **Parameters**:
  ```json
  {
    "name": "search_railcomm_transcripts",
    "description": "Searches Railcomm denoised VHF/Tetra radio transcripts by keywords, train number, section, or time.",
    "parameters": {
      "type": "object",
      "properties": {
        "keyword": { "type": "string", "description": "Search term (e.g. 'लाल सिग्नल', 'Caution Order', 'Brake Pipe')" },
        "train_no": { "type": "string", "description": "Train number (e.g. '12414', 'BOXN-542')" },
        "section": { "type": "string", "description": "Railway section (e.g. 'Bikaner-Suratgarh')" },
        "start_time": { "type": "string", "description": "Start timestamp HH:MM:SS" },
        "end_time": { "type": "string", "description": "End timestamp HH:MM:SS" }
      },
      "required": ["keyword"]
    }
  }
  ```

### Skill 2: `get_locate_cabin_violations`
* **Purpose**: Fetch CVVRS in-cab computer vision detections, filtering compliant tasks.
* **Violations (5)**: `MOBILE_PHONE`, `SLEEPING`, `EATING_DRINKING`, `HAND_SIGNAL_NOT_RETURNED`, `UNAUTHORIZED_PERSON`.
* **Compliant Acts (3)**: `WALKIE_TALKIE`, `READING_WRITING`, `CONTROLLING`.
* **Parameters**:
  ```json
  {
    "name": "get_locate_cabin_violations",
    "description": "Fetches verified and pending cabin video violation events from CVVRS footage.",
    "parameters": {
      "type": "object",
      "properties": {
        "loco_id": { "type": "string", "description": "Loco number (e.g. 'WAP-7 30452')" },
        "violation_type": { 
          "type": "string", 
          "enum": ["MOBILE_PHONE", "SLEEPING", "EATING_DRINKING", "HAND_SIGNAL_NOT_RETURNED", "UNAUTHORIZED_PERSON", "ALL"] 
        },
        "verification_status": { "type": "string", "enum": ["ALL", "CONFIRMED_ONLY", "PENDING_ONLY"] },
        "time_window": { "type": "string", "description": "e.g. '03:00:00 - 03:30:00'" }
      },
      "required": ["loco_id"]
    }
  }
  ```

### Skill 3: `get_wdd_wagon_damages`
* **Purpose**: Search 8 wagon damage classes and entry-vs-exit condition differentials.
* **Damage Classes (8)**: `BODY_PANEL`, `DOOR_DEFECT`, `BOGIE_CRACK`, `COUPLER_DAMAGE`, `HANDRAIL_BROKEN`, `BRAKE_BEAM_DEFECT`, `SPRING_BROKEN`, `LADDER_DAMAGE`.
* **Parameters**:
  ```json
  {
    "name": "get_wdd_wagon_damages",
    "description": "Retrieves freight wagon damage detections and entry-versus-exit comparison records.",
    "parameters": {
      "type": "object",
      "properties": {
        "train_no": { "type": "string" },
        "wagon_no": { "type": "string" },
        "damage_class": { "type": "string", "enum": ["BODY_PANEL", "DOOR_DEFECT", "BOGIE_CRACK", "COUPLER_DAMAGE", "HANDRAIL_BROKEN", "BRAKE_BEAM_DEFECT", "SPRING_BROKEN", "LADDER_DAMAGE", "ALL"] },
        "comparison_mode": { "type": "string", "enum": ["ALL", "NEW_DAMAGE_AT_EXIT_ONLY"] }
      }
    }
  }
  ```

### Skill 4: `build_incident_timeline`
* **Purpose**: Temporal cross-modal fusion linking VHF audio, cabin camera alerts, and wagon damage logs.
* **Parameters**:
  ```json
  {
    "name": "build_incident_timeline",
    "description": "Fuses Railcomm voice, Locate video alerts, and WDD rolling stock records into a unified chronological sequence.",
    "parameters": {
      "type": "object",
      "properties": {
        "incident_id": { "type": "string", "description": "e.g. 'INC-12414-20261118'" },
        "window_minutes_before": { "type": "integer", "default": 15 },
        "window_minutes_after": { "type": "integer", "default": 5 }
      },
      "required": ["incident_id"]
    }
  }
  ```

### Skill 5: `generate_safety_artifacts`
* **Purpose**: Synthesizes formal English statutory inquiry reports (for CRS / Sr DSO) and Devanagari Hindi crew lobby warning slips.
* **Parameters**:
  ```json
  {
    "name": "generate_safety_artifacts",
    "description": "Generates structured bilingual incident reports and crew briefing slips with timestamp citations.",
    "parameters": {
      "type": "object",
      "properties": {
        "incident_id": { "type": "string" },
        "format": { "type": "string", "enum": ["STATUTORY_INQUIRY_REPORT", "CREW_LOBBY_BRIEFING", "EXECUTIVE_SUMMARY", "ALL"] },
        "language": { "type": "string", "enum": ["BILINGUAL_HI_EN", "HINDI", "ENGLISH"] }
      },
      "required": ["incident_id", "format", "language"]
    }
  }
  ```

### Skill 6: `analyze_safety_patterns`
* **Purpose**: Cluster analysis over shifts and sections to detect repeat risk patterns (e.g. 02:00–05:00 AM micro-sleep).
* **Parameters**:
  ```json
  {
    "name": "analyze_safety_patterns",
    "description": "Detects cluster anomalies and repeat violation trends across crews, sections, and shifts.",
    "parameters": {
      "type": "object",
      "properties": {
        "group_by": { "type": "string", "enum": ["CREW", "SECTION", "TIME_OF_DAY", "VIOLATION_TYPE", "WAGON_DEFECT"] },
        "date_range": { "type": "string" },
        "min_occurrences": { "type": "integer", "default": 3 }
      },
      "required": ["group_by"]
    }
  }
  ```
