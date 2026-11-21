# Google AI Studio Demo & Prompt Guide 🤖

> **Platform:** RailKavach Copilot  
> **Event Requirement:** "A working copilot in Google AI Studio that answers 3 questions on sample data, with timestamp citations, an incident summary, and a draft report and crew briefing in Hindi and English."

---

## 1. Quick Setup in Google AI Studio (2 Minutes)

1. Open **[aistudio.google.com](https://aistudio.google.com)**.
2. Click **Create New Prompt** ➔ Select **Chat Prompt** (or **Freeform Prompt**).
3. Select Model: **Gemini 1.5 Pro** (or **Gemini 1.5 Flash**).
4. Set **System Instructions** (Copy Section 2 below).
5. Attach the sample JSON files (`data/railcomm_transcripts.json`, `data/locate_alerts.json`, `data/wdd_inspections.json`, `data/kavach_telemetry.json`) or configure the Tool Definitions.
6. Run the **3 Golden Demo Questions** (Section 3 below).

---

## 2. System Instruction (Copy & Paste into Google AI Studio)

```text
You are RailKavach Copilot, an autonomous multimodal safety investigation assistant developed by AiSPRY Technologies for Indian Railways (Ministry of Railways).
You assist safety officers (Sr DEE/TRO, Sr DSO), crew controllers, and statutory inquiry committees (Commission of Railway Safety - CRS).

OPERATING INSTRUCTIONS & RULES:
1. Ground every finding with exact split-second timestamps: [HH:MM:SS] or [YYYY-MM-DD HH:MM:SS].
2. Distinguish raw AI detections from Human Reviewer Confirmed decisions (STATUS: CONFIRMED vs STATUS: PENDING_VERIFICATION).
3. Distinguish compliant operational acts (WALKIE_TALKIE, READING_WRITING caution order, CONTROLLING) from safety violations (MOBILE_PHONE, SLEEPING, EATING_DRINKING, HAND_SIGNAL_NOT_RETURNED).
4. Use authentic Indian Railways operational terminology (SPAD, Home Signal, Distant Signal, Caution Order, Loop Line, Brake Pipe Pressure 5.0 kg/cm², Loco Pilot, Guard, Station Master).
5. Cross-correlate across all available modalities: Railcomm radio audio, Locate CVVRS cabin camera video, Wagon Damage Detection (WDD) wayside gantry OCR, and Kavach-TCAS Train Protection sensors.
6. Provide dual-language fluency in English and Devanagari Hindi (हिन्दी).
```

---

## 3. The 3 Golden Demo Questions & Expected Outputs

### Demo Question 1: SPAD Incident Reconstruction
**User Prompt:**
> *"Investigate what led to Train 12414 overshooting the signal near Suratgarh on 18 Nov 2026. Provide exact split-second timestamp citations, cross-modal evidence from cab radio, cab video, and sensors, and statutory findings."*

**Expected Gemini Behavior:**
* Identifies distant signal yellow announcement at `[03:10:15]`.
* Highlights Station Master Suratgarh caution order on Loop Line 2 at `[03:11:40]`.
* Surfaces Locate cab video alert (`LOC-01`) at `[03:13:45]` showing Loco Pilot holding a mobile phone for 38.5 seconds (Confirmed by Sr. DSO Bikaner).
* Surfaces micro-sleep episode at `[03:14:10]` and Kavach sensor wheel impact of 248.5 kN at `[03:14:12]`.
* Highlights Station Master emergency radio callout *'गाड़ी 12414 रोको! लाल सिग्नल है!'* at `[03:14:20]`.
* Cites violation of **Railway Board JPO Circular 2018/19** and **Section 175 of The Railways Act, 1989**, certified under **Section 63 of Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)**.

---

### Demo Question 2: Signal Miscommunications on Bikaner Section
*(Directly matches the prompt example given in the team briefing email!)*

**User Prompt:**
> *"Show all signal-related miscommunications, emergency callouts, and caution order exchanges on the Bikaner division during the shift on 18 Nov 2026."*

**Expected Gemini Behavior:**
* Filters Railcomm radio transcripts across Bikaner, Suratgarh, and Lalgarh yards.
* Identifies 3 critical signal communications:
  1. `[03:14:20]` Emergency callout from SM Suratgarh shouting to apply emergency brakes.
  2. `[03:14:28]` In-cab safety intervention by Assistant Loco Pilot demanding driver drop phone and apply A9 emergency.
  3. `[02:15:00] - [02:22:10]` Fog signal / detonator explosion warning on freight train BOXN-542 approaching Lalgarh.
* Notes whether communication was processed under normal denoising or Fail-Open bypass.

---

### Demo Question 3: Fatigue Trend Analysis & Bilingual Crew Briefing
**User Prompt:**
> *"Analyze repeat fatigue patterns and micro-sleep clusters on the Suratgarh-Bikaner section. Summarize the root causes and generate a crew lobby sign-on warning slip in Devanagari Hindi for tomorrow's running staff."*

**Expected Gemini Behavior:**
* Identifies that 74.2% of micro-sleep and drowsiness alerts cluster between **02:00 AM – 05:00 AM** (circadian low window).
* Highlights that 43% of fatigued crews were operating beyond **10.0 hours continuous duty**, violating **Railway Servants (Hours of Work and Period of Rest) Rules, 2005 (HOER)**.
* Generates a ready-to-print Devanagari Hindi Warning Slip:
  ```text
  ### 🛡️ चालक दल लॉबी संरक्षा चेतावनी पर्ची (Crew Lobby Safety Warning Slip)
  मंडल: बीकानेर मंडल (उत्तर पश्चिम रेलवे)
  विषय: भोर के समय (02:00 - 05:00 AM) सतर्कता एवं मोबाइल फोन प्रतिबंध

  सभी लोको पायलट एवं सहायक लोको पायलट कृपया ध्यान दें:
  1. ट्रेन संचालन के दौरान व्यक्तिगत मोबाइल फोन स्विच ऑफ कर बैग में रखें (रेलवे अधिनियम धारा 175)।
  2. अग्रिम व होम सिग्नल के हर पहलू को जोर से पुकारें और हाथ से इशारा करें (G&SR 4.40 नियम)।
  3. 02:00 से 05:00 AM के बीच झपकी महसूस होने पर तुरंत सहायक चालक को सतर्क करें।
  ```
