"use client";

import { AlertOctagon, AlertTriangle, ArrowRight, CheckCircle2, History, Play, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { RAKE } from "@/lib/data";
import type { WagonStatus } from "@/lib/types";
import { VideoModal } from "../VideoModal";
import { PRODUCTS } from "../ProductSuite";

/* Status palette (reserved): neutral → warning → serious → critical. Always shipped with icon + label. */
const STATUS: Record<WagonStatus, { label: string; cell: string; chip: string; icon: typeof CheckCircle2 }> = {
  CLEAR: { label: "Clear", cell: "bg-ink-100 hover:bg-ink-200", chip: "border-[var(--line)] bg-paper text-ink-700", icon: CheckCircle2 },
  PRE_EXISTING: { label: "Pre-existing", cell: "bg-amber", chip: "border-amber/40 bg-amber-soft text-amber-ink", icon: History },
  NEW_DAMAGE: { label: "New transit damage", cell: "bg-orange", chip: "border-orange/40 bg-orange-soft text-orange-ink", icon: AlertTriangle },
  CRITICAL: { label: "Critical new defect", cell: "bg-danger", chip: "border-danger/40 bg-danger-soft text-danger-ink", icon: AlertOctagon },
};

export function WddPanel({ canIssue, onIssue }: { canIssue: boolean; onIssue: (serial: string) => void }) {
  const [sel, setSel] = useState(14);
  const [videoOpen, setVideoOpen] = useState(false);
  const wagon = RAKE[sel - 1];
  const s = STATUS[wagon.status];
  const counts = useMemo(
    () => RAKE.reduce((acc, w) => ({ ...acc, [w.status]: (acc[w.status] || 0) + 1 }), {} as Record<WagonStatus, number>),
    []
  );

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
        <div>
          <p className="mono-label text-ink-500">Rake BOXN-542 · 58 wagons</p>
          <h3 className="mt-1 text-lg font-semibold text-ink-950">Entry vs exit gantry differential</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3 font-mono text-[12px] text-ink-700">
          <button
            type="button"
            onClick={() => setVideoOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-orange/40 bg-orange/10 px-3 py-1.5 font-mono text-[11px] font-semibold text-orange-ink transition hover:bg-orange/20"
          >
            <Play className="h-3 w-3 fill-orange" /> Watch 6-Gantry Video (0:58)
          </button>
          <span className="rounded-btn bg-paper px-2.5 py-1.5">Suratgarh · 10:15</span>
          <span className="relative h-px w-16 bg-ink-200 sm:w-24">
            <span className="absolute -top-1 left-0 h-2 w-2 animate-[approach_3s_ease-in-out_infinite] rounded-full bg-orange [--stop:56px] sm:[--stop:88px]" aria-hidden />
          </span>
          <span className="rounded-btn bg-paper px-2.5 py-1.5">Lalgarh · 16:45</span>
        </div>
      </div>

      {/* Legend with counts */}
      <ul className="flex flex-wrap gap-2 px-5 sm:px-6" aria-label="Legend">
        {(Object.keys(STATUS) as WagonStatus[]).map((k) => {
          const L = STATUS[k];
          return (
            <li key={k} className={`chip ${L.chip}`}>
              <L.icon className="h-3 w-3" aria-hidden /> {L.label} <span className="font-mono">{counts[k] || 0}</span>
            </li>
          );
        })}
      </ul>

      {/* The rake */}
      <div className="no-scrollbar mt-5 overflow-x-auto px-5 pb-2 sm:px-6">
        <div role="listbox" aria-label="Wagons in rake" className="grid min-w-[720px] grid-cols-[repeat(29,minmax(0,1fr))] gap-1.5">
          {RAKE.map((w) => {
            const on = w.pos === sel;
            return (
              <button
                key={w.pos}
                type="button"
                role="option"
                aria-selected={on}
                aria-label={`Wagon ${w.pos}, ${STATUS[w.status].label}`}
                onClick={() => setSel(w.pos)}
                className={`group relative h-9 rounded-[4px] transition ${STATUS[w.status].cell} ${on ? "ring-2 ring-ink-950 ring-offset-2" : ""}`}
              >
                <span className={`absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-mono text-[9px] font-semibold ${w.status === "CLEAR" ? "text-ink-500" : "text-white"} ${on || w.status !== "CLEAR" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                  {w.pos}
                </span>
                {w.status === "CRITICAL" && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-ping2 rounded-full bg-danger" aria-hidden />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected wagon */}
      <div key={sel} className="m-5 mt-4 animate-fade-up rounded-card border border-[var(--line)] bg-paper/60 p-4 sm:m-6 sm:mt-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-3xl font-semibold text-ink-950">#{String(wagon.pos).padStart(2, "0")}</span>
            <div>
              <p className="font-mono text-sm font-semibold text-ink-900">{wagon.serial}</p>
              <span className={`chip mt-1 ${s.chip}`}>
                <s.icon className="h-3 w-3" aria-hidden /> {s.label}
              </span>
            </div>
          </div>
          {canIssue && wagon.status !== "CLEAR" && wagon.status !== "PRE_EXISTING" && (
            <button type="button" onClick={() => onIssue(wagon.serial)} className="btn-orange">
              <Wrench className="h-4 w-4" aria-hidden /> Issue sick-line order
            </button>
          )}
        </div>

        <div className="mt-4 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-btn border border-[var(--line)] bg-white p-3">
            <p className="mono-label text-ink-500">Entry · Suratgarh</p>
            <p className="mt-1 text-sm font-semibold text-ink-900">{wagon.entry}</p>
          </div>
          <ArrowRight className="mx-auto hidden h-4 w-4 text-ink-400 sm:block" aria-hidden />
          <div className={`rounded-btn border p-3 ${wagon.status === "CLEAR" || wagon.status === "PRE_EXISTING" ? "border-[var(--line)] bg-white" : "border-danger/30 bg-white"}`}>
            <p className="mono-label text-ink-500">Exit · Lalgarh</p>
            <p className={`mt-1 text-sm font-semibold ${wagon.status === "NEW_DAMAGE" || wagon.status === "CRITICAL" ? "text-danger-ink" : "text-ink-900"}`}>{wagon.exit}</p>
          </div>
        </div>
        <p className="mt-3 text-[13px] text-ink-500">{wagon.note}</p>

        {wagon.image_url && (
          <div className="mt-4 overflow-hidden rounded-card border border-[var(--line)] bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
              <span className="mono-label text-ink-500">6-Gantry Optical & Laser Scan Frame · Section 63 BSA 2023 Evidence</span>
              {wagon.defect_tag && (
                <span className={`chip text-[10px] font-bold ${
                  wagon.status === "CRITICAL"
                    ? "border-danger/40 bg-danger-soft text-danger-ink"
                    : wagon.status === "NEW_DAMAGE"
                    ? "border-orange/40 bg-orange-soft text-orange-ink"
                    : wagon.status === "PRE_EXISTING"
                    ? "border-amber/40 bg-amber-soft text-amber-ink"
                    : "border-ok/30 bg-ok-soft text-ok-ink"
                }`}>
                  {wagon.defect_tag}
                </span>
              )}
            </div>
            <div className="relative mt-1 max-h-56 overflow-hidden rounded-btn bg-black/5 border border-[var(--line)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={wagon.image_url}
                alt={`Wagon scan for ${wagon.serial}`}
                className="h-48 w-full object-cover transition hover:scale-105"
              />
              <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded bg-black/75 px-2 py-1 text-[11px] font-mono text-white shadow-xs">
                <span>GANTRY: CAM-03 PORT</span>
                <span className="text-amber">OCR: {wagon.serial}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <VideoModal
        isOpen={videoOpen}
        onClose={() => setVideoOpen(false)}
        product={PRODUCTS[2]}
      />
    </div>
  );
}
