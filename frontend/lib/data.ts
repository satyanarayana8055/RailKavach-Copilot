import { Shield, Zap, Wrench, UserCheck, Briefcase } from "lucide-react";
import type { ChatResponse, RoleMetadata, TimelineEvent, UserRole, Wagon } from "./types";

export const ROLES: Record<UserRole, RoleMetadata> = {
  ROLE_SR_DSO: {
    code: "ROLE_SR_DSO",
    title: "Sr. DSO · Safety",
    short: "Sr. DSO",
    designation: "Sr. Divisional Safety Officer",
    division: "Bikaner · NWR",
    icon: Shield,
    allowedTabs: ["copilot", "files", "timeline", "wdd", "artifacts"],
    forceMasking: false,
    canSignCRS: true,
    canIssueWorkOrder: false,
  },
  ROLE_SR_DEE: {
    code: "ROLE_SR_DEE",
    title: "Sr. DEE/TRO · Loco Ops",
    short: "Sr. DEE",
    designation: "Sr. Divisional Electrical Engineer (TRO)",
    division: "Bikaner · NWR",
    icon: Zap,
    allowedTabs: ["copilot", "files", "timeline", "artifacts"],
    forceMasking: false,
    canSignCRS: false,
    canIssueWorkOrder: false,
  },
  ROLE_SR_DME: {
    code: "ROLE_SR_DME",
    title: "Sr. DME/C&W · Rolling Stock",
    short: "Sr. DME",
    designation: "Sr. Divisional Mechanical Engineer (C&W)",
    division: "Lalgarh Yard",
    icon: Wrench,
    allowedTabs: ["wdd", "files", "copilot"],
    forceMasking: true,
    canSignCRS: false,
    canIssueWorkOrder: true,
  },
  ROLE_CREW_CONTROLLER: {
    code: "ROLE_CREW_CONTROLLER",
    title: "Crew Controller · Lobby",
    short: "Crew Ctrl",
    designation: "Crew Controller",
    division: "Suratgarh Lobby",
    icon: UserCheck,
    allowedTabs: ["artifacts", "copilot"],
    forceMasking: true,
    canSignCRS: false,
    canIssueWorkOrder: false,
  },
  ROLE_CRS: {
    code: "ROLE_CRS",
    title: "CRS · Statutory",
    short: "CRS",
    designation: "Commissioner of Railway Safety",
    division: "All Zones",
    icon: Briefcase,
    allowedTabs: ["copilot", "files", "timeline", "wdd", "artifacts"],
    forceMasking: false,
    canSignCRS: true,
    canIssueWorkOrder: false,
  },
};

export const SCENARIO_QUERIES: Record<1 | 2 | 3, string> = {
  1: "Investigate safety events for Train 12414 near Suratgarh on 2026-11-18.",
  2: "Show driver alertness and fatigue trends between 02:00 and 05:00 AM on Bikaner Division.",
  3: "Audit entry-versus-exit wagon damage for freight rake BOXN-542.",
};

export const SUGGESTED_PROMPTS = [
  { label: "क्या 12403 का सिग्नल लाल था?", query: "क्या 12403 का सिग्नल लाल था?", hindi: true },
  { label: "12414 near-SPAD", query: "Investigate Train 12414 near Suratgarh" },
  { label: "Night fatigue", query: "Show driver alertness and fatigue trends between 02:00 and 05:00 AM" },
  { label: "BOXN-542 damage", query: "Audit entry-versus-exit wagon damage for freight rake BOXN-542" },
];

export const WELCOME_RESPONSE: ChatResponse = {
  answer:
    "RailKavach Copilot is online. Ask about any train, crew or rake — answers are grounded in Railcomm audio, Locate cabin video and WDD gantry scans, with timestamped evidence.",
  citations: [
    {
      timestamp: "03:14:15",
      source: "Multi-source grounding",
      event_description: "Railcomm VHF · Locate CVVRS · WDD 6-gantry in sync.",
      reviewer_status: "ACTIVE",
    },
  ],
  suggested_actions: ["Investigate Train 12414", "Night fatigue clusters", "Audit rake BOXN-542"],
  latency_ms: 2,
  token_usage: { total_tokens: 0 },
  cached: true,
};

