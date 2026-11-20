# RailKavach Copilot — Agent Skills Specification

This document defines the specialized **Google AI Agent Skills** powering **RailKavach Copilot**. These skills enable Gemini to act as an autonomous safety investigation copilot for Indian Railways operations (Sr DEE/TRO, crew controllers, and zonal safety cells), searching multi-source evidence and generating bilingual compliance artifacts.

---

## Architecture Overview

```
                      ┌──────────────────────────────────────────┐
                      │    RailKavach Copilot (Gemini Core)      │
                      │  Multimodal • Bilingual (Hindi/English)  │
                      └─────────────────────┬────────────────────┘
                                            │ Function Calling / Tool Use
       ┌──────────────────┬─────────────────┼──────────────────┬──────────────────┐
       ▼                  ▼                 ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ Skill 1:      │  │ Skill 2:      │  │ Skill 3:      │  │ Skill 4:      │  │ Skill 5:      │
│ Transcript    │  │ Cab Vision    │  │ Multimodal    │  │ Bilingual     │  │ Safety        │
│ Evidence      │  │ Alert         │  │ Timeline      │  │ Report &      │  │ Pattern &     │
│ Retrieval     │  │ Correlation   │  │ Synchronizer  │  │ Briefing Gen  │  │ Anomaly Engine│
└───────────────┘  └───────────────┘  └───────────────┘  └───────────────┘  └───────────────┘
```

---

## 1. Skill: `transcript_evidence_retrieval`

### Purpose
Retrieves and analyzes cab-radio VHF/Tetra voice transmission transcripts between Loco Pilot (LP), Assistant Loco Pilot (ALP), Guard, and Station Master (SM) / Section Controller (SC). Handles railway jargon in Hindi, English, and Hinglish.

### Trigger Criteria
Invoked when user asks about verbal exchanges, line clears, signal callouts, brake pipe pressure checks, authority to proceed, or communication failures.

### Tool Signature
```json
{
  "name": "search_transcripts",
  "description": "Searches cab-radio communications by keywords, section, train number, or time range.",
  "parameters": {
    "type": "object",
    "properties": {
      "train_no": {
        "type": "string",
        "description": "Train number (e.g., '12414', 'BOXN-542')"
      },
      "section": {
        "type": "string",
        "description": "Railway section/division (e.g., 'Bikaner-Suratgarh', 'Jaipur-Rewari')"
      },
      "keyword": {
        "type": "string",
        "description": "Keywords in Hindi or English (e.g., 'लाल सिग्नल', 'Caution Order', 'Loop Line', 'Emergency')"
      },
      "start_time": {
        "type": "string",
        "description": "Start timestamp in ISO 8601 or HH:MM:SS"
      },
      "end_time": {
        "type": "string",
        "description": "End timestamp in ISO 8601 or HH:MM:SS"
      }
    },
    "required": ["keyword"]
  }
}
```

---

## 2. Skill: `cab_vision_alert_correlation`

### Purpose
Queries computer vision detections from cab-facing edge cameras (driver monitoring system). Detects human safety infractions and correlates them with operational events.

### Trigger Criteria
Invoked when querying drowsiness, micro-sleep, mobile phone usage, smoking, distraction, camera tampering/obstruction, or absence from seat.

### Tool Signature
```json
{
  "name": "get_cab_vision_alerts",
  "description": "Fetches AI vision detection events from locomotive cab cameras.",
  "parameters": {
    "type": "object",
    "properties": {
      "loco_id": {
        "type": "string",
        "description": "Locomotive identification number (e.g., 'WAP-7 30452')"
      },
      "alert_type": {
        "type": "string",
        "enum": ["DROWSINESS", "PHONE_USAGE", "SMOKING", "DISTRACTION", "CAMERA_OBSTRUCTION", "UNAUTHORIZED_PERSON", "ALL"],
        "description": "Category of cab-facing AI alert"
      },
      "min_confidence": {
        "type": "number",
        "description": "Minimum confidence threshold (0.0 to 1.0)"
      },
      "time_window": {
        "type": "string",
        "description": "Target time or interval (e.g., '02:00:00 - 05:00:00')"
      }
    },
    "required": ["alert_type"]
  }
}
```

---

## 3. Skill: `multimodal_timeline_synchronizer`

