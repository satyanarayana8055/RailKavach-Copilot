"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatPanel, type ChatMessage } from "@/components/chat/ChatPanel";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Toast, useToast } from "@/components/Toast";
import { ArtifactsPanel } from "@/components/workspace/ArtifactsPanel";
import { FilesPanel } from "@/components/workspace/FilesPanel";
import { TimelinePanel } from "@/components/workspace/TimelinePanel";
import { WddPanel } from "@/components/workspace/WddPanel";
import { analyzeFile, ApiError, postChat, type Session } from "@/lib/api";
import { genericFallback, ROLES, SCENARIO_1_FALLBACK, SCENARIO_4_FALLBACK, SCENARIO_QUERIES, SUGGESTED_PROMPTS, TIMELINE, type ScenarioId } from "@/lib/data";
import { governOffline, maskPII, requiredSources } from "@/lib/privacy";
import type { ChatResponse, FileAnalysisResult, UserRole } from "@/lib/types";
import { RoleGate } from "./RoleGate";

const STARTERS = [
  { label: "Investigate the 12414 near-SPAD at Suratgarh", query: SCENARIO_QUERIES[1] },
  { label: "Night-shift fatigue between 02:00 and 05:00", query: SCENARIO_QUERIES[2] },
  { label: "Audit callouts and caution orders this shift", query: SCENARIO_QUERIES[4] },
  { label: "Entry vs exit damage on rake BOXN-542", query: SCENARIO_QUERIES[3] },
  ...SUGGESTED_PROMPTS.filter((p) => p.hindi),
];

let seq = 0;
const nextId = () => `m${Date.now().toString(36)}${(seq++).toString(36)}`;

