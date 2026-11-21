"use client";

import {
  ArrowUp, Camera, ChevronDown, Eye, EyeOff, Fingerprint, Maximize2, Mic, MicOff, Minimize2, PanelRightClose,
  Loader2, Pause, Play, Radio, ShieldAlert, Sparkles, Square, SquarePen, Train, Volume2, VolumeX,
} from "lucide-react";
import { Fragment, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { VoiceState } from "@/lib/voice";
import type { ChatResponse, RoleMetadata } from "@/lib/types";
import type { Session } from "@/lib/api";
import { CustodyRow, RuleChips } from "./Trust";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  response?: ChatResponse;
  pending?: boolean;
}

interface Props {
  open: boolean;
  expanded: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggleExpand: () => void;
  onNewChat: () => void;
  messages: ChatMessage[];
  onSend: (q: string) => void;
  busy: boolean;
  listening: boolean;
  onMic: () => void;
  /** Live voice input state: level 0..1 for the meter, interim captions while speaking. */
  voice?: { state: VoiceState; level: number; interim: string; cancel: () => void };
  draft: string;
  setDraft: (q: string) => void;
  speakingId: string | null;
  onSpeak: (m: ChatMessage) => void;
  speakPaused?: boolean;
  /** e.g. "Indian English · Rishi" */
  speakVoice?: string;
  onPauseSpeak?: () => void;
  onStopSpeak?: () => void;
  mask: (t: string) => string;
  lang: "en" | "hi";
  role: RoleMetadata;
  starters: Array<{ label: string; query: string; hindi?: boolean }>;
  /** Role + purpose used to verify evidence and download §63 drafts. */
  session: Session;
  modelEngine?: "gemini" | "gemma";
  setModelEngine?: (m: "gemini" | "gemma") => void;
}

/* ---------- lightweight markdown: headings, bullets, **bold**, [HH:MM:SS] chips ---------- */

const TS = /^\[\d{2}:\d{2}:\d{2}\]$/;

function chip(t: string, key: string) {
  return (
    <span key={key} className="mx-0.5 inline-block rounded bg-ink-950 px-1 py-px align-[1px] font-mono text-[11px] font-semibold text-amber">
      {t.slice(1, -1)}
    </span>
  );
}