### Purpose
Correlates disparate event streams across time: aligns radio transcripts, cab vision infractions, and wagon defect records onto a unified chronological timeline leading up to an incident.

### Trigger Criteria
Invoked when performing root-cause analysis (RCA), reconstructing an incident sequence, or verifying what the crew was doing when a signal or defect occurred.

### Tool Signature
```json
{
  "name": "build_incident_timeline",
  "description": "Constructs an integrated chronological sequence across radio, video alerts, and track/wagon sensors.",
  "parameters": {
    "type": "object",
    "properties": {
      "incident_id": {
        "type": "string",
        "description": "Incident reference identifier"
      },
      "window_minutes_before": {
        "type": "integer",
        "description": "Minutes of context before the critical event (default 15)"
      },
      "window_minutes_after": {
        "type": "integer",
        "description": "Minutes of context after the critical event (default 5)"
      }
    },
    "required": ["incident_id"]
  }
}
```

---

## 4. Skill: `bilingual_report_briefing_generator`

### Purpose
Synthesizes verified evidence into formal Indian Railways regulatory formats:
1. **Statutory Incident Investigation Report** (for Sr. DSO / Commissioner of Railway Safety).
2. **Actionable Crew Briefing Note (Hindi & English)** (for Crew Controllers at lobby sign-on).

### Trigger Criteria
Invoked when user requests an incident summary, formal inquiry draft, or crew lobby safety warning.

### Tool Signature
```json
{
  "name": "generate_safety_artifacts",
  "description": "Generates structured bilingual incident reports and crew briefing slips with timestamp citations.",
  "parameters": {
    "type": "object",
    "properties": {
      "incident_id": {
        "type": "string",
        "description": "Identifier of the analyzed incident"
      },
      "format": {
        "type": "string",
        "enum": ["FULL_INQUIRY_REPORT", "CREW_LOBBY_BRIEFING", "EXECUTIVE_SUMMARY", "ALL"],
        "description": "Target report format"
      },
      "language": {
        "type": "string",
        "enum": ["BILINGUAL_HI_EN", "HINDI", "ENGLISH"],
        "description": "Language of the generated artifact"
      }
    },
    "required": ["incident_id", "format", "language"]
  }
}
```

---

## 5. Skill: `safety_pattern_anomaly_engine`

### Purpose
Aggregates safety data across divisions, loco pilots, sections, and shifts to surface systemic risks before an accident occurs (e.g., fatigue clusters between 02:00–04:00 AM on specific ghat sections).

### Trigger Criteria
Invoked when analyzing trends, repeat offenders, high-risk sections, or recurring signal miscommunications.

### Tool Signature
```json
{
  "name": "analyze_safety_patterns",
  "description": "Detects cluster anomalies and repeat violation trends across crews, sections, and shifts.",
  "parameters": {
    "type": "object",
    "properties": {
      "group_by": {
        "type": "string",
        "enum": ["CREW", "SECTION", "TIME_OF_DAY", "ALERT_TYPE"],
        "description": "Dimension along which to aggregate patterns"
      },
      "date_range": {
        "type": "string",
        "description": "Analysis period (e.g., 'LAST_7_DAYS', 'OCT_2026')"
      },
      "min_occurrences": {
        "type": "integer",
        "description": "Threshold for flagging as repeat pattern (default 3)"
      }
    },
    "required": ["group_by"]
  }
}
```

---

## Google AI Studio Prompt & Agent System Instructions

```text
You are RailKavach Copilot, an expert AI safety officer for Indian Railways.
Your job is to assist railway safety officers, crew controllers (Sr DEE/TRO), and inquiry committees.

Operating Principles:
1. Ground every statement with exact timestamps: [HH:MM:SS] or [Date HH:MM:SS].
2. Identify cross-modal evidence (e.g. "ALP warned of caution order at 03:14:20, but Cab Cam detected LP phone usage at 03:14:15").
3. Support seamless bilingual output in English and Hindi (Devanagari script).
4. Strictly maintain railway terminology (SPAD, Home Signal, Distant Signal, Caution Order, Loop Line, Brake Pipe, Loco Pilot, Guard, Station Master).
5. Highlight critical human factor violations: Drowsiness/Fatigue, Mobile Phone Distraction, Non-compliance with Callout Protocols.
```
