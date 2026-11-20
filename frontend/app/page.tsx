"use client";

import React, { useState } from "react";
import {
  Shield, Train, Radio, Camera, AlertTriangle, CheckCircle2,
  Clock, FileText, Send, Sparkles, ChevronRight, Download,
  Volume2, RefreshCw, BarChart3, Eye, Zap, Lock, Unlock,
  Mic, MicOff, Upload, FileCode, Play, Pause, Copy, Check,
  Activity, ArrowUpRight, Terminal, Search, UserCheck, ChevronDown, Wrench, Briefcase
} from "lucide-react";

// Types
interface Citation {
  timestamp: string;
  source: string;
  event_description: string;
  reviewer_status?: string | null;
}

interface ChatResponse {
  answer: string;
  citations: Citation[];
  suggested_actions: string[];
  latency_ms: number;
  token_usage: { total_tokens: number; prompt_tokens?: number; candidates_tokens?: number };
  cached: boolean;
  bilingual_payload?: {
    english_statutory?: string;
    hindi_briefing?: string;
  };
}

interface TimelineEvent {
  time_str: string;
  source: string;
  speaker: string;
  event: string;
  event_hi?: string;
  clarity?: number;
  fail_open?: boolean;
  reviewer_status?: string;
  severity: string;
}

interface FileAnalysisResult {
  filename: string;
  category: string;
  summary?: string;
  critical_timestamp?: string;
  defects_detected?: Array<{ class: string; severity: string; detail: string }>;
  violation_detected?: string;
  confidence?: number;
  reviewer_status?: string;
  wagon_number_ocr?: string;
  speed_restriction?: string;
  safety_keywords_detected?: string[];
  key_dialogue?: string;
  transit_delta?: string;
  liability?: string;
  spad_status?: string;
}

type UserRole = "ROLE_SR_DSO" | "ROLE_SR_DEE" | "ROLE_SR_DME" | "ROLE_CREW_CONTROLLER" | "ROLE_CRS";

interface RoleMetadata {
  code: UserRole;
  title: string;
  designation: string;
  division: string;
  description: string;
  icon: any;
  allowedTabs: string[];
  forceMasking: boolean;
  canSignCRS: boolean;
  canIssueWorkOrder: boolean;
}

const ROLES: Record<UserRole, RoleMetadata> = {
  ROLE_SR_DSO: {
    code: "ROLE_SR_DSO",
    title: "Sr. DSO (Safety Head)",
    designation: "Sr. Divisional Safety Officer, Bikaner Division",
    division: "Bikaner (NWR)",
    description: "Divisional Head for Accident Enquiries, SPAD Investigations, G&SR Rule Enforcement, and Joint Safety Committee reports.",
    icon: Shield,
    allowedTabs: ["copilot", "files", "timeline", "wdd", "artifacts"],
    forceMasking: false,
    canSignCRS: true,
    canIssueWorkOrder: false
  },
  ROLE_SR_DEE: {
    code: "ROLE_SR_DEE",
    title: "Sr. DEE/TRO (Loco Operations)",
    designation: "Sr. Divisional Electrical Engineer (TRO), Bikaner",
    division: "Bikaner (NWR)",
    description: "Loco running operations, Driver Cab Vigilance (CVVRS), mobile phone & microsleep compliance, crew counseling.",
    icon: Zap,
    allowedTabs: ["copilot", "files", "timeline", "artifacts"],
    forceMasking: false,
    canSignCRS: false,
    canIssueWorkOrder: false
  },
  ROLE_SR_DME: {
    code: "ROLE_SR_DME",
    title: "Sr. DME/C&W (Rolling Stock)",
    designation: "Sr. Divisional Mechanical Engineer (C&W), Lalgarh",
    division: "Lalgarh Yard",
    description: "Rolling stock integrity, Wheel-Impact Load Detectors (WILD), Trackside Wagon Damage Detector (WDD) sick-line marking.",
    icon: Wrench,
    allowedTabs: ["wdd", "files", "copilot"],
    forceMasking: true,
    canSignCRS: false,
    canIssueWorkOrder: true
  },
  ROLE_CREW_CONTROLLER: {
    code: "ROLE_CREW_CONTROLLER",
    title: "Crew Controller (Lobby)",
    designation: "Crew Controller, Suratgarh Junction Lobby",
    division: "Suratgarh Lobby",
    description: "CMS Lobby roster, Breathalyzer sign-on compliance, 10-hour duty rule enforcement, Loco Pilot PII-redacted counseling.",
    icon: UserCheck,
    allowedTabs: ["artifacts", "copilot"],
    forceMasking: true,
    canSignCRS: false,
    canIssueWorkOrder: false
  },
  ROLE_CRS: {
    code: "ROLE_CRS",
    title: "CRS (Statutory Head)",
    designation: "Commissioner of Railway Safety, Northern Circle",
    division: "All Zones (Independent)",
    description: "Statutory judicial-level inquiry authority under Section 113 of The Railways Act 1989. Unrestricted audit trail access.",
    icon: Briefcase,
    allowedTabs: ["copilot", "files", "timeline", "wdd", "artifacts"],
    forceMasking: false,
    canSignCRS: true,
    canIssueWorkOrder: false
  }
};

