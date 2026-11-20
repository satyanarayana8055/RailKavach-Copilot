#!/usr/bin/env python3
"""
Synthetic Data Generator for RailKavach AI Platform
Generates authentic, schema-compliant railway data for:
1. data/railcomm_transcripts.json (Railcomm audio speech-to-text)
2. data/locate_alerts.json (Locate CVVRS cabin camera detections)
3. data/wdd_inspections.json (Wagon Damage Detection 6-gantry records)
4. data/cached_demo_responses.json (Zero-latency fallback cache)
"""

import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. Railcomm Transcripts (Audio Speech-to-Text)
# -------------------------------------------------------------
transcripts = [
    # Train 12414 (Mandore Express) - Suratgarh Section Incident (03:10:00 - 03:25:00)
    {
        "id": "RC-12414-001",
        "timestamp": "2026-11-18 03:10:15",
        "time_str": "03:10:15",
        "train_no": "12414",
        "loco_id": "WAP-7 30452",
        "section": "Bikaner-Suratgarh",
        "station": "Suratgarh Jn (SOG)",
        "channel": "VHF-CH02",
        "speaker": "Station Master SOG",
        "speaker_role": "STATION_MASTER",
        "transcript_hi": "गाड़ी संख्या 12414 लोको पायलट, सूरतगढ़ स्टेशन मास्टर सुनिए।",
        "transcript_en": "Train 12414 Loco Pilot, this is Suratgarh Station Master, acknowledge.",
        "safety_keywords": ["Train No 12414", "Station Master"],
        "clarity_score": 0.95,
        "fail_open_bypassed": False
    },
    {
        "id": "RC-12414-002",
        "timestamp": "2026-11-18 03:10:28",
        "time_str": "03:10:28",
        "train_no": "12414",
        "loco_id": "WAP-7 30452",
        "section": "Bikaner-Suratgarh",
        "station": "Suratgarh Jn (SOG)",
        "channel": "VHF-CH02",
        "speaker": "LP Rajesh Kumar",
        "speaker_role": "LOCO_PILOT",
        "transcript_hi": "हाँ स्टेशन मास्टर साहब, 12414 लोको पायलट राजेश बोल रहा हूँ। बोलिए।",
        "transcript_en": "Yes Station Master sir, LP Rajesh on 12414. Go ahead.",
        "safety_keywords": ["Loco Pilot", "12414"],
        "clarity_score": 0.92,
        "fail_open_bypassed": False
    },
    {
        "id": "RC-12414-003",
        "timestamp": "2026-11-18 03:11:05",
        "time_str": "03:11:05",
        "train_no": "12414",
        "loco_id": "WAP-7 30452",
        "section": "Bikaner-Suratgarh",
        "station": "Suratgarh Jn (SOG)",
        "channel": "VHF-CH02",
        "speaker": "Station Master SOG",
        "speaker_role": "STATION_MASTER",
        "transcript_hi": "12414, आपके लिए डाउन लूप लाइन तय की गई है। होम सिग्नल अभी लाल है, कौशन ऑर्डर 30 किमी/घंटा का पालन करें।",
        "transcript_en": "12414, Down Loop Line is set for you. Home Signal is at Danger (RED), maintain Caution Order 30 kmph.",
        "safety_keywords": ["Loop Line", "Home Signal", "लाल सिग्नल", "Caution Order 30 kmph"],
        "clarity_score": 0.94,
        "fail_open_bypassed": False
    },
    {
        "id": "RC-12414-004",
        "timestamp": "2026-11-18 03:11:22",
        "time_str": "03:11:22",
        "train_no": "12414",
        "loco_id": "WAP-7 30452",
        "section": "Bikaner-Suratgarh",
        "station": "Suratgarh Jn (SOG)",
        "channel": "VHF-CH02",
        "speaker": "ALP Amit Singh",
        "speaker_role": "ASSISTANT_LOCO_PILOT",
        "transcript_hi": "रिपीट: डाउन लूप लाइन, कौशन ऑर्डर 30 किमी/घंटा, होम सिग्नल लाल है। समझ गए।",
        "transcript_en": "Repeat: Down Loop Line, Caution Order 30 kmph, Home Signal Red. Acknowledged.",
        "safety_keywords": ["Loop Line", "Caution Order", "Home Signal", "Red"],
        "clarity_score": 0.91,
        "fail_open_bypassed": False
    },
    {
        "id": "RC-12414-005",
        "timestamp": "2026-11-18 03:13:45",
        "time_str": "03:13:45",
        "train_no": "12414",
        "loco_id": "WAP-7 30452",
        "section": "Bikaner-Suratgarh",
        "station": "Suratgarh Jn Approach",
        "channel": "CAB-INTERCOM",
        "speaker": "ALP Amit Singh",
        "speaker_role": "ASSISTANT_LOCO_PILOT",
        "transcript_hi": "डिस्टेंट सिग्नल येलो है, गति कम कीजिए सर।",
        "transcript_en": "Distant Signal is Yellow (Attention), reduce speed sir.",
        "safety_keywords": ["Distant Signal", "Yellow", "Speed Reduction"],
        "clarity_score": 0.89,
        "fail_open_bypassed": False
    },
    {
        "id": "RC-12414-006",
        "timestamp": "2026-11-18 03:14:15",
        "time_str": "03:14:15",
        "train_no": "12414",
        "loco_id": "WAP-7 30452",
        "section": "Bikaner-Suratgarh",
        "station": "Suratgarh Jn Approach",
        "channel": "CAB-INTERCOM",
        "speaker": "ALP Amit Singh",
        "speaker_role": "ASSISTANT_LOCO_PILOT",
        "transcript_hi": "सर ध्यान दीजिए! फोन रखिए, सामने होम सिग्नल लाल (Danger) है! ब्रेक लगाइए!",
        "transcript_en": "Sir pay attention! Put down the phone, Home Signal ahead is RED (Danger)! Apply brakes!",
        "safety_keywords": ["Phone", "Home Signal", "लाल (Danger)", "Emergency Brake"],
        "clarity_score": 0.96,
        "fail_open_bypassed": False
    },
    {
        "id": "RC-12414-007",
        "timestamp": "2026-11-18 03:14:24",
        "time_str": "03:14:24",
        "train_no": "12414",
        "loco_id": "WAP-7 30452",
        "section": "Bikaner-Suratgarh",
        "station": "Suratgarh Jn Approach",
        "channel": "CAB-INTERCOM",
        "speaker": "LP Rajesh Kumar",
        "speaker_role": "LOCO_PILOT",
        "transcript_hi": "आपातकालीन ब्रेक (RS Valve) लगाया! बीपी प्रेशर 0 हो गया!",
        "transcript_en": "Emergency brake (RS Valve) applied! Brake Pipe pressure dropped to 0 kg/cm²!",
        "safety_keywords": ["Emergency Brake", "RS Valve", "Brake Pipe Pressure 0 kg/cm²"],
        "clarity_score": 0.94,
        "fail_open_bypassed": False
    },
    {
        "id": "RC-12414-008",
        "timestamp": "2026-11-18 03:14:48",
        "time_str": "03:14:48",
        "train_no": "12414",
        "loco_id": "WAP-7 30452",
        "section": "Bikaner-Suratgarh",
        "station": "Suratgarh Jn Approach",
        "channel": "VHF-CH02",
        "speaker": "LP Rajesh Kumar",
        "speaker_role": "LOCO_PILOT",
        "transcript_hi": "सूरतगढ़ स्टेशन मास्टर, 12414 होम सिग्नल से 60 मीटर पहले पूर्ण विराम में खड़ी है।",
        "transcript_en": "Suratgarh Station Master, 12414 has come to a complete halt 60 meters before Home Signal.",
        "safety_keywords": ["Home Signal", "Complete Halt", "Safety Margin 60m"],
        "clarity_score": 0.93,
        "fail_open_bypassed": False
    },
    {
        "id": "RC-12414-009",
        "timestamp": "2026-11-18 03:15:10",
        "time_str": "03:15:10",
        "train_no": "12414",
        "loco_id": "WAP-7 30452",
        "section": "Bikaner-Suratgarh",
        "station": "Suratgarh Jn (SOG)",
        "channel": "VHF-CH02",
        "speaker": "Station Master SOG",
        "speaker_role": "STATION_MASTER",
        "transcript_hi": "12414 लोको पायलट, सिग्नल क्रॉस नहीं हुआ। अपनी स्थिति वहीं बनाए रखें। कंट्रोलर को सूचित कर रहा हूँ।",
        "transcript_en": "12414 LP, signal not passed (no SPAD). Maintain position. Informing Section Controller.",
        "safety_keywords": ["No SPAD", "Maintain Position", "Section Controller"],
        "clarity_score": 0.95,
        "fail_open_bypassed": False
    },
    # Routine & Fail-Open Demonstration Calls
    {
        "id": "RC-GEN-010",
        "timestamp": "2026-11-18 02:45:10",
        "time_str": "02:45:10",
        "train_no": "BOXN-542",
        "loco_id": "WAG-9 31204",
        "section": "Lalgarh-Bikaner",
        "station": "Lalgarh Jn",
        "channel": "VHF-CH01",
        "speaker": "LP S. Sharma",
        "speaker_role": "LOCO_PILOT",
        "transcript_hi": "लाल सिग्नल क्लीयर हुआ, ग्रीन आस्पेक्ट। बीपी प्रेशर 5.0 किग्रा/सेमी² नॉर्मल।",
        "transcript_en": "Red signal cleared to Green aspect. Brake Pipe pressure 5.0 kg/cm² normal.",
        "safety_keywords": ["Green Aspect", "Brake Pipe Pressure 5.0 kg/cm²"],
        "clarity_score": 0.88,
        "fail_open_bypassed": False
    },
    {
        "id": "RC-GEN-011",
        "timestamp": "2026-11-18 04:15:20",
        "time_str": "04:15:20",
        "train_no": "14707",
        "loco_id": "WDP-4D 40112",
        "section": "Bikaner-Suratgarh",
        "station": "Lunkaransar",
        "channel": "VHF-CH02",
        "speaker": "LP V. Joshi",
        "speaker_role": "LOCO_PILOT",
        "transcript_hi": "कौशन ऑर्डर टी/409 प्राप्त हुआ, किलोमीटर 140 पर गति प्रतिबंध 45 किमी/घंटा।",
        "transcript_en": "Caution Order T/409 received, speed restriction 45 kmph at KM 140.",
        "safety_keywords": ["Caution Order T/409", "Speed Restriction 45 kmph"],
        "clarity_score": 0.72,
        "fail_open_bypassed": True  # Demonstrating Fail-Open architecture
    }
]

