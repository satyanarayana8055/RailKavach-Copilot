"use client";

import { ArrowDown, ShieldCheck } from "lucide-react";
import { useCountUp } from "./hooks";
import { dly, rv } from "./reveal";
import { Waveform } from "./Waveform";

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

function DrawBox({ x, y, w, h, color, label, labelW, labelX = x, delay, strong }: {
  x: number; y: number; w: number; h: number; color: string; label: string; labelW: number; labelX?: number; delay: number; strong?: boolean;
}) {
  const dark = color !== "#e5484d";
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={color} strokeWidth={strong ? 2 : 1.5} pathLength={1} className="draw" style={dly(delay)} />
      <g className="reveal" style={rv(delay + 0.6, { ry: 4 })}>
        <rect x={labelX} y={y - 10} width={labelW} height="11" fill={color} />
        <text x={labelX + 4} y={y - 2} fontSize="8" fontFamily="var(--font-mono)" fontWeight="700" fill={dark ? "#03061a" : "#fff"}>
          {label}
        </text>
      </g>
    </g>
  );
}

export function LocateVisual({ active }: { active: boolean }) {
  return (
    <div
      data-on={active}
      className="panel-dark alert-frame overflow-hidden"
      style={dly(1.9)}
      role="img"
      aria-label="Locomotive cabin stream: loco pilot detected, walkie-talkie allowed, mobile phone flagged as a high-severity violation"
    >
      <LiveHeader left="Live · cabin stream" right="YOLOv8 · edge inference" />
      <div className="relative aspect-[16/10] overflow-hidden bg-[#070a14]">
        <svg viewBox="0 0 320 200" className="absolute inset-0 h-full w-full" aria-hidden>
          <path d="M40 18 H280 L262 92 H58Z" fill="#0d1220" stroke="#2a3242" />
          <path d="M150 92 L158 40 M170 92 L162 40" stroke="#f59e0b" strokeOpacity=".35" />
          <circle cx="160" cy="40" r="2" fill="#e5484d" className="animate-blink" />
          <path d="M0 200 L20 128 H300 L320 200Z" fill="#111725" stroke="#1f2632" />
          <circle cx="112" cy="112" r="17" fill="#2a3242" />
          <path d="M78 176 C80 146 96 134 112 134 C128 134 144 146 146 176Z" fill="#2a3242" />

          <DrawBox x={70} y={88} w={84} h={94} color="#009fce" label="LOCOPILOT 0.98" labelW={74} delay={0.2} />
          <DrawBox x={228} y={136} w={30} h={30} color="#10b981" label="WALKIE 0.91" labelW={62} labelX={212} delay={0.8} />
          <DrawBox x={132} y={104} w={22} h={26} color="#e5484d" label="PHONE 0.94 · ALERT" labelW={92} delay={1.4} strong />
        </svg>
        {/* alert flash */}
        <div className="flash pointer-events-none absolute inset-0 bg-danger/20" style={dly(1.9)} aria-hidden />
        <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded bg-black/50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">
          <span className="h-1.5 w-1.5 animate-blink rounded-full bg-danger" /> REC
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] px-4 py-3 font-mono text-[11px]">
        <span className="typewriter inline-block overflow-hidden whitespace-nowrap align-bottom text-ink-200" style={dly(2.2)}>
          <span className="text-ink-400">[T+04:23:11Z]</span> VIOLATION = <span className="text-[#ff8a8d]">MOBILE_USE</span> · HIGH
        </span>
        <span className="reveal rounded bg-ok/15 px-1.5 py-0.5 font-semibold text-ok" style={rv(3.4, { ry: 4 })}>
          CLIP SAVED
        </span>
      </div>
    </div>
  );
}

/* ---------- 01 · Railcomm: noise in → clean voice sweeps out ---------- */

export function RailcommVisual({ active }: { active: boolean }) {
  const snr = -12 + useCountUp(30, active, 2200);
  return (
    <div data-on={active} className="panel-dark overflow-hidden" role="img" aria-label="Noisy cab radio at minus 12 decibel SNR denoised to clean voice at plus 18 decibel SNR, safety keywords STOP and BLOCK preserved">
      <LiveHeader left="Live · channel denoise" right="Streaming inference" />
      <div className="space-y-3 p-4">
        <div className="rounded-card border border-white/[0.06] bg-white/[0.02] p-3">
          <div className="flex justify-between font-mono text-[11px]">
            <span className="text-ink-300">INPUT · NOISY</span>
            <span className="text-[#ff8a8d]">−12 dB SNR</span>
          </div>
          <Waveform bars={48} tone="muted" noise={0.95} seed={3} className="mt-2 h-12" />
        </div>

        <div className="flex items-center justify-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-amber">
          <ArrowDown className={`h-3.5 w-3.5 ${active ? "animate-bounce" : ""}`} aria-hidden /> AI denoise + voice preserve
        </div>

        <div className="lit rounded-card border border-white/[0.06] p-3" style={dly(0.2)}>
          <div className="flex justify-between font-mono text-[11px]">
            <span className="text-cyan">OUTPUT · CLEAN</span>
            <span className={`tabular-nums ${snr > 0 ? "text-ok" : "text-[#ff8a8d]"}`}>
              {snr > 0 ? "+" : snr < 0 ? "−" : ""}
              {Math.abs(Math.round(snr))} dB SNR
            </span>
          </div>
          <div className="relative mt-2">
            <div className="sweep" style={dly(0.3)}>
              <Waveform bars={48} tone="cyan" noise={0.15} seed={11} className="h-12" />
            </div>
            {[
              { t: "STOP", left: "22%", d: 1.0 },
              { t: "BLOCK", left: "64%", d: 1.6 },
            ].map((k) => (
              <span key={k.t} className="absolute top-1/2 -translate-y-1/2" style={{ left: k.left }}>
                <span
                  className="reveal block rounded bg-amber px-1.5 font-mono text-[10px] font-bold text-ink-950 shadow-[0_0_16px_rgba(245,158,11,.6)]"
                  style={rv(k.d, { ry: 0, rs: 0.4 })}
                >
                  {k.t}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {["AI denoising", "Real-time streaming"].map((t) => (
            <span key={t} className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] text-ink-200">
              {t}
            </span>
          ))}
          <span className="flex items-center gap-1 rounded-full border border-ok/30 bg-ok/10 px-2.5 py-1 font-mono text-[10px] font-semibold text-ok">
            <ShieldCheck className="h-3 w-3" aria-hidden /> Fail-open · safe by default
          </span>
        </div>
      </div>
    </div>
  );
}
