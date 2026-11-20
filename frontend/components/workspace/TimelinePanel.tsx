"use client";

import { AlertTriangle, Camera, Gauge, Radio } from "lucide-react";
import { useState } from "react";
import { toSeconds } from "@/lib/privacy";
import type { EventSource, TimelineEvent } from "@/lib/types";

const LANES: Array<{ id: EventSource; label: string; icon: typeof Radio }> = [
  { id: "RAILCOMM_AUDIO", label: "Railcomm", icon: Radio },
  { id: "LOCATE_CABIN_CAM", label: "Locate", icon: Camera },
  { id: "LOCO_TELEMETRY", label: "Telemetry", icon: Gauge },
];

const WINDOWS = {
  full: { label: "5 min", from: "03:10:00", to: "03:15:00", ticks: ["03:10", "03:11", "03:12", "03:13", "03:14", "03:15"] },
  critical: { label: "60 s", from: "03:14:00", to: "03:15:00", ticks: ["03:14:00", "03:14:15", "03:14:30", "03:14:45", "03:15:00"] },
} as const;

/** Brake-pipe pressure (kg/cm²): holds 5.0 until the RS valve trips at 03:14:24. */
const BP: Array<[string, number]> = [
  ["03:10:00", 5],
  ["03:14:24", 5],
  ["03:14:26", 2.1],
  ["03:14:29", 0.3],
  ["03:14:31", 0],
  ["03:15:00", 0],
];

const LABEL_W = 104; // px gutter for lane labels