/** Timestamps → chips; everything else plain. Backticks are dropped (model formatting noise). */
function plain(text: string, key: string): ReactNode[] {
  return text
    .replace(/`/g, "")
    .split(/(\[\d{2}:\d{2}:\d{2}\])/g)
    .map((part, i) => (TS.test(part) ? chip(part, `${key}-${i}`) : <Fragment key={`${key}-${i}`}>{part}</Fragment>));
}

/** **bold** and *italic* (each may contain timestamp chips). */
function inline(text: string, key: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g).map((part, i) => {
    const k = `${key}-${i}`;
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={k} className="font-semibold text-ink-950">{plain(part.slice(2, -2), k)}</strong>;
    if (/^\*[^*]+\*$/.test(part)) return <em key={k} className="not-italic text-ink-600">{plain(part.slice(1, -1), k)}</em>;
    return <Fragment key={k}>{plain(part, k)}</Fragment>;
  });
}

function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: ReactNode[] = [];
  const flush = (k: number) => {
    if (list.length) blocks.push(<ul key={`ul-${k}`} className="my-1.5 space-y-1 pl-4 [&>li]:list-disc [&>li]:marker:text-ink-300">{list}</ul>);
    list = [];
  };
  text.split("\n").forEach((raw, i) => {
    const line = raw.trim();
    if (!line || /^-{3,}$/.test(line)) return flush(i);
    const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (bullet) return void list.push(<li key={i}>{inline(bullet[1], `l${i}`)}</li>);
    flush(i);
    const h = line.match(/^#{1,6}\s+(.*)$/);
    if (h) blocks.push(<p key={i} className="mt-3 text-[13px] font-semibold uppercase tracking-wide text-ink-500 first:mt-0">{h[1].replace(/\*\*/g, "")}</p>);
    else blocks.push(<p key={i} className="my-1.5">{inline(line, `p${i}`)}</p>);
  });
  flush(-1);
  return <div className="text-[14px] leading-relaxed text-ink-800">{blocks}</div>;
}

/* ---------- message parts ---------- */

function sourceIcon(src: string) {
  const s = src.toLowerCase();
  if (s.includes("locate") || s.includes("cabin") || s.includes("cvvrs")) return Camera;
  if (s.includes("wdd") || s.includes("gantry")) return Train;
  return Radio;
}

function Evidence({ r, mask, p }: { r: ChatResponse; mask: (t: string) => string; p: Props }) {
  const [open, setOpen] = useState(false);
  if (!r.citations.length) return null;
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 rounded-btn border border-[var(--line)] bg-white px-2 py-1 text-[12px] font-semibold text-ink-700 transition hover:border-ink-300"
      >
        <Fingerprint className="h-3.5 w-3.5 text-orange-ink" aria-hidden /> Evidence · {r.citations.length}
        <ChevronDown className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <ol className="mt-2 space-y-1.5 border-l-2 border-orange/40 pl-3">
          {r.citations.map((c, i) => {
            const Icon = sourceIcon(c.source);
            return (
              <li key={i} className="text-[13px] leading-snug text-ink-700">
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-ink-500">
                  <span className="font-semibold text-ink-900">{c.timestamp}</span>
                  <Icon className="h-3 w-3" aria-hidden /> {c.source}
                  {c.reviewer_status && <span className="text-ok-ink">· {c.reviewer_status.replace(/_/g, " ").toLowerCase()}</span>}
                </span>
                {mask(c.event_description)}
                {r.access && <CustodyRow c={c} session={p.session} canCertify={p.role.canSignCRS || p.role.canViewAudit} />}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function AccessLine({ r }: { r: ChatResponse }) {
  const a = r.access;
  if (!a) return null;
  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-ink-500">
      <span className="flex items-center gap-1">
        {a.pii_masked ? <EyeOff className="h-3 w-3" aria-hidden /> : <Eye className="h-3 w-3 text-blue-ink" aria-hidden />}
        {a.pii_masked ? "identities masked" : "identities visible · audited"}
      </span>
      {a.sources_withheld.length > 0 && a.decision !== "DENIED" && <span>· withheld: {a.sources_withheld.join(", ").toLowerCase()}</span>}
      <span>· {r.model_engine ?? (r.cached ? "cached" : "gemini")}</span>
      <span>· {r.cached ? "cached" : `${r.token_usage?.total_tokens ?? 0} tok`} · {r.latency_ms} ms</span>
      {a.audit_seq != null ? <span title={a.audit_hash ?? undefined}>· audit #{a.audit_seq}</span> : <span>· offline</span>}
    </p>
  );
}

function AssistantMessage({ m, p }: { m: ChatMessage; p: Props }) {
  const r = m.response;
  if (m.pending || !r)
    return (
      <div className="flex items-center gap-2 py-1 text-[13px] text-ink-500" aria-live="polite">
        <span className="flex gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-1.5 w-1.5 animate-blink rounded-full bg-orange" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </span>
        Correlating radio, cabin and wagon evidence…
      </div>
    );
  if (r.access?.decision === "DENIED")
    return (
      <div role="alert" className="flex items-start gap-2.5 rounded-card border border-danger/25 bg-danger-soft p-3 text-[14px] leading-relaxed text-ink-900">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-danger-ink" aria-hidden />
        <span>{r.access.reason ?? r.answer}</span>
      </div>
    );
  return (
    <div className="group">
      <Markdown text={p.mask(r.answer)} />
      <RuleChips rules={r.rules} />
      <Evidence r={r} mask={p.mask} p={p} />
      <AccessLine r={r} />
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {r.suggested_actions?.slice(0, 3).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => p.onSend(a)}
            className="rounded-full border border-[var(--line)] bg-white px-2.5 py-1 text-[12px] font-medium text-ink-700 transition hover:border-orange hover:text-orange-ink"
          >
            {a}
          </button>
        ))}
        <button
          type="button"
          onClick={() => p.onSpeak(m)}
          aria-label={p.speakingId === m.id ? "Stop reading aloud" : "Read answer aloud"}
          aria-pressed={p.speakingId === m.id}
          className="ml-auto grid h-7 w-7 place-items-center rounded-btn text-ink-500 transition hover:bg-paper hover:text-ink-900"
        >
          {p.speakingId === m.id ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
}

/* ---------- panel ---------- */

export function ChatPanel(p: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [p.messages]);
  useEffect(() => {
    if (p.open) input.current?.focus();
  }, [p.open]);
  useEffect(() => {
    const el = input.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [p.draft]);

  const send = () => {
    const q = p.draft.trim();
    if (q && !p.busy) p.onSend(q);
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  if (!p.open)
    return (
      <button
        type="button"
        onClick={p.onOpen}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-ink-950 py-3 pl-4 pr-3 text-sm font-semibold text-white shadow-lift transition hover:-translate-y-0.5"
        aria-label="Open Copilot chat"
      >
        <Sparkles className="h-4 w-4 text-amber" aria-hidden /> Ask Copilot
        <kbd className="hidden rounded border border-white/20 px-1.5 font-mono text-[11px] text-ink-200 sm:inline">⌘I</kbd>
      </button>
    );

  return (
    <aside
      aria-label="Copilot chat"
      className={`fixed bottom-0 right-0 top-[var(--nav-h)] z-40 flex w-full flex-col border-l border-[var(--line)] bg-white shadow-[-12px_0_32px_-24px_rgba(15,19,24,.35)] transition-[width] duration-300 ease-brand ${
        p.expanded ? "sm:w-[min(820px,64vw)]" : "sm:w-[420px]"
      }`}
      onKeyDown={(e) => e.key === "Escape" && p.onClose()}
    >
      {/* header */}
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-[var(--line)] pl-4 pr-2">
        <Sparkles className="h-4 w-4 text-orange" aria-hidden />
        <h2 className="text-sm font-semibold text-ink-950">Copilot</h2>
        <span className="truncate rounded-full bg-paper px-2 py-0.5 font-mono text-[11px] text-ink-600">{p.role.short}</span>
        {p.setModelEngine && (
          <div className="ml-1 flex items-center rounded-full border border-[var(--line)] bg-paper p-0.5 font-mono text-[11px]" role="group" aria-label="Model Engine">
            <button
              type="button"
              onClick={() => p.setModelEngine?.("gemini")}
              className={`rounded-full px-2 py-0.5 transition ${p.modelEngine !== "gemma" ? "bg-orange font-semibold text-white shadow-xs" : "text-ink-600 hover:text-ink-950"}`}
              title="Google Gemini Cloud (1.5 Flash)"
            >
              Gemini
            </button>
            <button
              type="button"
              onClick={() => p.setModelEngine?.("gemma")}
              className={`rounded-full px-2 py-0.5 transition ${p.modelEngine === "gemma" ? "bg-amber font-semibold text-ink-950 shadow-xs" : "text-ink-600 hover:text-ink-950"}`}
              title="Gemma 2 9B Local Edge (High-Accuracy On-Premise)"
            >
              Gemma 2
            </button>
          </div>
        )}
        <div className="ml-auto flex items-center">
          {[
            { icon: SquarePen, label: "New chat", on: p.onNewChat },
            { icon: p.expanded ? Minimize2 : Maximize2, label: p.expanded ? "Narrow panel" : "Widen panel", on: p.onToggleExpand, hideSm: true },
            { icon: PanelRightClose, label: "Collapse chat (Esc)", on: p.onClose },
          ].map((b) => (
            <button
              key={b.label}
              type="button"
              onClick={b.on}
              title={b.label}
              aria-label={b.label}
              className={`grid h-8 w-8 place-items-center rounded-btn text-ink-500 transition hover:bg-paper hover:text-ink-950 ${b.hideSm ? "hidden sm:grid" : ""}`}
            >
              <b.icon className="h-4 w-4" aria-hidden />
            </button>
          ))}
        </div>
      </header>

      {/* thread */}
      <div ref={scroller} className="flex-1 overflow-y-auto px-4 py-4" aria-live="polite">
        {p.messages.length === 0 ? (
          <div className="flex h-full flex-col justify-end pb-2">
            <p className="font-display text-[22px] font-semibold leading-snug text-ink-950">
              Ask about any train,
              <br />
              crew or rake.
            </p>
            <p className="mt-1.5 text-[13px] text-ink-500">Answers cite the radio, cabin and wagon evidence your role can see.</p>
            <ul className="mt-5 space-y-1.5">
              {p.starters.map((s) => (
                <li key={s.label}>
                  <button
                    type="button"
                    onClick={() => p.onSend(s.query)}
                    className={`w-full rounded-btn border border-[var(--line)] px-3 py-2 text-left text-[13px] text-ink-800 transition hover:border-orange hover:bg-orange-soft/40 ${s.hindi ? "hi" : ""}`}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ol className="space-y-5">
            {p.messages.map((m) => (
              <li key={m.id} data-msg={m.role} className={m.role === "user" ? "flex justify-end" : ""}>
                {m.role === "user" ? (
                  <p className="max-w-[85%] whitespace-pre-wrap rounded-[14px] rounded-br-[4px] bg-ink-950 px-3.5 py-2 text-[14px] leading-relaxed text-white">{p.mask(m.text)}</p>
                ) : (
                  <AssistantMessage m={m} p={p} />
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* composer */}
      <div className="shrink-0 border-t border-[var(--line)] p-3">
        <div className="rounded-card border border-ink-100 bg-white transition focus-within:border-ink-900 focus-within:shadow-[0_0_0_3px_rgba(244,130,32,.12)]">
          <label htmlFor="copilot-input" className="sr-only">
            Ask the copilot
          </label>
          {p.voice && p.voice.state !== "idle" && <VoiceBar v={p.voice} lang={p.lang} onStop={p.onMic} />}
          {p.speakingId && !(p.voice && p.voice.state !== "idle") && p.onStopSpeak && (
            <SpeakBar paused={!!p.speakPaused} voice={p.speakVoice} onPause={p.onPauseSpeak} onStop={p.onStopSpeak} />
          )}
          <textarea
            id="copilot-input"
            ref={input}
            rows={1}
            value={p.draft}
            onChange={(e) => p.setDraft(e.target.value)}
            onKeyDown={onKey}
            placeholder={p.listening ? "Listening…" : p.lang === "hi" ? "हिन्दी या English में पूछें…" : "Ask in English or हिन्दी…"}
            className="block max-h-40 w-full resize-none bg-transparent px-3 pb-1 pt-2.5 text-[14px] text-ink-950 placeholder:text-ink-400 focus:outline-none"
          />
          <div className="flex items-center justify-between px-2 pb-2">
            <button
              type="button"
              onClick={p.onMic}
              aria-pressed={p.listening}
              aria-label={p.listening ? "Stop voice input" : "Ask by voice, in Hindi or English"}
              title="Ask by voice · हिन्दी or English"
              disabled={p.voice?.state === "transcribing"}
              className={`flex h-8 items-center gap-1.5 rounded-btn px-2 transition disabled:opacity-60 ${p.listening ? "bg-danger-soft text-danger-ink" : "text-ink-500 hover:bg-paper hover:text-ink-950"}`}
            >
              {p.listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span className="font-mono text-[10.5px] font-semibold">हिं · EN</span>
            </button>
            <span className="hidden font-mono text-[10px] text-ink-400 sm:inline">Enter to send · Shift+Enter new line</span>
            <button
              type="button"
              onClick={send}
              disabled={!p.draft.trim() || p.busy}
              aria-label="Send"
              className="grid h-8 w-8 place-items-center rounded-btn bg-orange-ink text-white transition hover:bg-[#a5370a] disabled:bg-ink-100 disabled:text-ink-400"
            >
              <ArrowUp className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

/** Shown above the input while the mic is open: live level, what we've heard so far, and a stop button. */
function VoiceBar({ v, lang, onStop }: { v: { state: VoiceState; level: number; interim: string; cancel: () => void }; lang: "en" | "hi"; onStop: () => void }) {
  const listening = v.state === "listening";
  const bars = 18;
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 border-b border-[var(--line)] px-3 py-2.5">
      <span className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full ${listening ? "bg-danger text-white" : "bg-ink-950 text-white"}`}>
        {listening && <span className="absolute inset-0 rounded-full bg-danger/40 motion-safe:animate-ping" aria-hidden />}
        {listening ? <Mic className="relative h-4 w-4" aria-hidden /> : <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      </span>
      <div className="min-w-0 flex-1">
        {listening ? (
          <span className="flex h-5 items-center gap-[3px]" aria-hidden>
            {Array.from({ length: bars }, (_, i) => {
              const shape = 0.35 + 0.65 * Math.sin(((i + 1) / (bars + 1)) * Math.PI);
              return <span key={i} className="w-[3px] rounded-full bg-danger transition-[height] duration-75" style={{ height: `${Math.max(12, Math.min(100, v.level * shape * 160))}%` }} />;
            })}
          </span>
        ) : (
          <span className="block text-[12.5px] font-semibold text-ink-900">{lang === "hi" ? "समझ रहे हैं…" : "Transcribing…"}</span>
        )}
        <span className={`mt-0.5 block truncate text-[12.5px] ${v.interim ? "text-ink-800" : "text-ink-400"} ${/[\u0900-\u097F]/.test(v.interim) ? "hi" : ""}`}>
          {v.interim || (listening ? (lang === "hi" ? "बोलिए… हिन्दी या English" : "Listening… speak in Hindi or English") : "Hindi, English or both")}
        </span>
      </div>
      {listening && (
        <>
          <button type="button" onClick={v.cancel} className="rounded-btn px-2 py-1 text-[12px] font-semibold text-ink-500 hover:bg-paper hover:text-ink-950">
            Cancel
          </button>
          <button type="button" onClick={onStop} className="flex items-center gap-1 rounded-btn bg-ink-950 px-2.5 py-1 text-[12px] font-semibold text-white hover:bg-ink-800">
            <Square className="h-3 w-3 fill-current" aria-hidden /> Done
          </button>
        </>
      )}
    </div>
  );
}