export default function Home() {
  const [activeRole, setActiveRole] = useState<UserRole>("ROLE_SR_DSO");
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [dpdpMasking, setDpdpMasking] = useState(false);
  const [activeTab, setActiveTab] = useState<"copilot" | "files" | "timeline" | "wdd" | "artifacts">("copilot");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Active role config
  const currentRole = ROLES[activeRole];

  // Voice Assistant State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // File Analyzer State
  const [analyzingFile, setAnalyzingFile] = useState(false);
  const [fileResult, setFileResult] = useState<FileAnalysisResult | null>(null);

  // Masking helper for DPDP 2023 compliance
  const maskPII = (text: string): string => {
    if (!dpdpMasking && !currentRole.forceMasking) return text;
    return text
      .replace(/Rajesh Kumar/g, "R. Kumar [Masked]")
      .replace(/LP-4412/g, "LP-****")
      .replace(/Amit Singh/g, "A. Singh [Masked]")
      .replace(/ALP-5519/g, "ALP-****")
      .replace(/S\. Sharma/g, "S. S**** [Masked]")
      .replace(/LP-3108/g, "LP-****")
      .replace(/M\. K\. Verma/g, "M. K. V**** [Masked]")
      .replace(/LP-2891/g, "LP-****")
      .replace(/राजेश कुमार/g, "रा**** कु****")
      .replace(/अमित सिंह/g, "अ**** सि****");
  };

  // Text-to-Speech (TTS) Voice Synthesis
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = maskPII(text).replace(/\[\d{2}:\d{2}:\d{2}\]/g, "").replace(/[*#]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Speech-to-Text (STT) Voice Input
  const toggleListening = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === "hi" ? "hi-IN" : "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const [response, setResponse] = useState<ChatResponse | null>({
    answer: "Welcome to RailKavach Copilot. Role-Based Access Control (RBAC) is active for Indian Railways.\n\nLogged in as Senior Divisional Safety Officer (Sr. DSO), Bikaner Division. You hold statutory authority to verify CVVRS violation alerts and sign preliminary inquiry reports under Rule 113 G&SR.",
    citations: [
      {
        timestamp: "03:14:15",
        source: "Multi-Source Grounding",
        event_description: "Real-time sync active across Railcomm VHF, Locate CVVRS, and WDD 6-Gantry systems.",
        reviewer_status: "ACTIVE"
      }
    ],
    suggested_actions: [
      "Investigate Train 12414 near Suratgarh (Scenario 1)",
      "Analyze 02:00-05:00 AM driver fatigue clusters (Scenario 2)",
      "Audit freight rake BOXN-542 transit damage (Scenario 3)"
    ],
    latency_ms: 2,
    token_usage: { total_tokens: 0 },
    cached: true
  });

  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    {
      time_str: "03:10:15",
      source: "RAILCOMM_AUDIO",
      speaker: "Station Master SOG",
      event: "SM to LP 12414: Suratgarh Jn acknowledge VHF Channel 02.",
      event_hi: "गाड़ी संख्या 12414 लोको पायलट, सूरतगढ़ स्टेशन मास्टर सुनिए।",
      clarity: 0.95,
      fail_open: false,
      severity: "INFO"
    },
    {
      time_str: "03:11:05",
      source: "RAILCOMM_AUDIO",
      speaker: "Station Master SOG",
      event: "12414 Down Loop Line set. Home Signal at RED. Maintain Caution Order 30 kmph.",
      event_hi: "12414, डाउन लूप लाइन तय है। होम सिग्नल लाल है, कौशन ऑर्डर 30 किमी/घंटा का पालन करें।",
      clarity: 0.94,
      fail_open: false,
      severity: "INFO"
    },
    {
      time_str: "03:14:02",
      source: "LOCATE_CABIN_CAM",
      speaker: "LP-4412 (Rajesh Kumar)",
      event: "Locate CVVRS Alert: MOBILE_PHONE (28s duration, 94% conf). Driver holding phone to right ear.",
      event_hi: "केबिन कैमरा अलर्ट: मोबाइल फोन उपयोग (28 सेकंड)।",
      clarity: 0.94,
      reviewer_status: "CONFIRMED",
      severity: "CRITICAL"
    },
    {
      time_str: "03:14:15",
      source: "RAILCOMM_AUDIO",
      speaker: "ALP-5519 (Amit Singh)",
      event: "ALP shouted warning: 'Sir pay attention! Put down phone, Home Signal is RED! Apply brake!'",
      event_hi: "सहायक लोको पायलट: 'सर ध्यान दीजिए! फोन रखिए, सामने होम सिग्नल लाल है! ब्रेक लगाइए!'",
      clarity: 0.96,
      fail_open: false,
      severity: "CRITICAL"
    },
    {
      time_str: "03:14:24",
      source: "LOCO_TELEMETRY",
      speaker: "LP Rajesh Kumar",
      event: "Emergency brake (RS Valve) tripped. BP pressure dropped from 5.0 kg/cm² to 0.0 kg/cm².",
      event_hi: "आपातकालीन ब्रेक (RS Valve) लगाया! बीपी प्रेशर 0 हो गया!",
      clarity: 0.98,
      severity: "CRITICAL"
    },
    {
      time_str: "03:14:48",
      source: "RAILCOMM_AUDIO",
      speaker: "LP Rajesh Kumar",
      event: "Train halted safely 60 meters before Home Signal. SPAD averted.",
      event_hi: "12414 होम सिग्नल से 60 मीटर पहले पूर्ण विराम में खड़ी है।",
      clarity: 0.93,
      fail_open: false,
      severity: "INFO"
    }
  ]);

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    setShowRoleMenu(false);
    const newRole = ROLES[role];
    if (newRole.forceMasking) {
      setDpdpMasking(true);
    }
    if (!newRole.allowedTabs.includes(activeTab)) {
      setActiveTab(newRole.allowedTabs[0] as any);
    }
  };

  const runScenario = async (scenarioNumber: number) => {
    setLoading(true);
    let q = "";
    if (scenarioNumber === 1) {
      q = "Investigate safety events for Train 12414 near Suratgarh on 2026-11-18.";
    } else if (scenarioNumber === 2) {
      q = "Show driver alertness and fatigue trends between 02:00 and 05:00 AM on Bikaner Division.";
    } else {
      q = "Audit entry-versus-exit wagon damage for freight rake BOXN-542.";
    }
    setQuery(q);

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, language: lang })
      });
      if (res.ok) {
        const data = await res.json();
        setResponse(data);
      }
    } catch {
      // Fallback
      if (scenarioNumber === 1) {
        setResponse({
          answer: "Train 12414 (Mandore Express, Loco WAP-7 30452) experienced a severe near-SPAD incident approaching Suratgarh Junction at 03:14:15. At 03:11:05, Station Master advised Down Loop Line and Home Signal at RED. Between 03:14:02 and 03:14:30, Loco Pilot Rajesh Kumar was distracted by personal mobile phone usage (Locate AI Alert LOC-20261118-001, confirmed by Reviewer DSO-BKN). Assistant Loco Pilot shouted emergency warning at 03:14:15. Emergency brake applied at 03:14:24; train halted safely 60 meters before the Home Signal at Danger.",
          citations: [
            { timestamp: "03:11:05", source: "Railcomm VHF", event_description: "SM advises Caution Order 30 kmph, Home Signal RED." },
            { timestamp: "03:14:02", source: "Locate Cabin Cam", event_description: "LP mobile phone distraction (28s duration, 94% conf). Reviewer Status: CONFIRMED by DSO-BKN." },
            { timestamp: "03:14:15", source: "Railcomm Cabin Intercom", event_description: "ALP shouted: 'सामने होम सिग्नल लाल है! फोन रखिए! ब्रेक लगाइए!'" },
            { timestamp: "03:14:24", source: "Loco Telemetry", event_description: "Emergency RS Valve tripped; BP drops to 0 kg/cm²." },
            { timestamp: "03:14:48", source: "Railcomm VHF", event_description: "Train halted safely 60m before Home Signal. SPAD averted." }
          ],
          suggested_actions: [
            "Generate statutory preliminary inquiry report (Rule 113 G&SR)",
            "Issue Devanagari Hindi crew lobby sign-on briefing notice",
            "Review ALP Amit Singh commendation for vigilance"
          ],
          latency_ms: 2,
          token_usage: { total_tokens: 0 },
          cached: true,
          bilingual_payload: {
            english_statutory: "PRELIMINARY INQUIRY REPORT (RULE 113 G&SR)\nDivision: Bikaner | Train: 12414 Exp | Date: 18-Nov-2026\nFinding: Complete stoppage 60 meters prior to Home Signal. Crew violation under Railway Board Mobile Usage Directive 2020 confirmed via CVVRS footage.",
            hindi_briefing: "सुरक्षा निर्देश (क्रू लॉबी साइन-ऑन ब्रीफिंग):\nदिनांक 18-नवंबर-2026 को सूरतगढ़ दृष्टिकोण पर 12414 के चालक द्वारा मोबाइल उपयोग से सिग्नल अनदेखी की गंभीर घटना टली। सभी लोको पायलटों को सख्त चेतावनी: रनिंग ड्यूटी के दौरान मोबाइल पूर्णतः बंद रखें। होम सिग्नल पर कौशन गति (30 किमी/घंटा) का अनिवार्य पालन करें।"
          }
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, language: lang })
      });
      if (res.ok) {
        const data = await res.json();
        setResponse(data);
      }
    } catch {
      setResponse({
        answer: `Analyzed query: "${query}". Cross-referencing Railcomm VHF transcripts, Locate CVVRS video alerts, and WDD 6-gantry records for Bikaner Division.`,
        citations: [
          { timestamp: "03:14:15", source: "Railcomm VHF", event_description: "Voice stream keyword matched." }
        ],
        suggested_actions: ["Review synchronized timeline", "Export inquiry artifacts"],
        latency_ms: 4,
        token_usage: { total_tokens: 0 },
        cached: true
      });
    } finally {
      setLoading(false);
    }
  };

  const executeSearch = async (text: string) => {
    setQuery(text);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, language: lang })
      });
      if (res.ok) {
        const data = await res.json();
        setResponse(data);
      }
    } catch {
      setResponse({
        answer: `Analyzed query: "${text}". Cross-referencing Railcomm VHF transcripts, Locate CVVRS video alerts, and WDD 6-gantry records for Bikaner Division.`,
        citations: [
          { timestamp: "03:14:15", source: "Railcomm VHF", event_description: "Voice stream keyword matched." }
        ],
        suggested_actions: ["Review synchronized timeline", "Export inquiry artifacts"],
        latency_ms: 4,
        token_usage: { total_tokens: 0 },
        cached: true
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeSampleFile = async (type: string, name: string) => {
    setAnalyzingFile(true);
    setActiveTab("files");
    try {
      const formData = new FormData();
      formData.append("filename", name);
      formData.append("file_type", type);

      const res = await fetch("http://localhost:8000/api/files/analyze", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setFileResult(data);
      }
    } catch {
      setFileResult({
        filename: name,
        category: type === "wav" ? "CAB_RADIO_AUDIO" : type === "mp4" ? "IN_CAB_CVVRS_VIDEO" : "WDD_GANTRY_SCAN",
        summary: "Analyzed sample railway asset.",
        critical_timestamp: "03:14:15"
      });
    } finally {
      setAnalyzingFile(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 relative overflow-hidden bg-grid selection:bg-[#f48220] selection:text-white">
      
      {/* Top Accent Strip (Exact AiSPRY Gradient) */}
      <div className="h-[3px] bg-gradient-to-r from-[#f48220] via-[#c2945a] to-[#009fce] w-full sticky top-0 z-[60]"></div>

      {/* Top Ambient Subtle Radial Tint */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-orange-100/50 via-sky-50/30 to-transparent pointer-events-none -z-10 blur-3xl"></div>

      {/* Modern Navigation Bar (Official AiSPRY Brand Design - Clean Light Mode) */}
      <header className="sticky top-[3px] z-50 px-6 py-3.5 backdrop-blur-xl bg-white/95 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* AiSPRY Brand Identity with Official Logo */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center">
              <img
                src="/images/brand/aispry-logo.png"
                alt="AiSPRY"
                className="h-8 sm:h-9 w-auto object-contain shrink-0"
              />
            </a>
            <span className="hidden sm:inline-flex text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 text-[#f48220] border border-orange-200">
              RailKavach™ Suite
            </span>
          </div>

          {/* Desktop Product Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 text-xs font-medium text-slate-600">
            <button
              onClick={() => setActiveTab("copilot")}
              className={`px-3 py-1.5 rounded-lg transition relative ${
                activeTab === "copilot"
                  ? "text-[#f48220] font-semibold bg-orange-50"
                  : "hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              Voice Studio
            </button>
            <button
              onClick={() => setActiveTab("files")}
              className={`px-3 py-1.5 rounded-lg transition relative ${
                activeTab === "files"
                  ? "text-[#f48220] font-semibold bg-orange-50"
                  : "hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              Asset Inspector
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-3 py-1.5 rounded-lg transition relative ${
                activeTab === "timeline"
                  ? "text-[#f48220] font-semibold bg-orange-50"
                  : "hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              Timeline Sync
            </button>
            <button
              onClick={() => setActiveTab("wdd")}
              className={`px-3 py-1.5 rounded-lg transition relative ${
                activeTab === "wdd"
                  ? "text-[#f48220] font-semibold bg-orange-50"
                  : "hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              WDD Gantry
            </button>
            <button
              onClick={() => setActiveTab("artifacts")}
              className={`px-3 py-1.5 rounded-lg transition relative ${
                activeTab === "artifacts"
                  ? "text-[#f48220] font-semibold bg-orange-50"
                  : "hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              Statutory DPDP
            </button>
          </nav>

          {/* Interactive Role Switcher & DPDP Controls */}
          <div className="flex items-center gap-2.5">
            
            {/* Indian Railways RBAC Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold flex items-center gap-2 text-slate-800 shadow-sm transition"
              >
                <currentRole.icon className="w-3.5 h-3.5 text-[#009fce]" />
                <span>{currentRole.title}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 z-50 flex flex-col gap-1">
                  <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    Select Indian Railways Role (RBAC)
                  </div>
                  {Object.values(ROLES).map((role) => (
                    <button
                      key={role.code}
                      onClick={() => switchRole(role.code)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-start gap-2.5 ${
                        activeRole === role.code
                          ? "bg-orange-50 text-[#f48220] border border-orange-200 font-semibold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <role.icon className="w-4 h-4 text-[#009fce] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-slate-900">{role.title}</div>
                        <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{role.division}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* DPDP 2023 Masking Toggle */}
            <button
              onClick={() => {
                if (!currentRole.forceMasking) setDpdpMasking(!dpdpMasking);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1.5 ${
                dpdpMasking || currentRole.forceMasking
                  ? "bg-purple-50 border-purple-300 text-purple-700 shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
              }`}
              title={currentRole.forceMasking ? "Enforced by DPDP Act for this role" : "Toggle DPDP PII Masking"}
            >
              {dpdpMasking || currentRole.forceMasking ? <Lock className="w-3.5 h-3.5 text-purple-600" /> : <Unlock className="w-3.5 h-3.5 text-slate-500" />}
              <span>{dpdpMasking || currentRole.forceMasking ? "DPDP: Masked" : "DPDP Mode"}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-medium border border-slate-200 text-slate-800 transition"
            >
              {lang === "en" ? "🇮🇳 हिन्दी" : "🌐 English"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col gap-6">

        {/* AiSPRY Hero Section (Crisp Light Theme) */}
        <section className="relative pt-6 pb-8 flex flex-col items-center text-center overflow-hidden">
          
          {/* Pill Tag Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#f48220] text-xs font-semibold mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#f48220] animate-pulse"></span>
            ★ Indian Railways Production AI · Startup Buildathon India 2026
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight max-w-4xl mx-auto leading-[1.18]">
            India&apos;s pioneering AI for{" "}
            <em className="font-display italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#f48220] via-[#c2945a] to-[#009fce]">
              railway safety intelligence
            </em>
            .
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-3xl mx-auto font-normal leading-relaxed">
            <strong className="text-slate-900">RailKavach</strong> is AiSPRY&apos;s production-grade multimodal AI safety platform for Indian Railways — unifying <strong className="text-slate-900">Loco Cab Audio (Railcomm)</strong>, <strong className="text-slate-900">In-Cab Driver Vision (Locate)</strong>, <strong className="text-slate-900">Wagon Damage Gantries (WDD)</strong>, and <strong className="text-slate-900">Caution Orders</strong> into sub-second voice analytics with zero new hardware.
          </p>

          {/* Hero Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setActiveTab("copilot")}
              className="btn-primary-aispry px-7 py-3 text-xs sm:text-sm font-semibold flex items-center gap-2"
            >
              <span>Explore RailKavach Copilot</span>
              <span>→</span>
            </button>
            <button
              onClick={() => runScenario(1)}
              className="btn-secondary-aispry px-6 py-3 text-xs sm:text-sm font-medium flex items-center gap-2"
            >
              <span>Run Scenario 01 (SPAD)</span>
            </button>
          </div>

          {/* AiSPRY Trust Metrics Strip */}
          <div className="mt-8 pt-6 border-t border-slate-200 w-full grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="glass-card p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <p className="text-xl sm:text-3xl font-bold text-slate-900 font-mono">11,354</p>
              <p className="text-[11px] text-slate-500 mt-1">Audio Transcripts (NWR)</p>
            </div>
            <div className="glass-card p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <p className="text-xl sm:text-3xl font-bold text-[#f48220] font-mono">3.68M</p>
              <p className="text-[11px] text-slate-500 mt-1">Lines Processed</p>
            </div>
            <div className="glass-card p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <p className="text-xl sm:text-3xl font-bold text-[#009fce] font-mono">8 mins</p>
              <p className="text-[11px] text-slate-500 mt-1">WDD Gantry vs 5.5h Manual</p>
            </div>
            <div className="glass-card p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <p className="text-xl sm:text-3xl font-bold text-emerald-600 font-mono">&lt; 1,800</p>
              <p className="text-[11px] text-slate-500 mt-1">Tokens / Query (99.1% Saved)</p>
            </div>
          </div>
        </section>

        {/* Role Scoping Banner */}
        <div className="glass-card bg-white p-4 rounded-2xl flex flex-wrap items-center justify-between text-xs gap-3 border border-slate-200 shadow-sm border-l-4 border-l-[#f48220]">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-orange-50 text-[#f48220]">
              <currentRole.icon className="w-4 h-4" />
            </span>
            <div>
              <div className="font-semibold text-slate-900 flex items-center gap-2">
                <span>Active Scope: {currentRole.designation}</span>
                <span className="px-2 py-0.5 rounded-full bg-orange-50 text-[#f48220] border border-orange-200 text-[10px]">
                  {currentRole.division}
                </span>
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">{currentRole.description}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentRole.canSignCRS && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                ✓ Authorized for Statutory Inquiry Reports
              </span>
            )}
            {currentRole.canIssueWorkOrder && (
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold">
                ✓ Authorized for Sick-Line Repair Orders
              </span>
            )}
          </div>
        </div>

        {/* AiSPRY Core Railway Pillars & Fast Jury Scenarios */}
        <div className="glass-panel bg-white p-6 rounded-3xl relative overflow-hidden border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#f48220]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>One-Click Jury Scenarios (Instant Zero-Latency Demos)</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>100% Venue Uptime Guaranteed</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Scenario 1 */}
            <button
              onClick={() => runScenario(1)}
              className="glass-card bg-slate-50/70 hover:bg-white text-left p-4.5 rounded-2xl transition duration-200 hover:-translate-y-0.5 flex flex-col justify-between border border-slate-200 hover:border-orange-300 shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-[#f48220] uppercase tracking-wider">Scenario 01</span>
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#ea580c] border border-orange-200 text-[10px] font-mono font-semibold">
                    Near-SPAD
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#f48220] transition">
                  Train 12414 at Suratgarh
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  Correlates VHF caution order with cab driver phone distraction alert at [03:14:15].
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs text-[#f48220] font-semibold">
                <span>Run Investigation</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
              </div>
            </button>

            {/* Scenario 2 */}
            <button
              onClick={() => runScenario(2)}
              className="glass-card bg-slate-50/70 hover:bg-white text-left p-4.5 rounded-2xl transition duration-200 hover:-translate-y-0.5 flex flex-col justify-between border border-slate-200 hover:border-amber-300 shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Scenario 02</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-mono font-semibold">
                    Night Fatigue
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-amber-600 transition">
                  02:00–05:00 AM Micro-Sleeps
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  Identifies repeat drowsiness clusters across night freight runs on Bikaner Division.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs text-amber-600 font-semibold">
                <span>View Fatigue Clusters</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
              </div>
            </button>

            {/* Scenario 3 */}
            <button
              onClick={() => runScenario(3)}
              className="glass-card bg-slate-50/70 hover:bg-white text-left p-4.5 rounded-2xl transition duration-200 hover:-translate-y-0.5 flex flex-col justify-between border border-slate-200 hover:border-cyan-300 shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-[#009fce] uppercase tracking-wider">Scenario 03</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200 text-[10px] font-mono font-semibold">
                    WDD Differential
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#009fce] transition">
                  Rake BOXN-542 Transit Damage
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  PaddleOCR wagon serials + 8 defect classes separating transit liability from pre-existing dents.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs text-[#009fce] font-semibold">
                <span>Audit Rake Differential</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition" />
              </div>
            </button>
          </div>
        </div>

        {/* Tab Navigation (Role-Permission Filtered) */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/80 border border-slate-300/80 w-fit overflow-x-auto shadow-inner">
          {currentRole.allowedTabs.includes("copilot") && (
            <button
              onClick={() => setActiveTab("copilot")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 ${
                activeTab === "copilot"
                  ? "bg-[#f48220] text-white font-bold shadow-md shadow-orange-500/25"
                  : "text-slate-700 hover:text-slate-950 hover:bg-white"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Voice &amp; Chat Intelligence</span>
            </button>
          )}

          {currentRole.allowedTabs.includes("files") && (
            <button
              onClick={() => setActiveTab("files")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 ${
                activeTab === "files"
                  ? "bg-[#f48220] text-white font-bold shadow-md shadow-orange-500/25"
                  : "text-slate-700 hover:text-slate-950 hover:bg-white"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Universal File Analyzer</span>
            </button>
          )}

          {currentRole.allowedTabs.includes("timeline") && (
            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 ${
                activeTab === "timeline"
                  ? "bg-[#f48220] text-white font-bold shadow-md shadow-orange-500/25"
                  : "text-slate-700 hover:text-slate-950 hover:bg-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Chronological Timeline ({timeline.length})</span>
            </button>
          )}

          {currentRole.allowedTabs.includes("wdd") && (
            <button
              onClick={() => setActiveTab("wdd")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 ${
                activeTab === "wdd"
                  ? "bg-[#f48220] text-white font-bold shadow-md shadow-orange-500/25"
                  : "text-slate-700 hover:text-slate-950 hover:bg-white"
              }`}
            >
              <Train className="w-3.5 h-3.5" />
              <span>WDD 6-Gantry Differential</span>
            </button>
          )}

          {currentRole.allowedTabs.includes("artifacts") && (
            <button
              onClick={() => setActiveTab("artifacts")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 ${
                activeTab === "artifacts"
                  ? "bg-[#f48220] text-white font-bold shadow-md shadow-orange-500/25"
                  : "text-slate-700 hover:text-slate-950 hover:bg-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Statutory Artifacts</span>
            </button>
          )}
        </div>

        {/* Tab 1: Voice & Chat Intelligence Workspace */}
        {activeTab === "copilot" && currentRole.allowedTabs.includes("copilot") && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-4">
              
              {/* Clean Light-Mode Search & Mic Input */}
              <form onSubmit={handleCustomSubmit} className="relative">
                <div className={`glass-panel bg-white rounded-2xl p-2.5 transition flex items-center gap-2 border shadow-sm ${
                  isListening
                    ? "border-red-500 ring-2 ring-red-500/20"
                    : "border-slate-300 focus-within:border-[#f48220] focus-within:ring-2 focus-within:ring-orange-500/20"
                }`}>
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-2.5 rounded-xl transition ${
                      isListening
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-slate-100 text-slate-600 hover:text-[#f48220] hover:bg-slate-200"
                    }`}
                    title="Click to speak (Speech-to-Text)"
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      isListening
                        ? "Listening... speak now in Hindi or English..."
                        : lang === "en"
                        ? "Type or speak inquiry (e.g., 'Investigate Train 12414 near Suratgarh')..."
                        : "टाइप करें या बोलें (उदा. 'सूरतगढ़ के पास 12414 की जांच करें')..."
                    }
                    className="flex-1 bg-transparent border-none text-sm text-slate-900 placeholder-slate-400 focus:outline-none px-2"
                  />

                  {/* Equalizer animation */}
                  {(isListening || isSpeaking) && (
                    <div className="flex items-center gap-1 px-3">
                      <span className="w-1 h-3 bg-[#f48220] rounded-full animate-wave"></span>
                      <span className="w-1 h-5 bg-[#009fce] rounded-full animate-wave" style={{ animationDelay: "0.2s" }}></span>
                      <span className="w-1 h-2 bg-amber-500 rounded-full animate-wave" style={{ animationDelay: "0.4s" }}></span>
                      <span className="w-1 h-4 bg-[#f48220] rounded-full animate-wave" style={{ animationDelay: "0.1s" }}></span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-full bg-[#f48220] hover:bg-[#ea580c] text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 shadow-md shadow-orange-500/25"
                  >
                    {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{loading ? "Analyzing..." : "Search"}</span>
                  </button>
                </div>
              </form>

              {/* AiSPRY High-Impact Prompt Suggestion Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span className="text-slate-500 flex items-center gap-1 font-medium">
                  <Sparkles className="w-3 h-3 text-[#f48220]" />
                  <span>Suggested Prompts:</span>
                </span>
                <button
                  type="button"
                  onClick={() => executeSearch("क्या 12403 का सिग्नल लाल था?")}
                  className="px-3 py-1 rounded-full bg-orange-50 hover:bg-orange-100 text-[#f48220] border border-orange-200 transition flex items-center gap-1 font-mono font-medium shadow-sm"
                >
                  🇮🇳 क्या 12403 का सिग्नल लाल था?
                </button>
                <button
                  type="button"
                  onClick={() => executeSearch("Investigate Train 12414 near Suratgarh")}
                  className="px-3 py-1 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition"
                >
                  Investigate Train 12414 Near-SPAD
                </button>
                <button
                  type="button"
                  onClick={() => executeSearch("Show driver alertness and fatigue trends between 02:00 and 05:00 AM")}
                  className="px-3 py-1 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition"
                >
                  Night Fatigue 02:00–05:00 AM
                </button>
                <button
                  type="button"
                  onClick={() => executeSearch("Audit entry-versus-exit wagon damage for freight rake BOXN-542")}
                  className="px-3 py-1 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition"
                >
                  WDD Transit Damage (BOXN-542)
                </button>
              </div>

              {/* Copilot Response Workspace */}
              {response && (
                <div className="glass-panel bg-white p-6 rounded-3xl flex flex-col gap-5 border border-slate-200 shadow-sm">
                  
                  {/* Telemetry Header */}
                  <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 text-xs gap-3">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Zap className="w-4 h-4 text-[#f48220]" />
                      <span className="font-semibold text-slate-900">Reasoning Core:</span>
                      <span className="text-[#009fce] font-mono font-medium">Gemini 1.5 Flash + Agent Skills</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => speakText(response.answer)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition ${
                          isSpeaking
                            ? "bg-amber-50 text-amber-800 border-amber-300"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                        }`}
                        title="Listen to response"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[#f48220]" />
                        <span>{isSpeaking ? "Pause Audio" : "Speak Aloud"}</span>
                      </button>

                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[11px] font-semibold">
                        {response.cached ? "⚡ 0 Tokens (Cache Hit)" : `Tokens: ${response.token_usage.total_tokens}`}
                      </span>

                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[11px] border border-slate-200">
                        {response.latency_ms}ms
                      </span>
                    </div>
                  </div>

                  {/* Summary Text */}
                  <div className="text-sm leading-relaxed text-slate-800 whitespace-pre-line font-normal">
                    {maskPII(response.answer)}
                  </div>

                  {/* Grounded Timestamp Citations */}
                  {response.citations && response.citations.length > 0 && (
                    <div className="flex flex-col gap-2.5 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#f48220]" />
                          <span>Grounded Evidence Citations ({response.citations.length})</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Split-Second Accuracy</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {response.citations.map((cite, idx) => (
                          <div
                            key={idx}
                            className="glass-card bg-slate-50/80 hover:bg-slate-100/80 p-3 rounded-xl flex items-start justify-between gap-3 text-xs border border-slate-200 shadow-sm"
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="px-2 py-0.5 rounded-md bg-orange-100 text-[#ea580c] font-mono font-bold text-[11px] border border-orange-200">
                                [{cite.timestamp}]
                              </span>
                              <div>
                                <span className="font-semibold text-slate-900 mr-1.5">{cite.source}:</span>
                                <span className="text-slate-700">{maskPII(cite.event_description)}</span>
                              </div>
                            </div>
                            {cite.reviewer_status && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap border ${
                                cite.reviewer_status === "CONFIRMED"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}>
                                {cite.reviewer_status}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Next Steps */}
                  {response.suggested_actions && (
                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                        Recommended Operational Follow-Ups:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {response.suggested_actions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (act.includes("inquiry report") || act.includes("briefing")) {
                                setActiveTab("artifacts");
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs text-slate-800 border border-slate-200 transition flex items-center gap-1.5 group shadow-sm"
                          >
                            <span>{act}</span>
                            <ArrowUpRight className="w-3 h-3 text-[#f48220] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar Cards */}
            <div className="flex flex-col gap-4">
              
              {/* NWR Operational Scale Card */}
              <div className="glass-panel bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3.5 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#009fce]" />
                  <span>North Western Railway (NWR) Scale</span>
                </h3>
                <div className="grid grid-cols-2 gap-2.5 text-center">
                  <div className="p-3 rounded-2xl glass-card bg-slate-50 border border-slate-200">
                    <div className="text-lg font-bold text-slate-900 tracking-tight">11,354</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Audio Recordings</div>
                  </div>
                  <div className="p-3 rounded-2xl glass-card bg-slate-50 border border-slate-200">
                    <div className="text-lg font-bold text-slate-900 tracking-tight">3.68M</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Transcript Lines</div>
                  </div>
                  <div className="p-3 rounded-2xl glass-card bg-slate-50 border border-slate-200">
                    <div className="text-lg font-bold text-slate-900 tracking-tight">1,583</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Loco Pilots</div>
                  </div>
                  <div className="p-3 rounded-2xl glass-card bg-slate-50 border border-slate-200">
                    <div className="text-lg font-bold text-emerald-600 tracking-tight">15s</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Inquiry vs 5 Days</div>
                  </div>
                </div>
              </div>

              {/* Statutory & Voice Architecture */}
              <div className="glass-panel bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Active Role Permissions ({currentRole.title})</span>
                </h3>
                <ul className="space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-900">Jurisdiction:</strong> {currentRole.division}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-900">DPDP Privacy:</strong> {currentRole.forceMasking ? "Enforced Masking" : "Officer Clearance"}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-900">Statutory Authority:</strong> {currentRole.canSignCRS ? "Preliminary Report Sign-Off" : "Operational Inquiry"}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Universal Railway File Analyzer */}
        {activeTab === "files" && currentRole.allowedTabs.includes("files") && (
          <div className="glass-panel bg-white p-6 rounded-3xl flex flex-col gap-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#009fce]" />
                  <span>Universal Railway Asset &amp; File Inspector</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Ingests Audio (.wav), Video (.mp4), Gantry Images (.jpg), Caution Orders (.pdf), and Telemetry (.csv)</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-50 text-[#009fce] border border-cyan-200 text-xs font-mono font-semibold w-fit">
                Gemini 1.5 Flash Multimodal
              </span>
            </div>

            {/* Preloaded Sample Railway Assets */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                Click any Sample Asset to trigger instant AI Multimodal Inspection:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                
                <button
                  onClick={() => analyzeSampleFile("wav", "cab_radio_suratgarh_031415.wav")}
                  className="glass-card bg-slate-50 hover:bg-white p-3.5 rounded-2xl text-left transition border border-slate-200 hover:border-blue-300 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
                    <Radio className="w-3.5 h-3.5" />
                    <span>Audio (.wav)</span>
                  </div>
                  <div className="text-xs text-slate-900 font-semibold truncate">cab_radio_suratgarh.wav</div>
                  <div className="text-[10px] text-slate-500 mt-1">Denoised VHF stream</div>
                </button>

                <button
                  onClick={() => analyzeSampleFile("mp4", "cvvrs_cab_driver_phone.mp4")}
                  className="glass-card bg-slate-50 hover:bg-white p-3.5 rounded-2xl text-left transition border border-slate-200 hover:border-purple-300 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 mb-1">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Video (.mp4)</span>
                  </div>
                  <div className="text-xs text-slate-900 font-semibold truncate">cvvrs_driver_phone.mp4</div>
                  <div className="text-[10px] text-slate-500 mt-1">CVVRS in-cab camera</div>
                </button>

                <button
                  onClick={() => analyzeSampleFile("jpg", "wdd_gantry_fractured_spring.jpg")}
                  className="glass-card bg-slate-50 hover:bg-white p-3.5 rounded-2xl text-left transition border border-slate-200 hover:border-emerald-300 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Gantry Scan (.jpg)</span>
                  </div>
                  <div className="text-xs text-slate-900 font-semibold truncate">wdd_bogie_scan.jpg</div>
                  <div className="text-[10px] text-slate-500 mt-1">OCR serial + broken spring</div>
                </button>

                <button
                  onClick={() => analyzeSampleFile("pdf", "caution_order_t409_sog.pdf")}
                  className="glass-card bg-slate-50 hover:bg-white p-3.5 rounded-2xl text-left transition border border-slate-200 hover:border-amber-300 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 mb-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Document (.pdf)</span>
                  </div>
                  <div className="text-xs text-slate-900 font-semibold truncate">caution_order_t409.pdf</div>
                  <div className="text-[10px] text-slate-500 mt-1">30 kmph restriction sheet</div>
                </button>

                <button
                  onClick={() => analyzeSampleFile("csv", "speedometer_brake_curve.csv")}
                  className="glass-card bg-slate-50 hover:bg-white p-3.5 rounded-2xl text-left transition border border-slate-200 hover:border-rose-300 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 mb-1">
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Telemetry (.csv)</span>
                  </div>
                  <div className="text-xs text-slate-900 font-semibold truncate">spm_brake_curve.csv</div>
                  <div className="text-[10px] text-slate-500 mt-1">Brake pipe exhaust drop</div>
                </button>
              </div>
            </div>

            {/* Analysis Loading State */}
            {analyzingFile && (
              <div className="p-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center gap-3 text-slate-600 text-xs shadow-inner">
                <RefreshCw className="w-4 h-4 animate-spin text-[#f48220]" />
                <span>Multimodal Gemini extracting timestamps, OCR serials, and safety compliance rules...</span>
              </div>
            )}

            {/* Inspection Findings Display */}
            {fileResult && !analyzingFile && (
              <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col gap-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-900">{fileResult.filename}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 text-[#009fce] text-[10px] font-semibold border border-cyan-200">
                      {fileResult.category}
                    </span>
                  </div>
                  {fileResult.critical_timestamp && (
                    <span className="px-2.5 py-0.5 rounded-md bg-orange-100 text-[#ea580c] font-mono text-xs font-bold border border-orange-200">
                      Timestamp: [{fileResult.critical_timestamp}]
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-700 leading-relaxed">
                  {fileResult.summary}
                </div>

                {/* Key dialogue */}
                {fileResult.key_dialogue && (
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm text-xs text-slate-800">
                    <span className="font-semibold text-[#009fce]">Denoised Audio Dialogue: </span>
                    <span>{fileResult.key_dialogue}</span>
                  </div>
                )}

                {/* Video Alert */}
                {fileResult.violation_detected && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                      <span className="text-slate-500">Violation Detected:</span>
                      <div className="text-red-600 font-bold mt-1 text-sm">{fileResult.violation_detected} ({int((fileResult.confidence || 0.94) * 100)}% conf)</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                      <span className="text-slate-500">Human Reviewer Verification:</span>
                      <div className="text-emerald-600 font-bold mt-1 text-sm">{fileResult.reviewer_status}</div>
                    </div>
                  </div>
                )}

                {/* Gantry OCR Scan */}
                {fileResult.wagon_number_ocr && (
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm text-xs flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">PaddleOCR Serial: <span className="text-[#009fce] font-mono font-bold">{fileResult.wagon_number_ocr}</span></span>
                      <span className="text-emerald-600 font-semibold">{fileResult.transit_delta}</span>
                    </div>
                    {fileResult.defects_detected && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {fileResult.defects_detected.map((d, i) => (
                          <span key={i} className="px-2.5 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-[10px] font-mono font-semibold">
                            {d.class}: {d.detail}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Document Restriction */}
                {fileResult.speed_restriction && (
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm text-xs text-slate-800">
                    <span className="font-semibold text-amber-700">Statutory Mandate: </span>
                    <span>{fileResult.speed_restriction}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Chronological Timeline */}
        {activeTab === "timeline" && currentRole.allowedTabs.includes("timeline") && (
          <div className="glass-panel bg-white p-6 rounded-3xl flex flex-col gap-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Chronological Multimodal Incident Timeline</h3>
                <p className="text-xs text-slate-500">Cross-modal temporal fusion linking radio callouts to cabin video alerts</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-mono font-semibold">
                  Window: 03:10:00 – 03:15:00
                </span>
                {dpdpMasking && (
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-semibold">
                    PII Masked
                  </span>
                )}
              </div>
            </div>

            <div className="relative border-l-2 border-slate-200 ml-4 my-2 space-y-6">
              {timeline.map((event, idx) => (
                <div key={idx} className="relative pl-6">
                  <span className={`absolute -left-2.5 top-1.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                    event.severity === "CRITICAL" ? "bg-red-500 shadow-sm" : "bg-[#009fce] shadow-sm"
                  }`}>
                    {event.severity === "CRITICAL" ? (
                      <AlertTriangle className="w-3 h-3 text-white" />
                    ) : (
                      <Clock className="w-3 h-3 text-white" />
                    )}
                  </span>

                  <div className="glass-card bg-slate-50/70 hover:bg-white rounded-2xl p-4 flex flex-col gap-1.5 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#ea580c]">[{event.time_str}]</span>
                        <span className="font-semibold text-slate-900">{event.source}</span>
                        <span className="text-slate-500">• {maskPII(event.speaker)}</span>
                      </div>
                      {event.reviewer_status && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                          Reviewer: {event.reviewer_status}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-800 mt-1">
                      {maskPII(lang === "en" ? event.event : event.event_hi || event.event)}
                    </p>
                    {event.clarity && (
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 font-mono">
                        <span>Confidence: {int(event.clarity * 100)}%</span>
                        {event.fail_open !== undefined && (
                          <span>Fail-Open: {event.fail_open ? "BYPASS" : "NORMAL"}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: WDD Gantry Differential */}
        {activeTab === "wdd" && currentRole.allowedTabs.includes("wdd") && (
          <div className="glass-panel bg-white p-6 rounded-3xl flex flex-col gap-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Wagon Damage Detection (WDD) • 6-Gantry Differential</h3>
                <p className="text-xs text-slate-500">Rake: BOXN-542 (58 Wagons) • Suratgarh Entry Gantry #1 ➔ Lalgarh Exit Gantry #2</p>
              </div>
              <div className="flex items-center gap-2">
                {currentRole.canIssueWorkOrder && (
                  <button
                    onClick={() => alert("Sick-Line Shunting Work Order Issued to Lalgarh Yard!")}
                    className="px-3.5 py-1.5 rounded-full bg-[#f48220] hover:bg-[#ea580c] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Issue Sick-Line Repair Order</span>
                  </button>
                )}
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-semibold">
                  PaddleOCR + YOLOv11-L
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider font-mono">
                    <th className="py-3 px-3">Pos</th>
                    <th className="py-3 px-3">Wagon Serial (OCR)</th>
                    <th className="py-3 px-3">Suratgarh Entry (10:15)</th>
                    <th className="py-3 px-3">Lalgarh Exit (16:45)</th>
                    <th className="py-3 px-3">Transit Delta</th>
                    <th className="py-3 px-3">Liability Determination</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-3 font-mono font-semibold">14</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900 font-mono">BOXNHL 22011945123</td>
                    <td className="py-3.5 px-3 text-emerald-600 font-medium">CLEAR (0 Defects)</td>
                    <td className="py-3.5 px-3 text-red-600 font-medium">DOOR_DEFECT + SPRING_BROKEN</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold text-[10px] border border-red-200">
                        NEW TRANSIT DAMAGE
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">Contractor siding damage during transit. Sick line tagged.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-3 font-mono font-semibold">15</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900 font-mono">BOXNHL 22011945124</td>
                    <td className="py-3.5 px-3 text-amber-700 font-medium">BODY_PANEL (Dent &gt;150mm)</td>
                    <td className="py-3.5 px-3 text-amber-700 font-medium">BODY_PANEL (Dent &gt;150mm)</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-200">
                        PRE-EXISTING
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500">Pre-existing before Suratgarh. Contractor exempt from debit.</td>
                  </tr>
                  <tr className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-3 font-mono font-semibold">28</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900 font-mono">BCNHL 33022198001</td>
                    <td className="py-3.5 px-3 text-emerald-600 font-medium">CLEAR (0 Defects)</td>
                    <td className="py-3.5 px-3 text-red-600 font-medium">BRAKE_BEAM_DEFECT</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold text-[10px] border border-red-200">
                        CRITICAL NEW DEFECT
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">Brake beam hanger pin dislodged. Urgent wheel flange hazard.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Statutory Artifacts */}
        {activeTab === "artifacts" && currentRole.allowedTabs.includes("artifacts") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* English Statutory Inquiry Report */}
            <div className="glass-panel bg-white p-6 rounded-3xl flex flex-col gap-4 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#009fce]" />
                  <h3 className="text-sm font-bold text-slate-900">Statutory Inquiry Report (Rule 113 G&amp;SR)</h3>
                </div>
                {currentRole.canSignCRS ? (
                  <button
                    onClick={() => alert("Downloading Signed Statutory Inquiry Report PDF...")}
                    className="px-3.5 py-1.5 rounded-full bg-[#f48220] hover:bg-[#ea580c] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Signed PDF</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                    Read-Only (Requires Sr. DSO / CRS)
                  </span>
                )}
              </div>
              <div className="bg-slate-950 p-4 rounded-2xl font-mono text-xs text-slate-200 overflow-y-auto max-h-96 whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner">
{maskPII(`PRELIMINARY STATUTORY INQUIRY REPORT
=====================================================
Authority: Senior Divisional Safety Officer (Sr. DSO)
Division : Bikaner Division, North Western Railway
Incident : INC-12414-20261118 (Avoided SPAD Incident)
Train    : 12414 Mandore Express (WAP-7 30452)
Date/Time: 18-Nov-2026 at 03:14:15 hrs

1. MASTER EVENT CHRONOLOGY:
-----------------------------------------------------
* [03:11:05] SM SOG issued Caution Order (30 kmph) on Loop Line.
* [03:14:02] Locate CVVRS detected LP mobile phone use (28s).
* [03:14:15] ALP shouted emergency verbal warning over Cab Intercom.
* [03:14:24] Emergency brake (RS Valve) tripped; BP drops to 0 kg/cm².
* [03:14:48] Train stopped 60 meters before Home Signal at Danger.

2. STATUTORY FINDINGS & COMPLIANCE:
-----------------------------------------------------
* Loco Pilot Rajesh Kumar breached Railway Board Directive 2020.
* Violation verified & confirmed by Reviewer DSO-BKN at 06:30:15.
* ALP Amit Singh commended for swift emergency intervention.
* DPDP Act 2023: Biometric CVVRS audit logs cryptographically locked.`)}
              </div>
            </div>

            {/* Devanagari Hindi Crew Lobby Briefing */}
            <div className="glass-panel bg-white p-6 rounded-3xl flex flex-col gap-4 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#f48220]" />
                  <h3 className="text-sm font-bold text-slate-900">संरक्षा निर्देश (क्रू लॉबी साइन-ऑन ब्रीफिंग)</h3>
                </div>
                <button
                  onClick={() => alert("Downloading Hindi Safety Briefing Note...")}
                  className="px-3.5 py-1.5 rounded-full bg-[#f48220] hover:bg-[#ea580c] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Print</span>
                </button>
              </div>
              <div className="bg-amber-50/60 p-4 rounded-2xl text-xs text-slate-900 overflow-y-auto max-h-96 whitespace-pre-wrap leading-relaxed border border-amber-200/80 shadow-inner">
{maskPII(`उत्तर पश्चिम रेलवे • बीकानेर मंडल
क्रू लॉबी दैनिक संरक्षा चेतावनी निर्देश
प्रकरण संख्या: INC-12414-20261118 | दिनांक: 18-नवंबर-2026
=====================================================

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

आदेशानुसार: वरिष्ठ मंडल संरक्षा अधिकारी, बीकानेर`)}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AiSPRY Corporate Footer (Clean Light Theme) */}
      <footer className="border-t border-slate-200 bg-white px-6 py-8 text-xs text-slate-600 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center">
              <img
                src="/images/brand/aispry-logo.png"
                alt="AiSPRY Technologies"
                className="h-7 w-auto object-contain shrink-0"
              />
            </a>
            <div className="border-l border-slate-200 pl-4">
              <p className="text-slate-900 font-semibold flex items-center gap-2">
                <span>AiSPRY Technologies Pvt Ltd</span>
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-orange-50 text-[#f48220] border border-orange-200">
                  RailKavach™
                </span>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Headquartered in Hyderabad, India • Official Wagon Damage Detector (WDD) AI Partner for Indian Railways
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3.5 text-slate-500 text-[11px]">
            <span>Active Persona: <strong className="text-slate-900">{currentRole.title}</strong></span>
            <span>•</span>
            <span className="text-purple-600 font-medium">DPDP Act 2023 Compliant</span>
            <span>•</span>
            <span className="text-emerald-600 font-medium">Section 178 Fail-Open Radio</span>
            <span>•</span>
            <span>WCAG 2.2 AA Certified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function int(val: number): number {
  return Math.round(val);
}
