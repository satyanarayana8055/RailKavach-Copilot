import json
import hashlib

def generate_railcomm():
    records = []
    
    # 13 SPAD events
    spad = [
        {"tid": "RC-01", "ts": "2026-11-18T03:00:10.000Z", "tno": "12414", "lid": "WAP-7 30452", "loc": "KM 130/02", "spk": "Loco Pilot", "rec": "SM Lalgarh", "ch": "VHF CH-02", "lang": "Hindi", "raw": "गाड़ी नंबर 12414 लालगढ़ से प्रस्थान... लाइन क्लियर कन्फर्म करें।", "eng": "Train 12414 departing Lalgarh... confirm line clear.", "kw": ["12414", "लाइन क्लियर", "प्रस्थान"]},
        {"tid": "RC-02", "ts": "2026-11-18T03:00:25.000Z", "tno": "12414", "lid": "WAP-7 30452", "loc": "KM 130/04", "spk": "SM Lalgarh", "rec": "LP 12414", "ch": "VHF CH-02", "lang": "Hindi", "raw": "12414 लाइन क्लियर है, ब्लॉक सेक्शन सूरतगढ़ अप मेन क्लियर।", "eng": "12414 line is clear, block section Suratgarh Up Main clear.", "kw": ["12414", "लाइन क्लियर", "ब्लॉक"]},
        {"tid": "RC-03", "ts": "2026-11-18T03:02:15.000Z", "tno": "12414", "lid": "WAP-7 30452", "loc": "KM 132/10", "spk": "ALP", "rec": "LP", "ch": "VHF CH-02", "lang": "Hindi", "raw": "कॉलिंग आउट: आउटर डिस्टेंट सिग्नल डबल येलो... स्पीड 75।", "eng": "Calling out: Outer distant signal Double Yellow... speed 75.", "kw": ["सिग्नल", "डबल येलो", "Double Yellow"]},
        {"tid": "RC-04", "ts": "2026-11-18T03:02:22.000Z", "tno": "12414", "lid": "WAP-7 30452", "loc": "KM 132/12", "spk": "LP", "rec": "ALP", "ch": "VHF CH-02", "lang": "English", "raw": "Acknowledged. Distant double yellow, speed maintaining at 75 kmph.", "eng": "Acknowledged. Distant double yellow, speed maintaining at 75 kmph.", "kw": ["Distant", "Double Yellow", "75 kmph"]},
        {"tid": "RC-05", "ts": "2026-11-18T03:05:00.000Z", "tno": "12414", "lid": "WAP-7 30452", "loc": "KM 134/20", "spk": "Guard", "rec": "LP", "ch": "VHF CH-02", "lang": "Hinglish", "raw": "गार्ड टू एलपी: ब्रेक पाइप प्रेशर 5.0 kg/cm² और फीड पाइप 6.0 kg/cm² चेक किया, ऑल राइट।", "eng": "Guard to LP: Brake pipe pressure 5.0 kg/cm² and feed pipe 6.0 kg/cm² checked, all right.", "kw": ["ब्रेक पाइप", "Brake Pipe", "5.0 kg/cm²"]},
        {"tid": "RC-06", "ts": "2026-11-18T03:07:30.000Z", "tno": "12414", "lid": "WAP-7 30452", "loc": "KM 136/14", "spk": "Section Controller", "rec": "SM Suratgarh", "ch": "Control Circuit", "lang": "Hindi", "raw": "कंट्रोलर: 12414 को लूप 2 पर रोकें, मालगाड़ी BOXN-542 आगे थ्रू जाएगी।", "eng": "Controller: Detain 12414 on Loop 2, freight rake BOXN-542 will go through ahead.", "kw": ["12414", "लूप 2", "BOXN-542"]},
        {"tid": "RC-07", "ts": "2026-11-18T03:10:15.000Z", "tno": "12414", "lid": "WAP-7 30452", "loc": "KM 138/04", "spk": "ALP", "rec": "LP", "ch": "VHF CH-02", "lang": "Hindi", "raw": "अग्रिम सिग्नल पीला दिख रहा है... स्पीड 50 पर नियंत्रित करें।", "eng": "Distant signal is showing Yellow... control speed at 50 km/h.", "kw": ["सिग्नल", "पीला", "स्पीड", "Signal"]},
        {"tid": "RC-08", "ts": "2026-11-18T03:11:40.000Z", "tno": "12414", "lid": "WAP-7 30452", "loc": "KM 139/12", "spk": "SM Suratgarh", "rec": "LP 12414", "ch": "VHF CH-14", "lang": "Hindi", "raw": "गाड़ी नंबर 12414 लोको पायलट, सूरतगढ़ स्टेशन मास्टर... होम सिग्नल लाल है, मेन लाइन थ्रू नहीं है। लूप लाइन 2 पर कॉशन ऑर्डर के साथ लिया जा रहा है। ओवर।", "eng": "Train 12414 LP, SM Suratgarh: Home signal is Red, mainline not through. Received on Loop Line 2 under Caution Order. Over.", "kw": ["12414", "होम सिग्नल", "लाल", "लूप लाइन", "कॉशन ऑर्डर", "Home Signal", "Red"]},
        {"tid": "RC-09", "ts": "2026-11-18T03:12:05.000Z", "tno": "12414", "lid": "WAP-7 30452", "loc": "KM 139/20", "spk": "LP", "rec": "SM Suratgarh", "ch": "VHF CH-14", "lang": "Hinglish", "raw": "12414 कॉपी किया स्टेशन मास्टर... होम सिग्नल लाल, लूप लाइन 2, कॉशन 15 kmph. ब्रेक पाइप 5.0 kg/cm² नॉर्मल। ओवर।", "eng": "12414 copied SM... Home signal Red, Loop 2, Caution 15. BP 5.0 normal. Over.", "kw": ["12414", "होम सिग्नल", "लाल", "कॉशन", "ब्रेक पाइप", "5.0 kg/cm²"]},
        {"tid": "RC-10", "ts": "2026-11-18T03:13:50.000Z", "tno": "12414", "lid": "WAP-7 30452", "loc": "KM 141/02", "spk": "Section Controller", "rec": "SM Suratgarh", "ch": "Control Circuit", "lang": "English", "raw": "Controller to SM Suratgarh: Train 12414 must clear home starter within 6 minutes. Freight rake BOXN-542 waiting at outer block.", "eng": "Controller to SM Suratgarh: Train 12414 must clear home starter within 6 minutes. Freight rake BOXN-542 waiting at outer block.", "kw": ["12414", "BOXN-542", "Block", "Starter"]},
        {"tid": "RC-11", "ts": "2026-11-18T03:14:20.000Z", "tno": "12414", "lid": "WAP-7 30452", "loc": "KM 142/10", "spk": "SM Suratgarh", "rec": "LP 12414", "ch": "VHF CH-14", "lang": "Hindi", "raw": "गाड़ी 12414 रोको! लाल सिग्नल है! लाल सिग्नल पार मत करो! इमरजेंसी ब्रेक लगाओ!", "eng": "Train 12414 STOP! Red signal! Do not cross! Emergency brake!", "kw": ["12414", "रोको", "लाल सिग्नल", "इमरजेंसी ब्रेक", "Stop", "Red Signal", "Emergency Brake"]},
        {"tid": "RC-12", "ts": "2026-11-18T03:14:28.000Z", "tno": "12414", "lid": "WAP-7 30452", "loc": "KM 142/15", "spk": "ALP", "rec": "LP", "ch": "VHF CH-02", "lang": "Hindi", "raw": "सर फोन छोड़िए! होम सिग्नल डेंजर है! इमरजेंसी गिराइए! A9 इमरजेंसी!", "eng": "Sir drop phone! Home signal at Danger! Drop emergency! A9 emergency!", "kw": ["फोन", "होम सिग्नल", "डेंजर", "इमरजेंसी", "A9", "Danger", "Emergency Brake"]},
        {"tid": "RC-13", "ts": "2026-11-18T03:14:45.000Z", "tno": "12414", "lid": "WAP-7 30452", "loc": "KM 142/22", "spk": "LP", "rec": "SM Suratgarh", "ch": "VHF CH-14", "lang": "Hindi", "raw": "स्टेशन मास्टर... 12414 रुक गई है। होम सिग्नल से लगभग 60 मीटर आगे गाड़ी खड़ी है। ब्रेक पाइप प्रेशर 0 है।", "eng": "SM... 12414 stopped. Approx 60 meters past Home Signal. BP pressure 0.", "kw": ["12414", "होम सिग्नल", "आगे", "ब्रेक पाइप", "0", "SPAD"]}
    ]

    for item in spad:
        h = hashlib.sha256(f"{item['tid']}{item['ts']}{item['tno']}".encode()).hexdigest()
        records.append({
            "transcript_id": item["tid"],
            "timestamp": item["ts"],
            "train_no": item["tno"],
            "loco_id": item["lid"],
            "section": "Suratgarh-Bikaner",
            "location": item["loc"],
            "speaker": item["spk"],
            "recipient": item["rec"],
            "channel": item["ch"],
            "language": item["lang"],
            "raw_transcript": item["raw"],
            "english_translation": item["eng"],
            "safety_keywords": item["kw"],
            "calling_out_protocol": "COMPLIANT" if "कॉपी" in item["raw"] or "Distant" in item["raw"] else "OPERATIONAL",
            "audio_quality_score": 0.94,
            "fail_open_status": "NORMAL",
            "audio_clip_uri": f"minio://railcomm/audio/20261118/{item['tid']}.wav",
            "sha256_hash": h
        })

    # Additional 45 records across NWR to total 58 records
    stations = ["Suratgarh", "Lalgarh", "Bikaner", "Napasar", "Sri Dungargarh", "Ratangarh", "Churu", "Sadulpur"]
    trains = [("12414", "WAP-7 30452"), ("BOXN-542", "WAG-9 31200"), ("14707", "WAP-7 30211"), ("22472", "WAP-7 30112"), ("BOXN-781", "WAG-9 31450")]
    
    for i in range(14, 59):
        stn = stations[i % len(stations)]
        tno, lid = trains[i % len(trains)]
        minute = (i * 2) % 60
        hour = (i // 30) + 1
        ts = f"2026-11-18T0{hour}:{minute:02d}:30.000Z"
        tid = f"RC-NWR-{i:02d}"
        
        if i % 3 == 0:
            raw = f"स्टेशन मास्टर {stn}: ट्रेन {tno} लाइन 2 लूप कॉशन ऑर्डर 30 kmph, ट्रैक कार्य प्रगति पर है।"
            eng = f"Station Master {stn}: Train {tno} Line 2 Loop Caution Order 30 kmph, track maintenance in progress."
            kw = [tno, "कॉशन ऑर्डर", "Caution Order", "30 kmph", "Loop Line", stn]
        elif i % 3 == 1:
            raw = f"लोको पायलट {tno}: कॉलिंग आउट होम सिग्नल हरा, स्टार्टर हरा... स्पीड सामान्य।"
            eng = f"Loco Pilot {tno}: Calling out Home Signal Green, Starter Green... speed normal."
            kw = [tno, "होम सिग्नल", "स्टार्टर", "हरा", "Green", "Starter"]
        else:
            raw = f"गार्ड टू लोको पायलट {tno}: बीपी प्रेशर 5.0 kg/cm² नॉर्मल, टेल लैंप क्लियर।"
            eng = f"Guard to Loco Pilot {tno}: BP pressure 5.0 kg/cm² normal, tail lamp clear."
            kw = [tno, "बीपी प्रेशर", "Brake Pipe", "5.0 kg/cm²", "Tail Lamp"]

        h = hashlib.sha256(f"{tid}{ts}{tno}".encode()).hexdigest()
        records.append({
            "transcript_id": tid,
            "timestamp": ts,
            "train_no": tno,
            "loco_id": lid,
            "section": "Suratgarh-Bikaner",
            "location": f"{stn} Yard (KM {100 + i}/10)",
            "speaker": f"Staff {stn}",
            "recipient": f"Crew {tno}",
            "channel": "VHF CH-14",
            "language": "Hindi",
            "raw_transcript": raw,
            "english_translation": eng,
            "safety_keywords": kw,
            "calling_out_protocol": "COMPLIANT",
            "audio_quality_score": 0.91,
            "fail_open_status": "NORMAL",
            "audio_clip_uri": f"minio://railcomm/audio/20261118/{tid}.wav",
            "sha256_hash": h
        })

    with open("data/railcomm_transcripts.json", "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
    print(f"✅ Generated {len(records)} railcomm transcript lines.")

def generate_locate():
    alerts = []
    core = [
        {"aid": "LOC-01", "ts": "2026-11-18T03:13:45.000Z", "loco": "WAP-7 30452", "train": "12414", "sec": "Suratgarh-Bikaner", "vtype": "MOBILE_PHONE", "is_v": True, "dur": 38.5, "conf": 0.94, "role": "LOCO_PILOT", "vstat": "CONFIRMED", "rid": "DSO-BKN-408", "rname": "R. K. Sharma (Sr. DSO Bikaner)", "rem": "Driver holding smartphone while controlling train."},
        {"aid": "LOC-02", "ts": "2026-11-18T03:10:20.000Z", "loco": "WAP-7 30452", "train": "12414", "sec": "Suratgarh-Bikaner", "vtype": "WALKIE_TALKIE", "is_v": False, "dur": 12.0, "conf": 0.96, "role": "ASSISTANT_LOCO_PILOT", "vstat": "CONFIRMED", "rid": "CLI-SUR-102", "rname": "A. Verma (CLI)", "rem": "Compliant official walkie-talkie communication."},
        {"aid": "LOC-03", "ts": "2026-11-18T03:14:10.000Z", "loco": "WAP-7 30452", "train": "12414", "sec": "Suratgarh-Bikaner", "vtype": "SLEEPING", "is_v": True, "dur": 8.2, "conf": 0.89, "role": "LOCO_PILOT", "vstat": "CONFIRMED", "rid": "DSO-BKN-408", "rname": "R. K. Sharma (Sr. DSO)", "rem": "Micro-sleep detected: eyelid closure >80% for 8.2s."},
        {"aid": "LOC-04", "ts": "2026-11-18T02:45:00.000Z", "loco": "WAG-9 31200", "train": "BOXN-542", "sec": "Bikaner-Lalgarh", "vtype": "SLEEPING", "is_v": True, "dur": 14.5, "conf": 0.92, "role": "ASSISTANT_LOCO_PILOT", "vstat": "CONFIRMED", "rid": "CLI-BKN-201", "rname": "M. S. Tanwar (CLI)", "rem": "Head drooping in deep sleep. Continuous duty was 11 hours (HOER violation)."},
        {"aid": "LOC-05", "ts": "2026-11-18T03:05:10.000Z", "loco": "WAP-7 30452", "train": "12414", "sec": "Suratgarh-Bikaner", "vtype": "READING_WRITING", "is_v": False, "dur": 25.0, "conf": 0.93, "role": "LOCO_PILOT", "vstat": "CONFIRMED", "rid": "CLI-SUR-102", "rname": "A. Verma (CLI)", "rem": "Signing caution order logbook while stationary. Suppressed."},
        {"aid": "LOC-06", "ts": "2026-11-18T03:14:05.000Z", "loco": "WAP-7 30452", "train": "12414", "sec": "Suratgarh-Bikaner", "vtype": "HAND_SIGNAL_NOT_RETURNED", "is_v": True, "dur": 6.0, "conf": 0.87, "role": "LOCO_PILOT", "vstat": "PENDING_VERIFICATION", "rid": None, "rname": None, "rem": "Pending review: Hand signal exchange omitted with Suratgarh Gateman."}
    ]

    for item in core:
        h = hashlib.sha256(f"{item['aid']}{item['ts']}{item['loco']}".encode()).hexdigest()
        alerts.append({
            "alert_id": item["aid"],
            "timestamp": item["ts"],
            "loco_id": item["loco"],
            "train_no": item["train"],
            "section": item["sec"],
            "camera_id": "CAM_CAB_INDOOR_01",
            "violation_type": item["vtype"],
            "is_violation": item["is_v"],
            "duration_seconds": item["dur"],
            "confidence": item["conf"],
            "crew_role": item["role"],
            "verification_status": item["vstat"],
            "reviewer_id": item["rid"],
            "reviewer_name": item["rname"],
            "reviewer_remarks": item["rem"],
            "evidence_clip_uri": f"minio://locate/clips/20261118/{item['aid']}.mp4",
            "sha256_hash": h
        })

    violation_types = [
        ("MOBILE_PHONE", True, 18.0, 0.91, "Driver looking down at WhatsApp messages while cruising."),
        ("SLEEPING", True, 9.5, 0.88, "Eye closure PERCLOS 78% during night run between 02:30 AM and 03:00 AM."),
        ("EATING_DRINKING", True, 45.0, 0.86, "Consuming heavy meal from tiffin box during active run."),
        ("WALKIE_TALKIE", False, 15.0, 0.95, "Legitimate exchange with Guard. Alert suppressed."),
        ("CONTROLLING", False, 60.0, 0.98, "Driver hands firmly on A9 and master controller. Normal operation."),
        ("UNAUTHORIZED_PERSON", True, 120.0, 0.89, "Non-rostered person identified standing behind loco pilot seat.")
    ]

    for i in range(7, 23):
        aid = f"LOC-{i:02d}"
        vtype, is_v, dur, conf, rem = violation_types[i % len(violation_types)]
        hour = 2 if i < 15 else 3
        minute = (i * 3) % 60
        ts = f"2026-11-18T0{hour}:{minute:02d}:00.000Z"
        train = "12414" if i % 2 == 0 else "BOXN-542"
        loco = "WAP-7 30452" if i % 2 == 0 else "WAG-9 31200"
        status = "CONFIRMED" if i % 3 != 0 else "PENDING_VERIFICATION"
        
        h = hashlib.sha256(f"{aid}{ts}{loco}".encode()).hexdigest()
        alerts.append({
            "alert_id": aid,
            "timestamp": ts,
            "loco_id": loco,
            "train_no": train,
            "section": "Suratgarh-Bikaner",
            "camera_id": "CAM_CAB_INDOOR_01",
            "violation_type": vtype,
            "is_violation": is_v,
            "duration_seconds": dur,
            "confidence": conf,
            "crew_role": "LOCO_PILOT",
            "verification_status": status,
            "reviewer_id": "DSO-BKN-408" if status == "CONFIRMED" else None,
            "reviewer_name": "R. K. Sharma (Sr. DSO)" if status == "CONFIRMED" else None,
            "reviewer_remarks": rem,
            "evidence_clip_uri": f"minio://locate/clips/20261118/{aid}.mp4",
            "sha256_hash": h
        })

    with open("data/locate_alerts.json", "w", encoding="utf-8") as f:
        json.dump(alerts, f, indent=2, ensure_ascii=False)
    print(f"✅ Generated {len(alerts)} locate cabin alerts.")

def generate_wdd():
    records = [
        {"iid": "WDD-01", "train": "BOXN-542", "rake": "RAKE-NR-BOXN-2026-11", "gid": "GANTRY-SUR-ENTRY", "gloc": "Suratgarh Entry Gantry", "ts": "2026-11-18T02:40:00.000Z", "pos": 4, "wno": "BOXN-54210984712", "dclass": "DOOR_DEFECT", "dsev": "WARNING", "desc": "Right secondary door latch displaced.", "cond": "PRE_EXISTING_AT_ENTRY", "conf": 0.94},
        {"iid": "WDD-02", "train": "BOXN-542", "rake": "RAKE-NR-BOXN-2026-11", "gid": "GANTRY-BKN-EXIT", "gloc": "Bikaner Exit Gantry", "ts": "2026-11-18T06:15:00.000Z", "pos": 4, "wno": "BOXN-54210984712", "dclass": "BRAKE_BEAM_DEFECT", "dsev": "CRITICAL", "desc": "Brake beam hanger sheared; dragging 45mm above rail.", "cond": "NEW_DAMAGE_AT_EXIT", "conf": 0.96},
        {"iid": "WDD-03", "train": "BOXN-542", "rake": "RAKE-NR-BOXN-2026-11", "gid": "GANTRY-BKN-EXIT", "gloc": "Bikaner Exit Gantry", "ts": "2026-11-18T06:16:30.000Z", "pos": 12, "wno": "BOXN-54210998124", "dclass": "BODY_PANEL", "dsev": "WARNING", "desc": "Side body deformation depth 32mm.", "cond": "PRE_EXISTING_AT_ENTRY", "conf": 0.91},
        {"iid": "WDD-04", "train": "BOXN-542", "rake": "RAKE-NR-BOXN-2026-11", "gid": "GANTRY-BKN-EXIT", "gloc": "Bikaner Exit Gantry", "ts": "2026-11-18T06:18:00.000Z", "pos": 18, "wno": "BOXN-54210884210", "dclass": "COUPLER_DAMAGE", "dsev": "WARNING", "desc": "CBC coupler knuckle pin hairline crack detected.", "cond": "NEW_DAMAGE_AT_EXIT", "conf": 0.89},
        {"iid": "WDD-05", "train": "BOXN-542", "rake": "RAKE-NR-BOXN-2026-11", "gid": "GANTRY-BKN-EXIT", "gloc": "Bikaner Exit Gantry", "ts": "2026-11-18T06:20:10.000Z", "pos": 25, "wno": "BOXN-54210771928", "dclass": "SPRING_BROKEN", "dsev": "CRITICAL", "desc": "Secondary outer helical suspension spring fractured.", "cond": "NEW_DAMAGE_AT_EXIT", "conf": 0.95},
        {"iid": "WDD-06", "train": "12414", "rake": "RAKE-NWR-LHB-12414", "gid": "GANTRY-BKN-ENTRY", "gloc": "Bikaner Yard Entry", "ts": "2026-11-18T01:30:00.000Z", "pos": 2, "wno": "LWLRRM-21345", "dclass": "HANDRAIL_BROKEN", "dsev": "WARNING", "desc": "Guard van entry handrail loose bracket.", "cond": "PRE_EXISTING_AT_ENTRY", "conf": 0.92},
        {"iid": "WDD-07", "train": "12414", "rake": "RAKE-NWR-LHB-12414", "gid": "GANTRY-BKN-ENTRY", "gloc": "Bikaner Yard Entry", "ts": "2026-11-18T01:32:00.000Z", "pos": 8, "wno": "LWACCN-18234", "dclass": "BODY_PANEL", "dsev": "INFO", "desc": "Minor scratch 45cm on coach exterior paint.", "cond": "PRE_EXISTING_AT_ENTRY", "conf": 0.88},
        {"iid": "WDD-08", "train": "BOXN-781", "rake": "RAKE-WR-BOXN-781", "gid": "GANTRY-SUR-ENTRY", "gloc": "Suratgarh Entry Gantry", "ts": "2026-11-18T01:45:00.000Z", "pos": 5, "wno": "BOXN-781094812", "dclass": "BOGIE_CRACK", "dsev": "CRITICAL", "desc": "CASNUB bogie side frame crack 12mm near axle guide.", "cond": "PRE_EXISTING_AT_ENTRY", "conf": 0.97},
        {"iid": "WDD-09", "train": "BOXN-781", "rake": "RAKE-WR-BOXN-781", "gid": "GANTRY-SUR-ENTRY", "gloc": "Suratgarh Entry Gantry", "ts": "2026-11-18T01:48:00.000Z", "pos": 14, "wno": "BOXN-781094998", "dclass": "LADDER_DAMAGE", "dsev": "WARNING", "desc": "End climbing ladder rung bent 30 degrees.", "cond": "PRE_EXISTING_AT_ENTRY", "conf": 0.90},
        {"iid": "WDD-10", "train": "BOXN-781", "rake": "RAKE-WR-BOXN-781", "gid": "GANTRY-BKN-EXIT", "gloc": "Bikaner Exit Gantry", "ts": "2026-11-18T05:30:00.000Z", "pos": 14, "wno": "BOXN-781094998", "dclass": "BRAKE_BEAM_DEFECT", "dsev": "WARNING", "desc": "Brake block uneven wear 8mm.", "cond": "NEW_DAMAGE_AT_EXIT", "conf": 0.93},
        {"iid": "WDD-11", "train": "BOXN-542", "rake": "RAKE-NR-BOXN-2026-11", "gid": "GANTRY-BKN-EXIT", "gloc": "Bikaner Exit Gantry", "ts": "2026-11-18T06:22:00.000Z", "pos": 32, "wno": "BOXN-54210665412", "dclass": "DOOR_DEFECT", "dsev": "WARNING", "desc": "Side discharge flap latch chain missing.", "cond": "NEW_DAMAGE_AT_EXIT", "conf": 0.91}
    ]

    out = []
    for item in records:
        h = hashlib.sha256(f"{item['iid']}{item['ts']}{item['wno']}".encode()).hexdigest()
        out.append({
            "inspection_id": item["iid"],
            "train_no": item["train"],
            "rake_id": item["rake"],
            "gantry_id": item["gid"],
            "gantry_location": item["gloc"],
            "inspection_timestamp": item["ts"],
            "wagon_position": item["pos"],
            "wagon_no": item["wno"],
            "ocr_confidence": 0.98,
            "wagon_type": "BOXN" if "BOXN" in item["wno"] else "LHB",
            "owning_railway": "NR",
            "damage_class": item["dclass"],
            "damage_severity": item["dsev"],
            "defect_description": item["desc"],
            "condition_status": item["cond"],
            "confidence_score": item["conf"],
            "image_uri": f"minio://wdd/inspections/20261118/{item['wno']}.jpg",
            "sha256_hash": h
        })

    with open("data/wdd_inspections.json", "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
    print(f"✅ Generated {len(out)} wagon damage inspection records.")

if __name__ == "__main__":
    generate_railcomm()
    generate_locate()
    generate_wdd()