# Generate more routine transcripts to simulate 80+ lines
for i in range(12, 85):
    t_hour = 2 + (i // 25)
    t_min = (i * 3) % 60
    t_sec = (i * 7) % 60
    ts_str = f"2026-11-18 0{t_hour}:{t_min:02d}:{t_sec:02d}"
    transcripts.append({
        "id": f"RC-GEN-{i:03d}",
        "timestamp": ts_str,
        "time_str": f"0{t_hour}:{t_min:02d}:{t_sec:02d}",
        "train_no": "12414" if i % 4 == 0 else f"BOXN-{500 + i}",
        "loco_id": "WAP-7 30452" if i % 4 == 0 else f"WAG-9 {31000 + i}",
        "section": "Bikaner-Suratgarh" if i % 2 == 0 else "Lalgarh-Bikaner",
        "station": "Bikaner Jn" if i % 3 == 0 else "Suratgarh Jn",
        "channel": "VHF-CH02",
        "speaker": "LOCO_PILOT" if i % 2 == 0 else "STATION_MASTER",
        "speaker_role": "LOCO_PILOT" if i % 2 == 0 else "STATION_MASTER",
        "transcript_hi": f"सिग्नल नंबर {i} की स्थिति सामान्य, लाइन क्लीयर है।",
        "transcript_en": f"Signal No {i} status normal, line is clear.",
        "safety_keywords": ["Signal Status Normal", "Line Clear"],
        "clarity_score": round(0.85 + (i % 10) * 0.01, 2),
        "fail_open_bypassed": (i == 42 or i == 68)
    })

# -------------------------------------------------------------
# 2. Locate Cabin Video Analytics Alerts (CVVRS Edge)
# -------------------------------------------------------------
locate_alerts = [
    # Focal incident violation on Train 12414 (Mobile Phone distraction)
    {
        "id": "LOC-20261118-001",
        "timestamp": "2026-11-18 03:14:02",
        "time_str": "03:14:02",
        "loco_id": "WAP-7 30452",
        "train_no": "12414",
        "crew_id": "LP-4412 (Rajesh Kumar)",
        "section": "Bikaner-Suratgarh",
        "violation_type": "MOBILE_PHONE",
        "is_compliant_activity": False,
        "confidence": 0.94,
        "duration_seconds": 28,
        "clip_uri": "minio://locate-clips/20261118/WAP7_30452_031402_phone.mp4",
        "verification_status": "CONFIRMED",
        "reviewer_id": "DSO-BKN-01 (Sr. Divisional Safety Officer)",
        "reviewed_at": "2026-11-18 06:30:15",
        "reviewer_notes": "Driver clearly observed holding mobile phone in right hand while approaching Home Signal.",
        "complaint_check": "Non-compliant. Phone held to ear; walkie-talkie remained on hook."
    },
    # Compliant activity demonstration (Walkie-Talkie - NOT A VIOLATION)
    {
        "id": "LOC-20261118-002",
        "timestamp": "2026-11-18 03:10:25",
        "time_str": "03:10:25",
        "loco_id": "WAP-7 30452",
        "train_no": "12414",
        "crew_id": "LP-4412 (Rajesh Kumar)",
        "section": "Bikaner-Suratgarh",
        "violation_type": "WALKIE_TALKIE",
        "is_compliant_activity": True,
        "confidence": 0.96,
        "duration_seconds": 15,
        "clip_uri": "minio://locate-clips/20261118/WAP7_30452_031025_walkie.mp4",
        "verification_status": "CONFIRMED",
        "reviewer_id": "SYSTEM_SUPPRESSED",
        "reviewed_at": "2026-11-18 03:10:26",
        "reviewer_notes": "Compliant activity: Driver used VHF handset to acknowledge Station Master.",
        "complaint_check": "Compliant act. Properly recognized as VHF radio, suppressed from violation queue."
    },
    # Compliant activity demonstration (Reading Caution Order)
    {
        "id": "LOC-20261118-003",
        "timestamp": "2026-11-18 02:30:10",
        "time_str": "02:30:10",
        "loco_id": "WAP-7 30452",
        "train_no": "12414",
        "crew_id": "ALP-5519 (Amit Singh)",
        "section": "Bikaner-Suratgarh",
        "violation_type": "READING_WRITING",
        "is_compliant_activity": True,
        "confidence": 0.91,
        "duration_seconds": 40,
        "clip_uri": "minio://locate-clips/20261118/WAP7_30452_023010_caution.mp4",
        "verification_status": "CONFIRMED",
        "reviewer_id": "SYSTEM_SUPPRESSED",
        "reviewed_at": "2026-11-18 02:30:12",
        "reviewer_notes": "Compliant: Reviewing printed Caution Order document T/409.",
        "complaint_check": "Compliant act: Document inspection legitimate."
    },
    # Fatigue Cluster Pattern Violations (02:00 - 05:00 AM Window)
    {
        "id": "LOC-20261118-004",
        "timestamp": "2026-11-18 03:45:12",
        "time_str": "03:45:12",
        "loco_id": "WAG-9 31204",
        "train_no": "BOXN-542",
        "crew_id": "LP-3108 (S. Sharma)",
        "section": "Lalgarh-Bikaner",
        "violation_type": "SLEEPING",
        "is_compliant_activity": False,
        "confidence": 0.88,
        "duration_seconds": 12,
        "clip_uri": "minio://locate-clips/20261118/WAG9_31204_034512_drowsy.mp4",
        "verification_status": "CONFIRMED",
        "reviewer_id": "DSO-BKN-01",
        "reviewed_at": "2026-11-18 07:15:00",
        "reviewer_notes": "Micro-sleep detected: Eye closure > 4 seconds; head nodding.",
        "complaint_check": "Violation confirmed. Fatigue counseling recommended."
    },
    {
        "id": "LOC-20261118-005",
        "timestamp": "2026-11-18 04:12:05",
        "time_str": "04:12:05",
        "loco_id": "WAG-9 31882",
        "train_no": "BOXN-611",
        "crew_id": "LP-2891 (M. K. Verma)",
        "section": "Bikaner-Suratgarh",
        "violation_type": "SLEEPING",
        "is_compliant_activity": False,
        "confidence": 0.92,
        "duration_seconds": 16,
        "clip_uri": "minio://locate-clips/20261118/WAG9_31882_041205_drowsy.mp4",
        "verification_status": "CONFIRMED",
        "reviewer_id": "DSO-BKN-01",
        "reviewed_at": "2026-11-18 07:22:00",
        "reviewer_notes": "Confirmed micro-sleep incident during night shift.",
        "complaint_check": "Violation confirmed."
    },
    {
        "id": "LOC-20261118-006",
        "timestamp": "2026-11-18 04:38:22",
        "time_str": "04:38:22",
        "loco_id": "WDP-4D 40112",
        "train_no": "14707",
        "crew_id": "LP-5012 (V. Joshi)",
        "section": "Bikaner-Suratgarh",
        "violation_type": "SLEEPING",
        "is_compliant_activity": False,
        "confidence": 0.85,
        "duration_seconds": 9,
        "clip_uri": "minio://locate-clips/20261118/WDP4_40112_043822_drowsy.mp4",
        "verification_status": "PENDING_VERIFICATION",
        "reviewer_id": None,
        "reviewed_at": None,
        "reviewer_notes": "Pending officer morning verification.",
        "complaint_check": "Awaiting manual verification."
    },
    {
        "id": "LOC-20261118-007",
        "timestamp": "2026-11-18 01:15:30",
        "time_str": "01:15:30",
        "loco_id": "WAP-7 30211",
        "train_no": "12457",
        "crew_id": "LP-6101 (R. Meena)",
        "section": "Rewari-Bikaner",
        "violation_type": "HAND_SIGNAL_NOT_RETURNED",
        "is_compliant_activity": False,
        "confidence": 0.89,
        "duration_seconds": 8,
        "clip_uri": "minio://locate-clips/20261118/WAP7_30211_handsignal.mp4",
        "verification_status": "CONFIRMED",
        "reviewer_id": "DSO-BKN-02",
        "reviewed_at": "2026-11-18 08:00:00",
        "reviewer_notes": "Station Master showed all-right green hand lamp; LP failed to exchange hand signal.",
        "complaint_check": "Violation confirmed."
    },
    {
        "id": "LOC-20261118-008",
        "timestamp": "2026-11-18 02:05:10",
        "time_str": "02:05:10",
        "loco_id": "WAG-9 31540",
        "train_no": "BCN-201",
        "crew_id": "LP-7044 (P. Choudhary)",
        "section": "Bikaner-Suratgarh",
        "violation_type": "UNAUTHORIZED_PERSON",
        "is_compliant_activity": False,
        "confidence": 0.93,
        "duration_seconds": 120,
        "clip_uri": "minio://locate-clips/20261118/WAG9_31540_unauth.mp4",
        "verification_status": "CONFIRMED",
        "reviewer_id": "DSO-BKN-01",
        "reviewed_at": "2026-11-18 07:45:00",
        "reviewer_notes": "Third unidentified individual observed standing in cab without authority ticket.",
        "complaint_check": "Violation confirmed."
    }
]

# Add more alerts to reach 26 total alerts
for j in range(9, 27):
    v_types = ["EATING_DRINKING", "SLEEPING", "MOBILE_PHONE", "CONTROLLING", "WALKIE_TALKIE"]
    chosen_type = v_types[j % len(v_types)]
    is_compliant = chosen_type in ["CONTROLLING", "WALKIE_TALKIE"]
    locate_alerts.append({
        "id": f"LOC-20261118-{j:03d}",
        "timestamp": f"2026-11-18 0{3 + (j % 3)}:{j * 2:02d}:15",
        "time_str": f"0{3 + (j % 3)}:{j * 2:02d}:15",
        "loco_id": f"WAG-9 {31200 + j}",
        "train_no": f"FREIGHT-{700 + j}",
        "crew_id": f"LP-{4000 + j}",
        "section": "Bikaner-Suratgarh",
        "violation_type": chosen_type,
        "is_compliant_activity": is_compliant,
        "confidence": round(0.82 + (j % 15) * 0.01, 2),
        "duration_seconds": 10 + (j % 20),
        "clip_uri": f"minio://locate-clips/20261118/clip_{j}.mp4",
        "verification_status": "CONFIRMED" if not is_compliant else "SYSTEM_SUPPRESSED",
        "reviewer_id": "DSO-BKN-01" if not is_compliant else "SYSTEM",
        "reviewed_at": "2026-11-18 08:30:00",
        "reviewer_notes": "Audit complete.",
        "complaint_check": "Compliant activity." if is_compliant else "Safety rule infraction."
    })

# -------------------------------------------------------------
# 3. Wagon Damage Detection (WDD 6-Gantry Records)
# -------------------------------------------------------------
wdd_inspections = [
    # Freight Rake BOXN-542 Entry vs Exit Gantry Comparison
    {
        "id": "WDD-BOXN542-01",
        "train_no": "BOXN-542",
        "rake_type": "BOXNHL",
        "wagon_no": "BOXNHL 22011945123",
        "position_in_rake": 14,
        "entry_gantry": "Suratgarh West Gate Gantry #1",
        "entry_timestamp": "2026-11-18 10:15:20",
        "entry_damage_status": "CLEAR",
        "entry_defects": [],
        "exit_gantry": "Lalgarh Yard Exit Gantry #2",
        "exit_timestamp": "2026-11-18 16:45:10",
        "exit_damage_status": "DAMAGED",
        "exit_defects": [
            {
                "class": "DOOR_DEFECT",
                "severity": "HIGH",
                "description": "Left middle discharge flap unlatched and hanging.",
                "camera_id": "CAM-03 (Side View Port)"
            },
            {
                "class": "SPRING_BROKEN",
                "severity": "CRITICAL",
                "description": "Inner coil spring fractured on Bogie #2 right side.",
                "camera_id": "CAM-05 (Underframe Port)"
            }
        ],
        "delta_transit_damage": True,
        "liability_attribution": "Damage occurred in transit between Suratgarh and Lalgarh.",
        "ocr_confidence": 0.98
    },
    {
        "id": "WDD-BOXN542-02",
        "train_no": "BOXN-542",
        "rake_type": "BOXNHL",
        "wagon_no": "BOXNHL 22011945124",
        "position_in_rake": 15,
        "entry_gantry": "Suratgarh West Gate Gantry #1",
        "entry_timestamp": "2026-11-18 10:15:35",
        "entry_damage_status": "DAMAGED",
        "entry_defects": [
            {
                "class": "BODY_PANEL",
                "severity": "MEDIUM",
                "description": "Dent on side wall panel > 150mm.",
                "camera_id": "CAM-02 (Top Angle)"
            }
        ],
        "exit_gantry": "Lalgarh Yard Exit Gantry #2",
        "exit_timestamp": "2026-11-18 16:45:25",
        "exit_damage_status": "DAMAGED",
        "exit_defects": [
            {
                "class": "BODY_PANEL",
                "severity": "MEDIUM",
                "description": "Dent on side wall panel > 150mm (pre-existing).",
                "camera_id": "CAM-02 (Top Angle)"
            }
        ],
        "delta_transit_damage": False,
        "liability_attribution": "Pre-existing damage prior to Suratgarh departure. Contractor not liable.",
        "ocr_confidence": 0.97
    },
    {
        "id": "WDD-BOXN542-03",
        "train_no": "BOXN-542",
        "rake_type": "BCNHL",
        "wagon_no": "BCNHL 33022198001",
        "position_in_rake": 28,
        "entry_gantry": "Suratgarh West Gate Gantry #1",
        "entry_timestamp": "2026-11-18 10:17:10",
        "entry_damage_status": "CLEAR",
        "entry_defects": [],
        "exit_gantry": "Lalgarh Yard Exit Gantry #2",
        "exit_timestamp": "2026-11-18 16:47:05",
        "exit_damage_status": "DAMAGED",
        "exit_defects": [
            {
                "class": "BRAKE_BEAM_DEFECT",
                "severity": "CRITICAL",
                "description": "Brake beam hanger pin detached; beam rubbing against wheel flange.",
                "camera_id": "CAM-06 (Underframe Starboard)"
            }
        ],
        "delta_transit_damage": True,
        "liability_attribution": "New mechanical failure in transit. Urgent sick line marking required.",
        "ocr_confidence": 0.99
    }
]

# Additional wagon gantry records to reach 16 records
for w in range(4, 17):
    wdd_inspections.append({
        "id": f"WDD-BOXN542-{w:02d}",
        "train_no": "BOXN-542",
        "rake_type": "BOXNHL",
        "wagon_no": f"BOXNHL {22011945100 + w}",
        "position_in_rake": w,
        "entry_gantry": "Suratgarh West Gate Gantry #1",
        "entry_timestamp": f"2026-11-18 10:15:{w*2:02d}",
        "entry_damage_status": "CLEAR",
        "entry_defects": [],
        "exit_gantry": "Lalgarh Yard Exit Gantry #2",
        "exit_timestamp": f"2026-11-18 16:45:{w*2:02d}",
        "exit_damage_status": "CLEAR" if w % 3 != 0 else "DAMAGED",
        "exit_defects": [] if w % 3 != 0 else [{
            "class": "HANDRAIL_BROKEN" if w % 2 == 0 else "COUPLER_DAMAGE",
            "severity": "LOW" if w % 2 == 0 else "HIGH",
            "description": "Handrail deformed at end ladder" if w % 2 == 0 else "CBC coupler knuckle excessive wear",
            "camera_id": "CAM-01"
        }],
        "delta_transit_damage": (w % 3 == 0),
        "liability_attribution": "Transit damage verified." if w % 3 == 0 else "Clean inspection.",
        "ocr_confidence": round(0.95 + (w % 5) * 0.01, 2)
    })

# -------------------------------------------------------------
# 4. Zero-Latency Fallback Cache (cached_demo_responses.json)
# -------------------------------------------------------------
cached_demo_responses = {
    # Scenario 1: Suratgarh Train 12414 Investigation
    "scenario_1_spad_investigation": {
        "query": "Investigate safety events for Train 12414 near Suratgarh on 2026-11-18.",
        "incident_id": "INC-12414-20261118",
        "summary": "Train 12414 (Mandore Express, Loco WAP-7 30452) experienced a severe near-SPAD incident approaching Suratgarh Junction at 03:14:15. At 03:11:05, Station Master advised Down Loop Line and Home Signal at RED. Between 03:14:02 and 03:14:30, Loco Pilot Rajesh Kumar was distracted by personal mobile phone usage (Locate AI Alert LOC-20261118-001, confirmed by Reviewer DSO-BKN). Assistant Loco Pilot shouted emergency warning at 03:14:15. Emergency brake applied at 03:14:24; train halted safely 60 meters before the Home Signal at Danger.",
        "timestamp_citations": [
            {"time": "03:11:05", "source": "Railcomm VHF", "event": "SM advises Caution Order 30 kmph, Home Signal RED."},
            {"time": "03:14:02", "source": "Locate Cabin Cam", "event": "LP mobile phone distraction detected (28s duration, 94% conf). Reviewer Status: CONFIRMED by DSO-BKN."},
            {"time": "03:14:15", "source": "Railcomm Cabin Intercom", "event": "ALP Amit Singh shouts: 'सामने होम सिग्नल लाल है! फोन रखिए! ब्रेक लगाइए!'"},
            {"time": "03:14:24", "source": "Loco Telemetry", "event": "Emergency RS Valve tripped; BP drops to 0 kg/cm²."},
            {"time": "03:14:48", "source": "Railcomm VHF", "event": "Train halted safely 60m before Home Signal. SPAD averted."}
        ],
        "root_cause": "Driver inattention and rule violation (personal mobile phone usage in active cab) leading to delayed brake application approaching a stop signal.",
        "bilingual_report": {
            "english_statutory": "PRELIMINARY INQUIRY REPORT (RULE 113 G&SR)\nDivision: Bikaner | Train: 12414 Exp | Date: 18-Nov-2026\nFinding: Complete stoppage 60 meters prior to Home Signal. Crew violation under Railway Board Mobile Usage Directive 2020 confirmed via CVVRS footage.",
            "hindi_briefing": "सुरक्षा निर्देश (क्रू लॉबी साइन-ऑन ब्रीफिंग):\nदिनांक 18-नवंबर-2026 को सूरतगढ़ दृष्टिकोण पर 12414 के चालक द्वारा मोबाइल उपयोग से सिग्नल अनदेखी की गंभीर घटना टली। सभी लोको पायलटों को सख्त चेतावनी: रनिंग ड्यूटी के दौरान मोबाइल पूर्णतः बंद रखें। होम सिग्नल पर कौशन गति (30 किमी/घंटा) का अनिवार्य पालन करें।"
        }
    },

    # Scenario 2: Fatigue & Micro-Sleep Trend Analysis (02:00 - 05:00 AM)
    "scenario_2_fatigue_pattern": {
        "query": "Show driver alertness and fatigue trends between 02:00 and 05:00 AM on Bikaner Division.",
        "summary": "Analysis of Locate CVVRS alerts on Bikaner Division identifies a concentrated cluster of driver micro-sleep infractions (4 confirmed incidents) strictly occurring between 03:30 AM and 04:45 AM. All incidents occurred on long-distance night freight trains (BOXN-542, BOXN-611) and express run 14707. No fatigue violations occurred during day shifts (06:00 - 18:00).",
        "cluster_data": [
            {"time": "03:45:12", "loco": "WAG-9 31204", "train": "BOXN-542", "crew": "LP-3108", "duration": "12s micro-sleep", "status": "CONFIRMED"},
            {"time": "04:12:05", "loco": "WAG-9 31882", "train": "BOXN-611", "crew": "LP-2891", "duration": "16s micro-sleep", "status": "CONFIRMED"},
            {"time": "04:38:22", "loco": "WDP-4D 40112", "train": "14707", "crew": "LP-5012", "duration": "9s micro-sleep", "status": "PENDING"}
        ],
        "corrective_actions": [
            "Mandate audio vigilance confirmation intervals reduced from 60s to 30s during 02:00 - 05:00 AM window.",
            "Conduct surprise breathalyzer and alertness checks at Lalgarh and Suratgarh crew lobbies."
        ]
    },

    # Scenario 3: Freight Rake Wagon Damage Audit (Entry vs Exit)
    "scenario_3_wagon_damage_audit": {
        "query": "Audit entry-versus-exit wagon damage for freight rake BOXN-542.",
        "train_no": "BOXN-542",
        "rake_type": "BOXNHL (58 Wagons)",
        "summary": "Automated 6-camera WDD gantry differential between Suratgarh Entry (10:15) and Lalgarh Exit (16:45) identified 2 wagons with newly sustained in-transit damage, while 1 pre-existing defect was correctly cleared of contractor liability.",
        "findings": [
            {
                "wagon_no": "BOXNHL 22011945123",
                "position": 14,
                "status": "NEW TRANSIT DAMAGE",
                "defects": ["DOOR_DEFECT (Hanging bottom flap)", "SPRING_BROKEN (Inner coil fracture)"],
                "liability": "Railway transit failure / siding handling damage."
            },
            {
                "wagon_no": "BOXNHL 22011945124",
                "position": 15,
                "status": "PRE-EXISTING DEFECT",
                "defects": ["BODY_PANEL (150mm dent detected at entry gantry)"],
                "liability": "Contractor exempt from liability (pre-existing)."
            },
            {
                "wagon_no": "BCNHL 33022198001",
                "position": 28,
                "status": "CRITICAL NEW TRANSIT FAILURE",
                "defects": ["BRAKE_BEAM_DEFECT (Hanger pin detached, rubbing flange)"],
                "liability": "Immediate mechanical sick-line diversion ordered."
            }
        ],
        "inspection_time_savings": "WDD automated audit completed in 8 minutes versus 5 hours 30 minutes manual examination."
    }
}

# -------------------------------------------------------------
# Write files to data/
# -------------------------------------------------------------
with open(os.path.join(DATA_DIR, "railcomm_transcripts.json"), "w", encoding="utf-8") as f:
    json.dump(transcripts, f, indent=2, ensure_ascii=False)

with open(os.path.join(DATA_DIR, "locate_alerts.json"), "w", encoding="utf-8") as f:
    json.dump(locate_alerts, f, indent=2, ensure_ascii=False)

with open(os.path.join(DATA_DIR, "wdd_inspections.json"), "w", encoding="utf-8") as f:
    json.dump(wdd_inspections, f, indent=2, ensure_ascii=False)

with open(os.path.join(DATA_DIR, "cached_demo_responses.json"), "w", encoding="utf-8") as f:
    json.dump(cached_demo_responses, f, indent=2, ensure_ascii=False)

print(f"Synthetic datasets generated successfully in {DATA_DIR}:")
print(f"  • railcomm_transcripts.json: {len(transcripts)} records")
print(f"  • locate_alerts.json: {len(locate_alerts)} records")
print(f"  • wdd_inspections.json: {len(wdd_inspections)} records")
print(f"  • cached_demo_responses.json: {len(cached_demo_responses)} pre-computed scenarios")