export function Workspace() {
  const [roleCode, setRoleCode] = useState<UserRole | null>(null);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [modelEngine, setModelEngine] = useState<"gemini" | "gemma">("gemini");
  // DPDP: identities masked by default; unmasking = declaring an inquiry purpose (audited server-side).
  const [maskToggle, setMaskToggle] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatWide, setChatWide] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [fileResult, setFileResult] = useState<FileAnalysisResult | null>(null);
  const pendingScenario = useRef<ScenarioId | undefined>(undefined);
  const toast = useToast();

  const role = ROLES[roleCode ?? "ROLE_SR_DSO"];
  const masked = maskToggle || role.forceMasking;
  /** Built per request from an explicit role, so a just-chosen role is never sent stale. */
  const sessionFor = useCallback(
    (code: UserRole): Session => {
      const isMasked = maskToggle || ROLES[code].forceMasking;
      return { role: code, purpose: isMasked ? "ROUTINE_MONITORING" : code === "ROLE_CRS" ? "STATUTORY_INQUIRY" : "SAFETY_INQUIRY" };
    },
    [maskToggle]
  );
  const mask = useCallback((t: string) => maskPII(t, masked), [masked]);
  const data = useDashboardData(sessionFor(role.code), roleCode ? role.dataScopes : []);
  const canChat = role.allowedTabs.includes("copilot");

  // Deep link: /copilot?scenario=1 runs that question once a role is chosen.
  useEffect(() => {
    const n = Number(new URLSearchParams(window.location.search).get("scenario"));
    if (n >= 1 && n <= 4) pendingScenario.current = n as ScenarioId;
    setChatOpen(window.matchMedia("(min-width: 1024px)").matches);
  }, []);

  // ⌘I / Ctrl+I toggles the chat, like VS Code.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "i") {
        e.preventDefault();
        setChatOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const ask = async (q: string, asRole: UserRole = role.code) => {
    const who = ROLES[asRole];
    if (!who.allowedTabs.includes("copilot")) return toast.show(`The copilot isn’t available for ${who.short}`);
    const replyId = nextId();
    setMessages((ms) => [...ms, { id: nextId(), role: "user", text: q }, { id: replyId, role: "assistant", text: "", pending: true }]);
    setDraft("");
    setChatOpen(true);
    setBusy(true);
    let r: ChatResponse;
    try {
      r = await postChat(q, lang, sessionFor(asRole), modelEngine);
    } catch (e) {
      r =
        e instanceof ApiError
          ? // The server refused: show the refusal. Never substitute cached data for a denial.
            { answer: e.message, citations: [], suggested_actions: [], latency_ms: 0, token_usage: { total_tokens: 0 }, cached: false }
          : // Backend unreachable: offline demo, same scope rules, always masked.
            governOffline(q, who, () => (/miscommunication|caution order|callout/i.test(q) ? SCENARIO_4_FALLBACK : /12414|suratgarh/i.test(q) ? SCENARIO_1_FALLBACK : genericFallback(q)));
    }
    setMessages((ms) => ms.map((m) => (m.id === replyId ? { ...m, pending: false, text: r.answer, response: r } : m)));
    setBusy(false);
  };

  const enter = (code: UserRole) => {
    setRoleCode(code);
    if (pendingScenario.current) ask(SCENARIO_QUERIES[pendingScenario.current], code);
    pendingScenario.current = undefined;
  };

  const switchRole = (code: UserRole) => {
    setRoleCode(code);
    setMessages([]); // a new role starts a new conversation — no carry-over of another role's answers
    toast.show(`Signed in as ${ROLES[code].title}`);
  };

  const onAnalyze = async (type: string, name: string) => {
    setAnalyzing(name);
    try {
      setFileResult(await analyzeFile(name, type, sessionFor(role.code)));
    } catch (e) {
      if (e instanceof ApiError) {
        setFileResult(null);
        toast.show(e.message);
        return;
      }
      setFileResult({
        filename: name,
        category: type === "wav" ? "CAB_RADIO_AUDIO" : type === "mp4" ? "IN_CAB_CVVRS_VIDEO" : "WDD_GANTRY_SCAN",
        summary: "Offline mode — cached analysis of the sample asset.",
        critical_timestamp: "03:14:15",
      });
    } finally {
      setAnalyzing(null);
    }
  };

  const speak = (m: ChatMessage) => {
    if (!("speechSynthesis" in window)) return toast.show("Speech output isn’t supported in this browser");
    window.speechSynthesis.cancel();
    if (speakingId === m.id) return setSpeakingId(null);
    const u = new SpeechSynthesisUtterance(mask(m.text).replace(/\[\d{2}:\d{2}:\d{2}\]/g, "").replace(/[*#`]/g, ""));
    u.lang = lang === "hi" ? "hi-IN" : "en-IN";
    u.onstart = () => setSpeakingId(m.id);
    u.onend = u.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(u);
  };

  const toggleMic = () => {
    type SR = new () => { lang: string; interimResults: boolean; maxAlternatives: number; onstart: () => void; onresult: (e: { results: { 0: { 0: { transcript: string } } } }) => void; onerror: () => void; onend: () => void; start: () => void };
    const w = window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR };
    const Rec = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Rec) return toast.show("Voice input needs Chrome or Edge");
    if (listening) return setListening(false);
    try {
      const r = new Rec();
      r.lang = lang === "hi" ? "hi-IN" : "en-IN";
      r.interimResults = false;
      r.maxAlternatives = 1;
      r.onstart = () => setListening(true);
      r.onresult = (e) => {
        setDraft(e.results[0][0].transcript);
        setListening(false);
      };
      r.onerror = r.onend = () => setListening(false);
      r.start();
    } catch {
      setListening(false);
    }
  };

  if (!roleCode) {
    return (
      <>
        <Navbar current="copilot" />
        <RoleGate onEnter={enter} />
        <Footer />
      </>
    );
  }

  const views = [
    ...(role.allowedTabs.includes("artifacts")
      ? [{ id: "reports", label: "Reports", node: <ArtifactsPanel canSign={role.canSignCRS} mask={mask} onDone={toast.show} /> }]
      : []),
    ...(role.allowedTabs.includes("files") ? [{ id: "files", label: "Files", node: <FilesPanel analyzing={analyzing} result={fileResult} onAnalyze={onAnalyze} /> }] : []),
  ];
  const showTimeline = role.allowedTabs.includes("timeline") && role.dataScopes.some((s) => s === "RAILCOMM" || s === "LOCATE");
  const showRake = role.allowedTabs.includes("wdd") && role.dataScopes.includes("WDD");

  return (
    <>
      <Navbar
        current="copilot"
        controls={{
          role: roleCode,
          onRole: switchRole,
          masked,
          maskForced: role.forceMasking,
          onToggleMask: () => {
            setMaskToggle((m) => !m);
            toast.show(maskToggle ? "Inquiry purpose declared — identity access is audited" : "Identities masked (routine monitoring)");
          },
          lang,
          onToggleLang: () => setLang((l) => (l === "en" ? "hi" : "en")),
        }}
      />

      <main
        id="copilot"
        className={`min-h-[calc(100vh-var(--nav-h))] bg-paper transition-[padding] duration-300 ease-brand ${
          chatOpen && canChat ? (chatWide ? "lg:pr-[min(820px,64vw)]" : "lg:pr-[420px]") : ""
        }`}
      >
        <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:py-10">
          <Dashboard
            role={role}
            data={data}
            mask={mask}
            lang={lang}
            onAsk={ask}
            views={views}
            compact={chatOpen && chatWide}
            timeline={showTimeline ? <TimelinePanel events={TIMELINE} mask={mask} lang={lang} /> : undefined}
            rake={showRake ? <WddPanel canIssue={role.canIssueWorkOrder} onIssue={(s) => toast.show(`Sick-line order issued · ${s}`)} /> : undefined}
          />
        </div>
      </main>

      {canChat && (
        <ChatPanel
          open={chatOpen}
          expanded={chatWide}
          onOpen={() => setChatOpen(true)}
          onClose={() => setChatOpen(false)}
          onToggleExpand={() => setChatWide((w) => !w)}
          onNewChat={() => {
            window.speechSynthesis?.cancel();
            setMessages([]);
          }}
          messages={messages}
          onSend={(q) => ask(q)}
          busy={busy}
          listening={listening}
          onMic={toggleMic}
          draft={draft}
          setDraft={setDraft}
          speakingId={speakingId}
          onSpeak={speak}
          mask={mask}
          lang={lang}
          role={role}
          modelEngine={modelEngine}
          setModelEngine={setModelEngine}
          starters={STARTERS.filter((s) => Array.from(requiredSources(s.query)).every((src) => role.dataScopes.includes(src)))}
        />
      )}
      <Toast message={toast.message} />
    </>
  );
}
