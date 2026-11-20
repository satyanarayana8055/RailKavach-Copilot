"use client";

import { useCallback, useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { RoleGate } from "./RoleGate";
import { Toast, useToast } from "@/components/Toast";
import { ArtifactsPanel } from "@/components/workspace/ArtifactsPanel";
import { CopilotPanel } from "@/components/workspace/CopilotPanel";
import { FilesPanel } from "@/components/workspace/FilesPanel";
import { ScenarioDeck } from "@/components/workspace/ScenarioDeck";
import { Tabs, TAB_META } from "@/components/workspace/Tabs";
import { TimelinePanel } from "@/components/workspace/TimelinePanel";
import { WddPanel } from "@/components/workspace/WddPanel";
import { analyzeFile, postChat } from "@/lib/api";
import { genericFallback, ROLES, SCENARIO_1_FALLBACK, SCENARIO_4_FALLBACK, SCENARIO_QUERIES, TIMELINE, WELCOME_RESPONSE, type ScenarioId } from "@/lib/data";
import { maskPII } from "@/lib/privacy";
import type { ChatResponse, FileAnalysisResult, TabId, UserRole } from "@/lib/types";

export function Workspace() {
  const [roleCode, setRoleCode] = useState<UserRole | null>(null);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [maskToggle, setMaskToggle] = useState(false);
  const [tab, setTab] = useState<TabId>("copilot");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState<number | null>(null);
  const [response, setResponse] = useState<ChatResponse>(WELCOME_RESPONSE);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [fileResult, setFileResult] = useState<FileAnalysisResult | null>(null);
  const toast = useToast();

  const role = ROLES[roleCode ?? "ROLE_SR_DSO"];

  // Deep links: /copilot?tab=timeline or ?scenario=1 (applied once a role is chosen).
  const [pending, setPending] = useState<{ tab?: TabId; scenario?: ScenarioId }>({});
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const n = Number(q.get("scenario"));
    setPending({ tab: (q.get("tab") as TabId) || undefined, scenario: n >= 1 && n <= 4 ? (n as ScenarioId) : undefined });
  }, []);
  const masked = maskToggle || role.forceMasking;
  const mask = useCallback((t: string) => maskPII(t, masked), [masked]);

  const enter = (code: UserRole) => {
    const r = ROLES[code];
    setRoleCode(code);
    setTab(pending.tab && r.allowedTabs.includes(pending.tab) ? pending.tab : r.allowedTabs[0]);
    if (pending.scenario && r.allowedTabs.includes("copilot")) runScenario(pending.scenario);
    setPending({});
  };

  const switchRole = (code: UserRole) => {
    const next = ROLES[code];
    setRoleCode(code);
    if (!next.allowedTabs.includes(tab)) setTab(next.allowedTabs[0]);
    toast.show(`Signed in as ${next.title}`);
  };

  const openTab = (t: TabId) => {
    if (!role.allowedTabs.includes(t)) {
      toast.show(`${TAB_META[t].label} isn’t available for ${role.short}`);
      return;
    }
    setTab(t);
  };

  const ask = async (q: string) => {
    setQuery(q);
    setLoading(true);
    if (role.allowedTabs.includes("copilot")) setTab("copilot");
    try {
      setResponse(await postChat(q, lang));
    } catch {
      setResponse(/miscommunication|caution order|callout/i.test(q) ? SCENARIO_4_FALLBACK : /12414|suratgarh/i.test(q) ? SCENARIO_1_FALLBACK : genericFallback(q));
    } finally {
      setLoading(false);
    }
  };

  const runScenario = async (n: ScenarioId) => {
    setRunning(n);
    await ask(SCENARIO_QUERIES[n]);
    setRunning(null);
  };

  const onAction = (a: string) => {
    const s = a.toLowerCase();
    if (/report|briefing|inquiry|export/.test(s)) openTab("artifacts");
    else if (/timeline/.test(s)) openTab("timeline");
    else if (/rake|boxn|wagon/.test(s)) openTab("wdd");
    else ask(a);
  };

  const onAnalyze = async (type: string, name: string) => {
    setAnalyzing(name);
    try {
      setFileResult(await analyzeFile(name, type));
    } catch {
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

  const speak = () => {
    if (!("speechSynthesis" in window)) return toast.show("Speech output isn’t supported in this browser");
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(mask(response.answer).replace(/\[\d{2}:\d{2}:\d{2}\]/g, "").replace(/[*#]/g, ""));
    u.lang = lang === "hi" ? "hi-IN" : "en-IN";
    u.onstart = () => setSpeaking(true);
    u.onend = u.onerror = () => setSpeaking(false);
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
        setQuery(e.results[0][0].transcript);
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

  return (
    <>
      <a href="#copilot" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-btn focus:bg-white focus:px-4 focus:py-2 focus:font-semibold">
        Skip to copilot
      </a>
      <Navbar
        current="copilot"
        controls={{
          role: roleCode,
          onRole: switchRole,
          masked,
          maskForced: role.forceMasking,
          onToggleMask: () => setMaskToggle((m) => !m),
          lang,
          onToggleLang: () => setLang((l) => (l === "en" ? "hi" : "en")),
        }}
      />

      <main>
        <section id="copilot" aria-labelledby="copilot-h" className="relative isolate">
          <div className="bg-grid-light mask-fade-b absolute inset-x-0 top-0 -z-10 h-[420px]" aria-hidden />
          <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:py-16">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="eyebrow eyebrow-light">RailKavach Copilot · Authorised workspace</p>
                <h1 id="copilot-h" className="h-display h-display-light mt-4 text-[36px] text-ink-950 sm:text-[52px]">
                  Ask once. <em>See everything.</em>
                </h1>
              </div>
              <div className="flex items-center gap-3 rounded-card border border-[var(--line)] bg-white px-4 py-3 shadow-card">
                <span className="grid h-9 w-9 place-items-center rounded-btn bg-orange-soft text-orange-ink">
                  <role.icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-950">{role.title}</p>
                  <p className="font-mono text-[11px] text-ink-500">
                    {role.division} · {masked ? "PII masked" : "PII visible"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <ScenarioDeck onRun={runScenario} running={running} />
            </div>

            <div className="mt-10">
              <Tabs allowed={role.allowedTabs} active={tab} onChange={setTab} />
            </div>

            <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="mt-6" key={tab}>
              <div className="animate-fade-up">
                {tab === "copilot" && (
                  <CopilotPanel
                    query={query}
                    setQuery={setQuery}
                    onSubmit={ask}
                    loading={loading}
                    response={response}
                    listening={listening}
                    onMic={toggleMic}
                    speaking={speaking}
                    onSpeak={speak}
                    mask={mask}
                    lang={lang}
                    role={role}
                    onAction={onAction}
                  />
                )}
                {tab === "files" && <FilesPanel analyzing={analyzing} result={fileResult} onAnalyze={onAnalyze} />}
                {tab === "timeline" && <TimelinePanel events={TIMELINE} mask={mask} lang={lang} />}
                {tab === "wdd" && <WddPanel canIssue={role.canIssueWorkOrder} onIssue={(s) => toast.show(`Sick-line order issued · ${s}`)} />}
                {tab === "artifacts" && <ArtifactsPanel canSign={role.canSignCRS} mask={mask} onDone={toast.show} />}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <Toast message={toast.message} />
    </>
  );
}