export const SCENARIO_1_FALLBACK: ChatResponse = {
  answer:
    "Train 12414 (Mandore Express, WAP-7 30452) narrowly avoided a SPAD approaching Suratgarh Jn. The Loco Pilot was on a personal phone for 28 s while the Home Signal was at Danger; the ALP's shouted warning at 03:14:15 led to an emergency brake at 03:14:24. The train halted 60 m short of the signal.",
  citations: [
    { timestamp: "03:11:05", source: "Railcomm VHF", event_description: "Caution Order 30 km/h · Home Signal RED." },
    { timestamp: "03:14:02", source: "Locate Cabin Cam", event_description: "LP mobile phone use · 28 s · 94% conf.", reviewer_status: "CONFIRMED" },
    { timestamp: "03:14:15", source: "Railcomm Intercom", event_description: "ALP: 'सामने होम सिग्नल लाल है! ब्रेक लगाइए!'" },
    { timestamp: "03:14:24", source: "Loco Telemetry", event_description: "RS valve tripped · BP 5.0 → 0 kg/cm²." },
    { timestamp: "03:14:48", source: "Railcomm VHF", event_description: "Halted 60 m before Home Signal · SPAD averted." },
  ],
  suggested_actions: [
    "Generate Rule 113 inquiry report",
    "Issue Hindi lobby briefing",
    "Commend ALP Amit Singh",
  ],
  latency_ms: 2,
  token_usage: { total_tokens: 0 },
  cached: true,
};

export const genericFallback = (q: string): ChatResponse => ({
  answer: `Offline mode — showing cached grounding for “${q}”. Cross-referencing Railcomm VHF, Locate CVVRS and WDD gantry records for Bikaner Division.`,
  citations: [{ timestamp: "03:14:15", source: "Railcomm VHF", event_description: "Voice stream keyword matched." }],
  suggested_actions: ["Open timeline", "Export inquiry artifacts"],
  latency_ms: 4,
  token_usage: { total_tokens: 0 },
  cached: true,
});

export const TIMELINE: TimelineEvent[] = [
  { time_str: "03:10:15", source: "RAILCOMM_AUDIO", speaker: "Station Master SOG", event: "SM to LP 12414: acknowledge VHF Channel 02.", event_hi: "गाड़ी संख्या 12414 लोको पायलट, सूरतगढ़ स्टेशन मास्टर सुनिए।", clarity: 0.95, fail_open: false, severity: "INFO" },
  { time_str: "03:11:05", source: "RAILCOMM_AUDIO", speaker: "Station Master SOG", event: "Down Loop set. Home Signal RED. Caution 30 km/h.", event_hi: "12414, डाउन लूप लाइन तय है। होम सिग्नल लाल है, कौशन ऑर्डर 30 किमी/घंटा।", clarity: 0.94, fail_open: false, severity: "INFO" },
  { time_str: "03:14:02", source: "LOCATE_CABIN_CAM", speaker: "LP-4412 (Rajesh Kumar)", event: "MOBILE_PHONE · 28 s · 94% conf.", event_hi: "केबिन कैमरा अलर्ट: मोबाइल फोन उपयोग (28 सेकंड)।", clarity: 0.94, reviewer_status: "CONFIRMED", severity: "CRITICAL" },
  { time_str: "03:14:15", source: "RAILCOMM_AUDIO", speaker: "ALP-5519 (Amit Singh)", event: "ALP: “Put down phone, Home Signal is RED! Apply brake!”", event_hi: "सहायक लोको पायलट: 'सर फोन रखिए, होम सिग्नल लाल है! ब्रेक लगाइए!'", clarity: 0.96, fail_open: false, severity: "CRITICAL" },
  { time_str: "03:14:24", source: "LOCO_TELEMETRY", speaker: "LP Rajesh Kumar", event: "Emergency brake · BP 5.0 → 0.0 kg/cm².", event_hi: "आपातकालीन ब्रेक! बीपी प्रेशर 0।", clarity: 0.98, severity: "CRITICAL" },
  { time_str: "03:14:48", source: "RAILCOMM_AUDIO", speaker: "LP Rajesh Kumar", event: "Halted 60 m before Home Signal. SPAD averted.", event_hi: "होम सिग्नल से 60 मीटर पहले खड़ी।", clarity: 0.93, fail_open: false, severity: "INFO" },
];

