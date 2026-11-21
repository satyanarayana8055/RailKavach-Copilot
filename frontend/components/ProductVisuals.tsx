"use client";

import { useCountUp } from "./hooks";
import { dly, rv } from "./reveal";

/**
 * Each visual plays a short story when `active` flips true (its row scrolls into view):
 * the root gets data-on, and the keyframe classes in globals.css (.reveal/.draw/.sweep…) run.
 */

function LiveHeader({ left, right }: { left: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
      <span className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
        <span className="h-1.5 w-1.5 animate-blink rounded-full bg-danger" aria-hidden />
        {left}
      </span>
      <span className="font-mono text-[11px] text-ink-300">{right}</span>
    </div>
  );
}


/* ---------- 03 · WDD: rake passes six gantry streams ---------- */

const STREAMS = [
  { id: "ENTRY · L", det: { label: "DENT 0.94", x: 30, y: 38, w: 26, h: 26, tone: "amber" } },
  { id: "ENTRY · TOP" },
  { id: "ENTRY · R", det: { label: "CLOSED DOOR 0.97", x: 44, y: 30, w: 34, h: 40, tone: "ok" } },
  { id: "EXIT · L" },
  { id: "EXIT · TOP", det: { label: "BULGE 0.81", x: 20, y: 34, w: 30, h: 30, tone: "danger" } },
  { id: "EXIT · R" },
] as const;

const DET_TONE = { amber: "#f59e0b", ok: "#10b981", danger: "#e5484d" } as const;

export function WddVisual({ active }: { active: boolean }) {
  const scanned = Math.round(useCountUp(58, active, 3200));
  return (
    <div data-on={active} className="panel-dark overflow-hidden" role="img" aria-label="Six live gantry camera streams scan a 58-wagon rake; AI flags a dent, a closed door and a bulge">
      <LiveHeader
        left="Live · 6 streams"
        right={
          <span>
            WAGON <span className="text-amber tabular-nums">{String(scanned).padStart(2, "0")}</span>/58
          </span>
        }
      />
      <div className="grid grid-cols-3 gap-2 p-3">
        {STREAMS.map((s, i) => (
          <div key={s.id} className="lit relative aspect-[4/3] overflow-hidden rounded-btn border border-white/[0.06] bg-[#070a14]" style={dly(i * 0.18)}>
            <svg viewBox="0 0 100 75" className="absolute inset-0 h-full w-full" aria-hidden>
              {/* wagon slides through the frame */}
              <g className="reveal" style={rv(i * 0.18, { rx: -110, ry: 0 })}>
                <rect x="6" y="18" width="88" height="40" rx="2" fill="#141a26" stroke="#2a3242" />
                {[22, 38, 54, 70].map((x) => (
                  <line key={x} x1={x} x2={x} y1="18" y2="58" stroke="#1f2632" />
                ))}
                <circle cx="22" cy="63" r="5" fill="#0a0d12" stroke="#3a4456" />
                <circle cx="78" cy="63" r="5" fill="#0a0d12" stroke="#3a4456" />
              </g>
              {"det" in s && s.det && (
                <g className="reveal svg-origin" style={rv(1.2 + i * 0.25, { ry: 0, rs: 1.5 })}>
                  <rect x={s.det.x} y={s.det.y} width={s.det.w} height={s.det.h} fill="none" stroke={DET_TONE[s.det.tone]} strokeWidth="1.2" />
                  <rect x={s.det.x} y={s.det.y - 7} width={s.det.label.length * 3.1 + 4} height="7" fill={DET_TONE[s.det.tone]} />
                  <text x={s.det.x + 2} y={s.det.y - 1.8} fontSize="5" fontFamily="var(--font-mono)" fontWeight="700" fill="#0a0d12">
                    {s.det.label}
                  </text>
                </g>
              )}
            </svg>
            {active && <div className="scanline" style={{ animationDelay: `${i * 0.35}s` }} />}
            <span className="absolute bottom-1 left-1.5 font-mono text-[9px] font-semibold tracking-wider text-ink-200">{s.id}</span>
          </div>
        ))}
      </div>
      {/* rake progress */}
      <div className="flex gap-[2px] px-3 pb-3" aria-hidden>
        {Array.from({ length: 58 }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-[1px] transition-colors duration-200 ${
              i < scanned ? (i === 13 || i === 27 ? "bg-danger" : i === 14 ? "bg-amber" : "bg-cyan/60") : "bg-white/[0.06]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- 02 · Locate: detections draw in, phone triggers the alert ---------- */

/* 01 · Railcomm and 02 · Locate stories live in StoryVisuals (product order: Railcomm, Locate, WDD). */
export { LocateVisual, RailcommVisual } from "./StoryVisuals";