export function TimelinePanel({ events, mask, lang }: { events: TimelineEvent[]; mask: (t: string) => string; lang: "en" | "hi" }) {
  const [win, setWin] = useState<keyof typeof WINDOWS>("critical");
  const [view, setView] = useState<"chart" | "table">("chart");
  const [sel, setSel] = useState(3);
  const w = WINDOWS[win];
  const t0 = toSeconds(w.from);
  const t1 = toSeconds(w.to);
  const x = (t: string) => (toSeconds(t) - t0) / (t1 - t0);
  const inWin = (t: string) => toSeconds(t) >= t0 && toSeconds(t) <= t1;
  const selected = events[sel];
  const cursor = selected && inWin(selected.time_str) ? x(selected.time_str) : null;

  const bpPath = BP.map(([t, v], i) => `${i ? "L" : "M"}${Math.max(0, Math.min(1, x(t))) * 1000},${8 + (1 - v / 5) * 84}`).join(" ");

  const Seg = <K extends string>({ value, options, onChange, label }: { value: K; options: Array<[K, string]>; onChange: (k: K) => void; label: string }) => (
    <div role="radiogroup" aria-label={label} className="flex rounded-btn border border-[var(--line)] bg-paper p-0.5">
      {options.map(([k, l]) => (
        <button
          key={k}
          type="button"
          role="radio"
          aria-checked={value === k}
          onClick={() => onChange(k)}
          className={`rounded-[4px] px-3 py-1.5 text-xs font-semibold transition ${value === k ? "bg-white text-ink-950 shadow-card" : "text-ink-500 hover:text-ink-900"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mono-label text-ink-500">Train 12414 · 18 Nov 2026</p>
          <h3 className="mt-1 text-lg font-semibold text-ink-950">Multimodal incident timeline</h3>
        </div>
        <div className="flex gap-2">
          <Seg label="Time window" value={win} onChange={setWin} options={[["critical", WINDOWS.critical.label], ["full", WINDOWS.full.label]]} />
          <Seg label="View" value={view} onChange={setView} options={[["chart", "Chart"], ["table", "Table"]]} />
        </div>
      </div>

      {view === "chart" ? (
        <div className="mt-6 overflow-x-auto">
          <div className="relative min-w-[640px]">
            {/* Lanes */}
            {LANES.map((lane) => (
              <div key={lane.id} className="flex h-14 items-center border-b border-dashed border-ink-100">
                <span className="flex shrink-0 items-center gap-2 text-[13px] font-semibold text-ink-700" style={{ width: LABEL_W }}>
                  <lane.icon className="h-4 w-4 text-ink-500" aria-hidden /> {lane.label}
                </span>
                <div className="relative h-full flex-1">
                  {events.map((e, i) =>
                    e.source !== lane.id || !inWin(e.time_str) ? null : (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSel(i)}
                        aria-pressed={sel === i}
                        aria-label={`${e.time_str} · ${lane.label} · ${e.severity === "CRITICAL" ? "critical" : "info"}`}
                        className="group absolute top-1/2 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center"
                        style={{ left: `${x(e.time_str) * 100}%` }}
                      >
                        <span
                          className={`grid place-items-center rounded-full border-2 border-white shadow-card transition-all ${
                            e.severity === "CRITICAL" ? "bg-danger" : "bg-cyan"
                          } ${sel === i ? "h-6 w-6 ring-4 ring-orange/30" : "h-4 w-4 group-hover:h-5 group-hover:w-5"}`}
                        >
                          {e.severity === "CRITICAL" && sel === i && <AlertTriangle className="h-3 w-3 text-white" aria-hidden />}
                        </span>
                        <span className="pointer-events-none absolute bottom-full mb-1 whitespace-nowrap rounded bg-ink-950 px-1.5 py-0.5 font-mono text-[10px] text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                          {e.time_str}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>
            ))}

            {/* Brake-pipe pressure, same x-scale */}
            <div className="flex pt-3">
              <span className="shrink-0 pt-1 text-[13px] font-semibold text-ink-700" style={{ width: LABEL_W }}>
                BP <span className="font-mono text-[11px] font-normal text-ink-500">kg/cm²</span>
              </span>
              <div className="relative h-24 flex-1">
                <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
                  <line x1="0" x2="1000" y1="8" y2="8" stroke="#dde2ea" strokeDasharray="2 4" vectorEffect="non-scaling-stroke" />
                  <line x1="0" x2="1000" y1="92" y2="92" stroke="#dde2ea" vectorEffect="non-scaling-stroke" />
                  <path d={`${bpPath} L1000,100 L0,100Z`} fill="rgba(245,158,11,.10)" />
                  <path d={bpPath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                </svg>
                <span className="absolute -top-1 right-0 font-mono text-[10px] text-ink-500">5.0</span>
                <span className="absolute bottom-1 right-0 font-mono text-[10px] text-ink-500">0.0</span>
              </div>
            </div>

            {/* Axis */}
            <div className="relative mt-2 h-5" style={{ marginLeft: LABEL_W }}>
              {w.ticks.map((t, i) => (
                <span
                  key={t}
                  className={`absolute font-mono text-[11px] text-ink-500 ${i === 0 ? "" : i === w.ticks.length - 1 ? "-translate-x-full" : "-translate-x-1/2"}`}
                  style={{ left: `${x(t.length === 5 ? `${t}:00` : t) * 100}%` }}
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Cursor */}
            {cursor !== null && (
              <div className="pointer-events-none absolute bottom-7 top-0" style={{ left: `calc(${LABEL_W}px + (100% - ${LABEL_W}px) * ${cursor})` }} aria-hidden>
                <div className="h-full w-px bg-orange/70" />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="mono-label border-b border-[var(--line)] text-ink-500">
              <tr>
                <th className="py-2 pr-4 font-semibold">Time</th>
                <th className="py-2 pr-4 font-semibold">Source</th>
                <th className="py-2 pr-4 font-semibold">Speaker</th>
                <th className="py-2 font-semibold">Event</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {events.map((e, i) => (
                <tr key={i} className={e.severity === "CRITICAL" ? "bg-danger-soft/50" : ""}>
                  <td className="py-2.5 pr-4 font-mono text-ink-950">{e.time_str}</td>
                  <td className="py-2.5 pr-4 text-ink-700">{LANES.find((l) => l.id === e.source)?.label}</td>
                  <td className="py-2.5 pr-4 text-ink-700">{mask(e.speaker)}</td>
                  <td className={`py-2.5 text-ink-900 ${lang === "hi" ? "hi" : ""}`}>{mask(lang === "hi" ? e.event_hi || e.event : e.event)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected event */}
      {selected && view === "chart" && (
        <div key={sel} className={`mt-5 flex animate-fade-up flex-wrap items-start gap-4 rounded-card border p-4 ${selected.severity === "CRITICAL" ? "border-danger/25 bg-danger-soft/60" : "border-[var(--line)] bg-paper/60"}`}>
          <div className="font-mono text-2xl font-semibold text-ink-950">{selected.time_str}</div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {selected.severity === "CRITICAL" && (
                <span className="chip border-danger/30 bg-white text-danger-ink">
                  <AlertTriangle className="h-3 w-3" aria-hidden /> Critical
                </span>
              )}
              <span className="text-sm font-semibold text-ink-900">{mask(selected.speaker)}</span>
              {selected.reviewer_status && <span className="chip border-ok/30 bg-ok-soft text-ok-ink">Reviewer · {selected.reviewer_status}</span>}
            </div>
            <p className={`mt-1.5 text-[15px] text-ink-900 ${lang === "hi" ? "hi" : ""}`}>{mask(lang === "hi" ? selected.event_hi || selected.event : selected.event)}</p>
          </div>
          {selected.clarity && (
            <div className="w-28">
              <div className="flex justify-between font-mono text-[11px] text-ink-500">
                <span>conf</span>
                <span className="text-ink-950">{Math.round(selected.clarity * 100)}%</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-ink-900" style={{ width: `${selected.clarity * 100}%` }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