/** BOXN-542 rake: 58 wagons; three carry findings from the entry/exit gantry differential. */
const FINDINGS: Record<number, Omit<Wagon, "pos">> = {
  14: { serial: "BOXNHL 22011945123", entry: "Clear", exit: "Door defect + broken spring", status: "NEW_DAMAGE", note: "Transit damage at contractor siding · sick line tagged" },
  15: { serial: "BOXNHL 22011945124", entry: "Body dent >150 mm", exit: "Body dent >150 mm", status: "PRE_EXISTING", note: "Pre-existing before Suratgarh · contractor exempt" },
  28: { serial: "BCNHL 33022198001", entry: "Clear", exit: "Brake beam defect", status: "CRITICAL", note: "Hanger pin dislodged · wheel-flange hazard" },
};

export const RAKE: Wagon[] = Array.from({ length: 58 }, (_, i) => {
  const pos = i + 1;
  const finding = FINDINGS[pos];
  if (finding) return { pos, ...finding };
  return { pos, serial: `BOXNHL 2201194${5100 + pos}`, entry: "Clear", exit: "Clear", status: "CLEAR", note: "No change between gantries" };
});

export const SAMPLE_FILES = [
  { type: "wav", name: "cab_radio_suratgarh_031415.wav", label: "Cab radio", ext: "WAV", tone: "blue" },
  { type: "mp4", name: "cvvrs_cab_driver_phone.mp4", label: "CVVRS video", ext: "MP4", tone: "violet" },
  { type: "jpg", name: "wdd_gantry_fractured_spring.jpg", label: "Gantry scan", ext: "JPG", tone: "emerald" },
  { type: "pdf", name: "caution_order_t409_sog.pdf", label: "Caution order", ext: "PDF", tone: "amber" },
  { type: "csv", name: "speedometer_brake_curve.csv", label: "Brake telemetry", ext: "CSV", tone: "rose" },
] as const;

export const INQUIRY_REPORT = `PRELIMINARY STATUTORY INQUIRY REPORT
=====================================================
Authority: Senior Divisional Safety Officer (Sr. DSO)
Division : Bikaner Division, North Western Railway
Incident : INC-12414-20261118 (Avoided SPAD Incident)
Train    : 12414 Mandore Express (WAP-7 30452)
Date/Time: 18-Nov-2026 at 03:14:15 hrs

1. MASTER EVENT CHRONOLOGY
-----------------------------------------------------
* [03:11:05] SM SOG issued Caution Order (30 kmph) on Loop Line.
* [03:14:02] Locate CVVRS detected LP mobile phone use (28s).
* [03:14:15] ALP shouted emergency verbal warning over Cab Intercom.
* [03:14:24] Emergency brake (RS Valve) tripped; BP drops to 0 kg/cm².
* [03:14:48] Train stopped 60 meters before Home Signal at Danger.

2. STATUTORY FINDINGS & COMPLIANCE
-----------------------------------------------------
* Loco Pilot Rajesh Kumar breached Railway Board Directive 2020.
* Violation verified & confirmed by Reviewer DSO-BKN at 06:30:15.
* ALP Amit Singh commended for swift emergency intervention.
* DPDP Act 2023: Biometric CVVRS audit logs cryptographically locked.`;

export const HINDI_BRIEFING = `उत्तर पश्चिम रेलवे • बीकानेर मंडल
क्रू लॉबी दैनिक संरक्षा चेतावनी निर्देश
प्रकरण संख्या: INC-12414-20261118 | दिनांक: 18-नवंबर-2026

समस्त लोको पायलट एवं सहायक लोको पायलट कृपया ध्यान दें:

१. रनिंग ड्यूटी में मोबाइल फोन पूर्णतः प्रतिबंधित:
   दिनांक 18-नवंबर को सूरतगढ़ दृष्टिकोण पर चालक द्वारा मोबाइल
   उपयोग के कारण होम सिग्नल अनदेखी की गंभीर घटना टली।
   रनिंग ड्यूटी के दौरान मोबाइल चालू पाए जाने पर तत्काल प्रभाव
   से निलंबन एवं विभागीय कार्रवाई की जाएगी।

२. सिग्नल कॉल-आउट एवं दोहराव (Call-Out & Repeat):
   प्रत्येक डिस्टेंट एवं होम सिग्नल का नाम दोनों चालक जोर से
   बोलकर आदान-प्रदान करेंगे।

३. कौशन गति का कड़ाई से पालन:
   लूप लाइन प्रवेश पर 30 किमी/घंटा गति सीमा का सख्ती से पालन करें।
   बीपी प्रेशर 5.0 किग्रा/सेमी² बना रहना अनिवार्य है।

आदेशानुसार: वरिष्ठ मंडल संरक्षा अधिकारी, बीकानेर`;
