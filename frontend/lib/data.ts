import { Shield, Zap, Wrench, UserCheck, Briefcase } from "lucide-react";
import type { ChatResponse, RoleMetadata, UserRole } from "./types";

// Scenario answers, incident timeline, BOXN-542 rake and inquiry report come from the datasets.
export { INQUIRY_REPORT, RAKE, SCENARIO_1_FALLBACK, SCENARIO_4_FALLBACK, TIMELINE } from "./demo-data.generated";

export const ROLES: Record<UserRole, RoleMetadata> = {
  ROLE_SR_DSO: {
    code: "ROLE_SR_DSO",
    title: "Sr. DSO · Safety",
    short: "Sr. DSO",
    designation: "Sr. Divisional Safety Officer",
    division: "Bikaner · NWR",
    icon: Shield,
    allowedTabs: ["copilot", "files", "timeline", "wdd", "artifacts"],
    dataScopes: ["RAILCOMM", "LOCATE", "WDD", "TELEMETRY"],
    forceMasking: false,
    canSignCRS: true,
    canViewAudit: true,
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
    dataScopes: ["RAILCOMM", "LOCATE", "TELEMETRY"],
    forceMasking: false,
    canSignCRS: false,
    canViewAudit: false,
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
    dataScopes: ["WDD", "TELEMETRY"],
    forceMasking: true,
    canSignCRS: false,
    canViewAudit: false,
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
    dataScopes: ["RAILCOMM", "LOCATE"],
    forceMasking: true,
    canSignCRS: false,
    canViewAudit: false,
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
    dataScopes: ["RAILCOMM", "LOCATE", "WDD", "TELEMETRY"],
    forceMasking: false,
    canSignCRS: true,
    canViewAudit: true,
    canIssueWorkOrder: false,
  },
};

export type ScenarioId = 1 | 2 | 3 | 4;

export const SCENARIO_QUERIES: Record<ScenarioId, string> = {
  1: "Investigate safety events for Train 12414 near Suratgarh on 2026-11-18.",
  2: "Show driver alertness and fatigue trends between 02:00 and 05:00 AM on Bikaner Division.",
  3: "Audit entry-versus-exit wagon damage for freight rake BOXN-542.",
  4: "Show all signal-related miscommunications, emergency callouts, and caution order exchanges on the Bikaner division during the shift on 18 Nov 2026.",
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

export const genericFallback = (q: string): ChatResponse => ({
  answer: `Offline mode — showing cached grounding for “${q}”. Cross-referencing Railcomm VHF, Locate CVVRS and WDD gantry records for Bikaner Division.`,
  citations: [{ timestamp: "03:14:15", source: "Railcomm VHF", event_description: "Voice stream keyword matched." }],
  suggested_actions: ["Open timeline", "Export inquiry artifacts"],
  latency_ms: 4,
  token_usage: { total_tokens: 0 },
  cached: true,
});

export const SAMPLE_FILES = [
  { type: "wav", name: "cab_radio_suratgarh_031415.wav", label: "Cab radio", ext: "WAV", tone: "blue" },
  { type: "mp4", name: "cvvrs_cab_driver_phone.mp4", label: "CVVRS video", ext: "MP4", tone: "violet" },
  { type: "jpg", name: "wdd_gantry_fractured_spring.jpg", label: "Gantry scan", ext: "JPG", tone: "emerald" },
  { type: "pdf", name: "caution_order_t409_sog.pdf", label: "Caution order", ext: "PDF", tone: "amber" },
  { type: "csv", name: "speedometer_brake_curve.csv", label: "Brake telemetry", ext: "CSV", tone: "rose" },
] as const;

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
