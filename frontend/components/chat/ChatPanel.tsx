"use client";

import {
  ArrowUp, Camera, ChevronDown, Eye, EyeOff, Fingerprint, Maximize2, Mic, MicOff, Minimize2, PanelRightClose,
  Radio, ShieldAlert, Sparkles, SquarePen, Train, Volume2, VolumeX,
} from "lucide-react";
import { Fragment, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { ChatResponse, RoleMetadata } from "@/lib/types";

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
  draft: string;
  setDraft: (q: string) => void;
  speakingId: string | null;
  onSpeak: (m: ChatMessage) => void;
  mask: (t: string) => string;
  lang: "en" | "hi";
  role: RoleMetadata;
  starters: Array<{ label: string; query: string; hindi?: boolean }>;
}

/* ---------- lightweight markdown: headings, bullets, **bold**, [HH:MM:SS] chips ---------- */

function inline(text: string, key: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\[\d{2}:\d{2}:\d{2}\])/g).map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={`${key}-${i}`} className="font-semibold text-ink-950">{part.slice(2, -2)}</strong>;
    if (/^\[\d{2}:\d{2}:\d{2}\]$/.test(part))
      return (
        <span key={`${key}-${i}`} className="mx-0.5 inline-block rounded bg-ink-950 px-1 py-px align-[1px] font-mono text-[11px] font-semibold text-amber">
          {part.slice(1, -1)}
        </span>
      );
    return <Fragment key={`${key}-${i}`}>{part.replace(/`/g, "")}</Fragment>;
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

function Evidence({ r, mask }: { r: ChatResponse; mask: (t: string) => string }) {
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
      <Evidence r={r} mask={p.mask} />
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
              <li key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
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
              aria-label={p.listening ? "Stop voice input" : "Voice input"}
              className={`grid h-8 w-8 place-items-center rounded-btn transition ${p.listening ? "bg-danger-soft text-danger-ink" : "text-ink-500 hover:bg-paper hover:text-ink-950"}`}
            >
              {p.listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
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
