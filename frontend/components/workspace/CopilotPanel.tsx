"use client";

import { ArrowUpRight, Camera, CheckCircle2, Mic, MicOff, Radio, RefreshCw, Send, Sparkles, Train, Volume2, VolumeX, Zap } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { MarkdownView } from "@/components/MarkdownView";
import { SUGGESTED_PROMPTS } from "@/lib/data";
import { toSeconds } from "@/lib/privacy";
import type { ChatResponse, RoleMetadata } from "@/lib/types";
import { Waveform } from "../Waveform";

interface Props {
  query: string;
  setQuery: (q: string) => void;
  onSubmit: (q: string) => void;
  loading: boolean;
  response: ChatResponse;
  listening: boolean;
  onMic: () => void;
  speaking: boolean;
  onSpeak: () => void;
  mask: (t: string) => string;
  lang: "en" | "hi";
  role: RoleMetadata;
  onAction: (a: string) => void;
}

function sourceIcon(src: string) {
  const s = src.toLowerCase();
  if (s.includes("cam") || s.includes("locate")) return Camera;
  if (s.includes("telemetry") || s.includes("wdd") || s.includes("gantry")) return Train;
  return Radio;
}

/** Horizontal evidence rail: citations positioned by timestamp. */
function EvidenceRail({ citations, active, onPick, mask }: { citations: ChatResponse["citations"]; active: number; onPick: (i: number) => void; mask: (t: string) => string }) {
  const secs = citations.map((c) => (/^\d{2}:\d{2}:\d{2}$/.test(c.timestamp) ? toSeconds(c.timestamp) : NaN));
  const valid = secs.filter((s) => !Number.isNaN(s));
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const span = Math.max(1, max - min);
  const pos = (i: number) => (Number.isNaN(secs[i]) || valid.length < 2 ? (i + 0.5) / citations.length : 0.04 + 0.92 * ((secs[i] - min) / span));
  const cur = citations[active];
  const Icon = cur ? sourceIcon(cur.source) : Radio;

  return (
    <div>
      <div className="relative h-14" role="group" aria-label="Evidence timeline">
        <div className="absolute inset-x-0 top-1/2 h-px bg-ink-100" aria-hidden />
        <div
          className="absolute top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-brand-x transition-all duration-500 ease-brand"
          style={{ left: `${pos(0) * 100}%`, width: `${Math.max(0, pos(active) - pos(0)) * 100}%` }}
          aria-hidden
        />
        {citations.map((c, i) => {
          const on = i === active;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onPick(i)}
              aria-pressed={on}
              aria-label={`${c.timestamp} ${c.source}`}
              className="group absolute top-1/2 -translate-x-1/2 -translate-y-1/2 p-2"
              style={{ left: `${pos(i) * 100}%` }}
            >
              <span className={`block rounded-full border-2 border-white transition-all ${on ? "h-4 w-4 bg-orange shadow-glow" : "h-3 w-3 bg-ink-300 group-hover:bg-ink-700"}`} />
              <span className={`absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap font-mono text-[11px] ${on ? "font-semibold text-ink-950" : "text-ink-500"}`}>
                {c.timestamp}
              </span>
            </button>
          );
        })}
      </div>
      {cur && (
        <div key={active} className="mt-6 flex animate-fade-up items-start gap-3 rounded-card border border-[var(--line)] bg-paper/60 p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-btn bg-white text-orange-ink shadow-card">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-ink-950">{cur.source}</span>
              {cur.reviewer_status && (
                <span className={`chip ${cur.reviewer_status === "CONFIRMED" ? "border-ok/30 bg-ok-soft text-ok-ink" : "border-amber/30 bg-amber-soft text-amber-ink"}`}>
                  <CheckCircle2 className="h-3 w-3" aria-hidden /> {cur.reviewer_status}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-ink-700">{mask(cur.event_description)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function CopilotPanel(p: Props) {
  const [active, setActive] = useState(0);
  useEffect(() => setActive(Math.min(1, p.response.citations.length - 1)), [p.response]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (p.query.trim()) p.onSubmit(p.query);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="min-w-0 space-y-4">
        <form onSubmit={submit} role="search">
          <div
            className={`flex items-center gap-2 rounded-panel border bg-white p-2 shadow-card transition ${
              p.listening ? "border-danger ring-4 ring-danger/15" : "border-[var(--line)] focus-within:border-orange focus-within:ring-4 focus-within:ring-orange/15"
            }`}
          >
            <button
              type="button"
              onClick={p.onMic}
              aria-pressed={p.listening}
              aria-label={p.listening ? "Stop listening" : "Speak your question"}
              className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-card transition ${p.listening ? "bg-danger text-white" : "bg-paper text-ink-700 hover:bg-orange-soft hover:text-orange-ink"}`}
            >
              {p.listening && <span className="absolute inset-0 animate-ping2 rounded-card bg-danger/40" aria-hidden />}
              {p.listening ? <MicOff className="relative h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <label htmlFor="q" className="sr-only">
              Ask RailKavach Copilot
            </label>
            <input
              id="q"
              value={p.query}
              onChange={(e) => p.setQuery(e.target.value)}
              placeholder={p.listening ? "Listening…" : p.lang === "en" ? "Ask about a train, crew or rake…" : "ट्रेन, क्रू या रेक के बारे में पूछें…"}
              className={`min-w-0 flex-1 bg-transparent px-1 text-[15px] text-ink-950 placeholder:text-ink-400 focus:outline-none ${p.lang === "hi" ? "hi" : ""}`}
            />
            {p.listening && <Waveform bars={10} tone="orange" className="hidden h-6 w-20 sm:flex" />}
            <button type="submit" disabled={p.loading} className="btn-orange h-11 px-5">
              {p.loading ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
              <span className="hidden sm:inline">{p.loading ? "Analysing" : "Ask"}</span>
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <Sparkles className="h-4 w-4 text-orange-ink" aria-hidden />
          {SUGGESTED_PROMPTS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => p.onSubmit(s.query)}
              className={`rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-[13px] font-medium text-ink-700 transition hover:border-orange/50 hover:text-ink-950 ${"hindi" in s ? "hi" : ""}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <article className="card relative overflow-hidden p-5 sm:p-6" aria-live="polite" aria-busy={p.loading}>
          {p.loading && <div className="absolute inset-x-0 top-0 h-[2px] overflow-hidden bg-orange-soft"><div className="h-full w-1/3 animate-progress bg-orange" /></div>}
          <header className="flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-ink-950">
              <span className="grid h-7 w-7 place-items-center rounded-btn bg-ink-950 text-amber">
                <Zap className="h-3.5 w-3.5" aria-hidden />
              </span>
              Gemini · Agent Skills
            </span>
            <div className="flex items-center gap-2">
              <span className="chip border-ok/25 bg-ok-soft font-mono text-ok-ink">{p.response.cached ? "Cache · 0 tok" : `${p.response.token_usage.total_tokens} tok`}</span>
              <span className="chip border-[var(--line)] bg-paper font-mono text-ink-700">{p.response.latency_ms} ms</span>
              <button
                type="button"
                onClick={p.onSpeak}
                aria-pressed={p.speaking}
                aria-label={p.speaking ? "Stop reading aloud" : "Read answer aloud"}
                className={`grid h-8 w-8 place-items-center rounded-btn border transition ${p.speaking ? "border-amber bg-amber-soft text-amber-ink" : "border-[var(--line)] text-ink-700 hover:bg-paper"}`}
              >
                {p.speaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>
          </header>

          <div className="mt-4">
            <MarkdownView content={p.mask(p.response.answer)} className={p.loading ? "opacity-40" : ""} />
          </div>

          {p.response.citations.length > 0 && (
            <section className="mt-6 border-t border-[var(--line)] pt-5" aria-label="Grounded evidence">
              <p className="mono-label mb-1 text-ink-500">Evidence · {p.response.citations.length}</p>
              <EvidenceRail citations={p.response.citations} active={active} onPick={setActive} mask={p.mask} />
            </section>
          )}

          {p.response.suggested_actions?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {p.response.suggested_actions.map((a) => (
                <button key={a} type="button" onClick={() => p.onAction(a)} className="group flex items-center gap-1.5 rounded-btn border border-[var(--line)] bg-white px-3 py-2 text-[13px] font-semibold text-ink-900 transition hover:border-ink-900">
                  {a}
                  <ArrowUpRight className="h-3.5 w-3.5 text-orange-ink transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </button>
              ))}
            </div>
          )}
        </article>
      </div>

      <aside className="space-y-4" aria-label="Context">
        <div className="card p-5">
          <p className="mono-label text-ink-500">Grounded in</p>
          <ul className="mt-3 space-y-2.5">
            {[
              { icon: Radio, name: "Railcomm", tone: "text-cyan-ink bg-cyan-soft" },
              { icon: Camera, name: "Locate", tone: "text-orange-ink bg-orange-soft" },
              { icon: Train, name: "WDD", tone: "text-amber-ink bg-amber-soft" },
            ].map((s) => (
              <li key={s.name} className="flex items-center gap-3">
                <span className={`grid h-8 w-8 place-items-center rounded-btn ${s.tone}`}>
                  <s.icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="flex-1 text-sm font-semibold text-ink-900">{s.name}</span>
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-ok-ink">
                  <span className="h-1.5 w-1.5 animate-blink rounded-full bg-ok" aria-hidden /> live
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card bg-ink-950 p-5 text-white">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-card bg-orange text-white">
              <p.role.icon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{p.role.designation}</p>
              <p className="font-mono text-[11px] text-ink-300">{p.role.division}</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-[13px]">
            {[
              ["Sign CRS reports", p.role.canSignCRS],
              ["Issue work orders", p.role.canIssueWorkOrder],
              ["Unmasked PII", !p.role.forceMasking],
            ].map(([label, ok]) => (
              <li key={label as string} className="flex items-center justify-between">
                <span className="text-ink-200">{label}</span>
                <span className={`font-mono text-[11px] font-semibold ${ok ? "text-ok" : "text-ink-400"}`}>{ok ? "ALLOWED" : "NO"}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
