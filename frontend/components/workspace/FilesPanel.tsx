"use client";

import { AlertTriangle, CheckCircle2, FileText, Film, Image as ImageIcon, LineChart, Radio, ScanLine } from "lucide-react";
import { SAMPLE_FILES } from "@/lib/data";
import type { FileAnalysisResult } from "@/lib/types";
import { Waveform } from "../Waveform";

const TONE = {
  blue: { ink: "text-blue-ink", soft: "bg-blue-soft", icon: Radio },
  violet: { ink: "text-violet-ink", soft: "bg-violet-soft", icon: Film },
  emerald: { ink: "text-ok-ink", soft: "bg-ok-soft", icon: ImageIcon },
  amber: { ink: "text-amber-ink", soft: "bg-amber-soft", icon: FileText },
  rose: { ink: "text-danger-ink", soft: "bg-danger-soft", icon: LineChart },
} as const;

const STEPS = ["Ingest", "Extract", "Ground"];

interface Props {
  analyzing: string | null;
  result: FileAnalysisResult | null;
  onAnalyze: (type: string, name: string) => void;
}

export function FilesPanel({ analyzing, result, onAnalyze }: Props) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {SAMPLE_FILES.map((f) => {
          const t = TONE[f.tone];
          const busy = analyzing === f.name;
          const done = result?.filename === f.name && !analyzing;
          return (
            <button
              key={f.name}
              type="button"
              onClick={() => onAnalyze(f.type, f.name)}
              disabled={!!analyzing}
              aria-pressed={done}
              className={`card card-hover group relative overflow-hidden p-4 text-left disabled:cursor-wait ${done ? "ring-2 ring-orange" : ""}`}
            >
              {busy && <div className="scanline" />}
              <div className="flex items-center justify-between">
                <span className={`grid h-10 w-10 place-items-center rounded-card ${t.soft} ${t.ink}`}>
                  <t.icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-mono text-[11px] font-semibold text-ink-400">.{f.ext}</span>
              </div>
              <p className="mt-4 text-[15px] font-semibold text-ink-950">{f.label}</p>
              <p className="mt-0.5 truncate font-mono text-[11px] text-ink-500">{f.name}</p>
            </button>
          );
        })}
      </div>

      {analyzing && (
        <div className="on-dark relative overflow-hidden rounded-panel bg-ink-950 p-6 text-white" aria-live="polite">
          <div className="bg-grid-dark absolute inset-0 opacity-50" aria-hidden />
          <div className="scanline" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ScanLine className="h-5 w-5 text-cyan" aria-hidden />
              <span className="font-mono text-sm">{analyzing}</span>
            </div>
            <ol className="flex items-center gap-2">
              {STEPS.map((s, i) => (
                <li key={s} className="flex animate-fade-up items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ink-200" style={{ animationDelay: `${i * 0.35}s` }}>
                  <span className="h-1.5 w-1.5 animate-blink rounded-full bg-amber" aria-hidden /> {s}
                  {i < STEPS.length - 1 && <span className="h-px w-6 bg-white/20" aria-hidden />}
                </li>
              ))}
            </ol>
          </div>
          <Waveform bars={64} tone="cyan" className="relative mt-5 h-10" noise={0.6} />
        </div>
      )}

      {result && !analyzing && <FileResult r={result} />}
    </div>
  );
}

function Field({ label, children, tone = "default" }: { label: string; children: React.ReactNode; tone?: "default" | "danger" | "ok" }) {
  const border = tone === "danger" ? "border-danger/30" : tone === "ok" ? "border-ok/30" : "border-[var(--line)]";
  return (
    <div className={`rounded-card border bg-white p-4 ${border}`}>
      <p className="mono-label text-ink-500">{label}</p>
      <div className="mt-1.5 text-sm font-semibold text-ink-950">{children}</div>
    </div>
  );
}

function FileResult({ r }: { r: FileAnalysisResult }) {
  return (
    <article className="card animate-fade-up p-5 sm:p-6" aria-label="Analysis result">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="h-5 w-5 text-ok" aria-hidden />
          <span className="font-mono text-sm font-semibold text-ink-950">{r.filename}</span>
          <span className="chip border-cyan/30 bg-cyan-soft font-mono text-cyan-ink">{r.category}</span>
        </div>
        {r.critical_timestamp && <span className="chip border-orange/30 bg-orange-soft font-mono text-orange-ink">⏱ {r.critical_timestamp}</span>}
      </header>

      {r.summary && <p className="mt-4 text-[15px] leading-relaxed text-ink-800">{r.summary}</p>}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {r.violation_detected && (
          <Field label="Violation" tone="danger">
            <span className="flex items-center gap-1.5 text-danger-ink">
              <AlertTriangle className="h-4 w-4" aria-hidden /> {r.violation_detected}
            </span>
            {r.confidence != null && (
              <div className="mt-2 h-1.5 rounded-full bg-danger-soft">
                <div className="h-full rounded-full bg-danger" style={{ width: `${Math.round(r.confidence * 100)}%` }} />
              </div>
            )}
          </Field>
        )}
        {r.reviewer_status && (
          <Field label="Human reviewer" tone="ok">
            <span className="text-ok-ink">{r.reviewer_status}</span>
          </Field>
        )}
        {r.wagon_number_ocr && (
          <Field label="OCR serial">
            <span className="font-mono">{r.wagon_number_ocr}</span>
          </Field>
        )}
        {r.transit_delta && <Field label="Transit delta">{r.transit_delta}</Field>}
        {r.speed_restriction && <Field label="Restriction">{r.speed_restriction}</Field>}
        {r.spad_status && <Field label="SPAD status">{r.spad_status}</Field>}
        {r.liability && <Field label="Liability">{r.liability}</Field>}
      </div>

      {r.key_dialogue && (
        <blockquote className="mt-4 rounded-card border-l-4 border-cyan bg-cyan-soft/50 p-4 text-[15px] text-ink-900">
          <span className="mono-label mb-1 block text-cyan-ink">Denoised dialogue</span>
          {r.key_dialogue}
        </blockquote>
      )}

      {(r.defects_detected?.length || r.safety_keywords_detected?.length) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {r.defects_detected?.map((d, i) => (
            <span key={i} className="chip border-danger/30 bg-danger-soft font-mono text-danger-ink">
              {d.class} · {d.detail}
            </span>
          ))}
          {r.safety_keywords_detected?.map((k) => (
            <span key={k} className="chip border-amber/40 bg-amber-soft font-mono text-amber-ink">
              {k}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