/** Shown while an answer is read aloud: pause/resume and stop, always one click away. */
function SpeakBar({ paused, voice, onPause, onStop }: { paused: boolean; voice?: string; onPause?: () => void; onStop: () => void }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3 border-b border-[var(--line)] px-3 py-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-soft text-orange-ink">
        <Volume2 className="h-4 w-4" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-2.5">
        <span className="flex h-4 items-end gap-[3px]" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`w-[3px] origin-bottom rounded-full bg-orange ${paused ? "h-1.5" : "h-4 motion-safe:animate-eq"}`}
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[12.5px] font-semibold text-ink-900">{paused ? "Paused" : "Reading aloud"}</span>
          {voice && <span className="block truncate font-mono text-[10px] text-ink-500">{voice}</span>}
        </span>
      </span>
      {onPause && (
        <button
          type="button"
          onClick={onPause}
          aria-label={paused ? "Resume reading" : "Pause reading"}
          className="flex items-center gap-1 rounded-btn border border-[var(--line)] px-2.5 py-1 text-[12px] font-semibold text-ink-800 hover:border-ink-300"
        >
          {paused ? <Play className="h-3 w-3 fill-current" aria-hidden /> : <Pause className="h-3 w-3 fill-current" aria-hidden />}
          {paused ? "Resume" : "Pause"}
        </button>
      )}
      <button
        type="button"
        onClick={onStop}
        aria-label="Stop reading"
        className="flex items-center gap-1 rounded-btn bg-ink-950 px-2.5 py-1 text-[12px] font-semibold text-white hover:bg-ink-800"
      >
        <Square className="h-3 w-3 fill-current" aria-hidden /> Stop
      </button>
    </div>
  );
}
