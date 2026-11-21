"use client";

import { AlertTriangle, BadgeCheck, CheckCircle2, EyeOff, Radio, ShieldCheck, UserCheck, Video } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "./hooks";

/**
 * Landing-page product stories. Each plays a short, looping sequence while its row is on screen
 * (`active`) and shows the end state, without motion, under prefers-reduced-motion.
 * No timestamps here by design: the public page shows *what* the product does, not incident times.
 */

/** Steps 0…n, one every `stepMs`; holds the last step for `holdMs`, then replays. */
function useStory(active: boolean, n: number, stepMs: number, holdMs: number, firstMs = 600): number {
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (reduced) return setStep(n);
    if (!active) return setStep(0);
    const t = setTimeout(() => setStep((s) => (s >= n ? 0 : s + 1)), step >= n ? holdMs : step === 0 ? firstMs : stepMs);
    return () => clearTimeout(t);
  }, [active, reduced, step, n, stepMs, holdMs, firstMs]);
  return step;
}

const on = (cond: boolean, yes: string, no = "opacity-0 translate-y-1") => `transition-all duration-500 ease-brand ${cond ? yes : no}`;

function Shell({ title, badge, children }: { title: ReactNode; badge?: ReactNode; children: ReactNode }) {
  return (
    <figure className="panel-dark relative overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
        <span className="flex items-center gap-2 text-[13px] font-semibold text-white">{title}</span>
        {badge}
      </div>
      {children}
    </figure>
  );
}

/* =====================================================================================
 * 01 · Railcomm — raw cab audio is cleaned, transcribed, every line classed, rules checked
 * Figures: mean SNR over 1,053 Railcomm segments in data/railcomm_transcripts.json.
 * ===================================================================================== */

const BARS = 56;
// Deterministic "speech" envelope + speaker segments (LP / ALP / flagged / unclear).
const ENVELOPE = Array.from({ length: BARS }, (_, i) => 0.28 + 0.62 * Math.abs(Math.sin(i * 0.55) * Math.cos(i * 0.17 + 1)));
const SEGMENT = (i: number): "alp" | "lp" | "flag" | "gap" | "noise" =>
  i < 3 ? "gap" : i < 15 ? "alp" : i < 18 ? "gap" : i < 29 ? "lp" : i < 31 ? "gap" : i < 43 ? "flag" : i < 46 ? "gap" : i < 53 ? "noise" : "gap";
const SEG_CLASS = { alp: "bg-amber", lp: "bg-cyan", flag: "bg-danger", gap: "bg-white/15", noise: "bg-ink-500" } as const;

const LINES = [
  { at: 2, who: "ALP", text: "Distant signal is yellow, reduce speed sir.", cls: "Operational", tone: "border-cyan/30 bg-cyan/10 text-cyan" },
  { at: 3, who: "LP", text: "Caution order T/409 received, 45 km/h at KM 140.", cls: "Operational", tone: "border-cyan/30 bg-cyan/10 text-cyan" },
  {
    at: 4, who: "ALP", text: "Sir, put down the phone! Home signal ahead is red.", hi: "सर ध्यान दीजिए! फोन रखिए, सामने होम सिग्नल लाल है!",
    cls: "Red flag", tone: "border-danger/40 bg-danger/15 text-[#ff8a8d]",
  },
  { at: 5, who: "LP", text: "…kzzt… cannot… [radio noise]", cls: "Not assessable", tone: "border-white/15 bg-white/5 text-ink-300" },
] as const;

const CHECKS = [
  { at: 6, ok: true, text: "Signal call-outs" },
  { at: 6, ok: true, text: "Caution order repeated" },
  { at: 7, ok: false, text: "Phone use while running" },
] as const;

export function RailcommVisual({ active }: { active: boolean }) {
  const step = useStory(active, 7, 1100, 4200, 1800);
  const cleaned = step >= 1;
  const playhead = step <= 1 ? 0 : Math.min(1, (step - 1) / 4); // sweeps across the clean waveform as lines land

  return (
    <Shell
      title={
        <>
          <Radio className="h-4 w-4 text-cyan" aria-hidden /> Journey review
        </>
      }
      badge={<span className={on(step >= 4, "opacity-100", "opacity-0")}><span className="chip border-amber/40 bg-amber/15 text-amber">Needs attention</span></span>}
    >
      <figcaption className="sr-only">
        Railcomm cleans noisy cab audio (signal-to-noise 16 dB to 31 dB), transcribes each line in Hindi or English, classes it, and checks the journey
        against call-out rules. A phone warning from the assistant loco pilot is flagged.
      </figcaption>

      <div className="space-y-3 px-4 pb-4 pt-4">
        {/* Raw → clean */}
        <div className="relative">
          <div className="mb-1.5 flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.12em]">
            <span className="text-ink-300">{cleaned ? "Denoised" : "Raw cab audio"}</span>
            <span className="flex items-center gap-2 text-ink-300">
              SNR <span className={cleaned ? "text-ink-400 line-through" : "text-white"}>16.0 dB</span>
              <span className={on(cleaned, "text-ok", "w-0 opacity-0")}>→ 30.6 dB</span>
              <span className={on(cleaned, "rounded bg-ok/15 px-1.5 text-ok", "opacity-0")}>+14.6</span>
            </span>
          </div>
          <div className="relative flex h-14 items-center gap-[2px]" aria-hidden>
            {ENVELOPE.map((e, i) => {
              const seg = SEGMENT(i);
              const noisyH = 0.35 + 0.6 * Math.abs(Math.sin(i * 2.3)); // broadband noise: everything loud
              const h = cleaned ? (seg === "gap" ? 0.08 : seg === "noise" ? 0.22 : e) : noisyH;
              return (
                <span
                  key={i}
                  className={`w-full min-w-0 rounded-full transition-all duration-700 ease-brand ${cleaned ? SEG_CLASS[seg] : "bg-ink-500/70"} ${
                    active && !cleaned ? "animate-eq" : ""
                  }`}
                  style={{ height: `${Math.round(h * 100)}%`, transitionDelay: `${(i / BARS) * 600}ms`, animationDelay: `${(i % 7) * 90}ms` }}
                />
              );
            })}
            {/* playhead */}
            <span
              className={`pointer-events-none absolute -bottom-1 -top-1 w-[2px] rounded bg-white shadow-[0_0_10px_rgba(255,255,255,.7)] transition-[left,opacity] duration-1000 ease-linear ${
                cleaned ? "opacity-100" : "opacity-0"
              }`}
              style={{ left: `${playhead * 100}%` }}
            />
          </div>
          <div className={`mt-1.5 flex gap-3 font-mono text-[10px] ${on(cleaned, "opacity-100", "opacity-0")}`} aria-hidden>
            <span className="flex items-center gap-1 text-ink-300"><i className="h-1.5 w-3 rounded-full bg-amber" /> ALP</span>
            <span className="flex items-center gap-1 text-ink-300"><i className="h-1.5 w-3 rounded-full bg-cyan" /> LP</span>
            <span className="flex items-center gap-1 text-ink-300"><i className="h-1.5 w-3 rounded-full bg-danger" /> flagged</span>
            <span className="flex items-center gap-1 text-ink-300"><i className="h-1.5 w-3 rounded-full bg-ink-500" /> unclear</span>
          </div>
        </div>

        {/* Transcript, line by line, each classed */}
        <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-card border border-white/[0.07] bg-white/[0.02]">
          {LINES.map((l) => (
            <li key={l.text} className={`flex items-start gap-3 px-3 py-2 ${on(step >= l.at, "opacity-100 translate-y-0")}`}>
              <span className={`mt-0.5 w-8 shrink-0 font-mono text-[11px] font-bold ${l.who === "LP" ? "text-cyan" : "text-amber"}`}>{l.who}</span>
              <span className="min-w-0 flex-1 text-[13px] leading-snug text-ink-100">
                {l.text}
                {"hi" in l && <span className="hi mt-0.5 block text-[12px] text-ink-300">{l.hi}</span>}
              </span>
              <span className={`chip shrink-0 ${l.tone}`}>{l.cls}</span>
            </li>
          ))}
        </ul>

        {/* Rule checks */}
        <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-3">
          {CHECKS.map((c) => (
            <span key={c.text} className={`flex items-center gap-1.5 text-[12px] font-medium ${on(step >= c.at, "opacity-100", "opacity-0")} ${c.ok ? "text-ink-100" : "text-amber"}`}>
              {c.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-ok" aria-hidden /> : <AlertTriangle className="h-3.5 w-3.5 text-amber" aria-hidden />}
              {c.text}
            </span>
          ))}
        </div>
      </div>

      {/* floating flag */}
      <span
        className={`absolute right-4 top-[118px] flex items-center gap-2 rounded-full border border-white/10 bg-ink-950/90 px-3 py-1.5 text-[12px] font-semibold text-white shadow-lift backdrop-blur ${on(
          step >= 4 && step < 7,
          "opacity-100 translate-y-0 animate-float",
          "opacity-0 -translate-y-1"
        )}`}
        aria-hidden
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-danger/25 text-[#ff8a8d]">
          <AlertTriangle className="h-3 w-3" />
        </span>
        Phone warning flagged
      </span>
    </Shell>
  );
}

/* =====================================================================================
 * 02 · Locate — live cabs → detection → compliant activity cleared → violation reviewed by a person
 * ===================================================================================== */

// Mini live-cab network (after nwrlcva.aispry.ai): nodes, edges, pulses.
const NODES = (
  [[18, 30], [62, 14], [104, 34], [150, 18], [196, 40], [242, 20], [286, 36], [44, 62], [92, 70], [138, 58], [184, 74], [232, 62], [276, 72]] as const
).map(([x, y]) => [Math.round(x * 1.78), y] as const);
const EDGES = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [0, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [2, 9], [1, 8], [4, 10], [5, 11], [3, 9], [6, 12]] as const;
const LIVE = 9; // the cab we follow

function CabNetwork({ step, motion }: { step: number; motion: boolean }) {
  return (
    <svg viewBox="0 0 530 88" className="h-[76px] w-full" aria-hidden>
      {EDGES.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} stroke="#f59e0b" strokeOpacity=".22" strokeWidth=".8" />
      ))}
      {motion && EDGES.slice(0, 8).map(([a, b], i) => (
        <circle key={`p${i}`} r="1.4" fill="#fbbf24">
          <animateMotion dur={`${2.4 + (i % 3) * 0.7}s`} repeatCount="indefinite" path={`M${NODES[a][0]},${NODES[a][1]} L${NODES[b][0]},${NODES[b][1]}`} />
        </circle>
      ))}
      {NODES.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={i === LIVE ? 4 : 2.2} fill={i === LIVE ? (step >= 3 ? "#e5484d" : "#22d3ee") : "#fcd34d"} opacity={i === LIVE ? 1 : 0.85} />
          {i === LIVE && <circle cx={x} cy={y} r="4" fill="none" stroke={step >= 3 ? "#e5484d" : "#22d3ee"} className="animate-ping2 origin-center" style={{ transformBox: "fill-box" }} />}
        </g>
      ))}
      <g transform={`translate(${NODES[LIVE][0] + 7} ${NODES[LIVE][1] - 14})`}>
        <rect width="74" height="12" rx="3" fill="#0a0d12" stroke={step >= 3 ? "#e5484d" : "#22d3ee"} strokeOpacity=".6" />
        <text x="5" y="8.5" fontSize="6.5" fontFamily="var(--font-mono)" fontWeight="700" fill="#fff">
          CAB 30347 · LIVE
        </text>
      </g>
    </svg>
  );
}

function Box({ show, x, y, w, h, color, label, struck }: { show: boolean; x: number; y: number; w: number; h: number; color: string; label: string; struck?: boolean }) {
  return (
    <g className={`transition-opacity duration-500 ${show ? "opacity-100" : "opacity-0"}`}>
      <rect x={x} y={y} width={w} height={h} rx="2" fill="none" stroke={color} strokeWidth="1.6" />
      <rect x={x} y={y - 11} width={label.length * 4.6 + 8} height="11" rx="1.5" fill={color} />
      <text x={x + 4} y={y - 3} fontSize="7.5" fontFamily="var(--font-mono)" fontWeight="700" fill="#0a0d12" textDecoration={struck ? "line-through" : undefined}>
        {label}
      </text>
    </g>
  );
}

const PIPE = [
  { at: 1, label: "Detect" },
  { at: 2, label: "Classify" },
  { at: 4, label: "Human review" },
  { at: 6, label: "Verified report" },
] as const;

export function LocateVisual({ active }: { active: boolean }) {
  const step = useStory(active, 6, 1300, 4500);
  const reduced = usePrefersReducedMotion();

  return (
    <Shell
      title={
        <>
          <Video className="h-4 w-4 text-orange" aria-hidden /> Cabin review
        </>
      }
      badge={
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-ink-300">
          <span className="h-1.5 w-1.5 animate-blink rounded-full bg-danger" aria-hidden /> 6 cabs live
        </span>
      }
    >
      <figcaption className="sr-only">
        Locate watches live locomotive cabs. In one cab it detects a walkie-talkie and clears it as compliant, detects a mobile phone and flags it,
        then a reviewer confirms the violation. The crew member&apos;s identity stays masked.
      </figcaption>

      <div className="border-b border-white/[0.06] px-3 pt-1">
        <CabNetwork step={step} motion={active && !reduced} />
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-[1.25fr_1fr]">
        {/* camera frame */}
        <div className="relative overflow-hidden rounded-card border border-white/[0.08] bg-[#0b1220]">
          <svg viewBox="0 0 240 150" className="block w-full" aria-hidden>
            <defs>
              <linearGradient id="lc-glass" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#1e3a5f" />
                <stop offset="1" stopColor="#0b1220" />
              </linearGradient>
            </defs>
            {/* windscreen + console */}
            <path d="M20 14 H220 L204 62 H36 Z" fill="url(#lc-glass)" stroke="#2a3242" />
            <path d="M120 14 V62" stroke="#2a3242" />
            <rect x="12" y="104" width="216" height="46" fill="#151c2b" />
            {[40, 70, 170, 200].map((x) => (
              <circle key={x} cx={x} cy="120" r="5" fill="#0a0d12" stroke="#334155" />
            ))}
            <rect x="98" y="112" width="44" height="16" rx="2" fill="#0a0d12" stroke="#334155" />
            {/* LP (left) and ALP (right) */}
            <g fill="#334155">
              <circle cx="72" cy="70" r="12" />
              <path d="M50 108 Q72 80 94 108 Z" />
              <circle cx="170" cy="72" r="12" />
              <path d="M148 108 Q170 82 192 108 Z" />
            </g>
            {/* phone in LP's hand, walkie on ALP's side */}
            <rect x="84" y="80" width="7" height="12" rx="1.5" fill="#94a3b8" />
            <rect x="186" y="84" width="6" height="14" rx="1" fill="#94a3b8" />
            <rect x="188" y="80" width="1.5" height="5" fill="#94a3b8" />

            <Box show={step >= 2} x={180} y={76} w={18} h={26} color="#10b981" label={step >= 3 ? "WALKIE · OK" : "WALKIE"} />
            <Box show={step >= 3} x={78} y={74} w={20} h={24} color="#e5484d" label="PHONE" />

            <text x="10" y="144" fontSize="7" fontFamily="var(--font-mono)" fill="#828ea1">
              LP
            </text>
            <text x="222" y="144" fontSize="7" fontFamily="var(--font-mono)" fill="#828ea1">
              ALP
            </text>
          </svg>
          {/* scan line while detecting */}
          {active && step >= 1 && step < 3 && (
            <span className="pointer-events-none absolute inset-x-0 h-[2px] animate-sweep-y bg-cyan shadow-[0_0_12px_#22d3ee]" aria-hidden />
          )}
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
            <span className="h-1.5 w-1.5 animate-blink rounded-full bg-danger" /> REC
          </span>
          <div className={`pointer-events-none absolute inset-0 rounded-card ring-2 ring-danger/70 ${on(step === 3, "opacity-100", "opacity-0")}`} aria-hidden />
        </div>

        {/* decisions */}
        <ul className="space-y-2 text-[12.5px]">
          <li className={`rounded-card border border-ok/30 bg-ok/10 p-2.5 ${on(step >= 3, "opacity-100 translate-y-0")}`}>
            <span className="flex items-center gap-1.5 font-semibold text-ok">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Walkie-talkie · compliant
            </span>
            <span className="mt-0.5 block text-ink-300">Cleared automatically, no false alarm</span>
          </li>
          <li className={`rounded-card border p-2.5 transition-colors duration-500 ${step >= 6 ? "border-danger/40 bg-danger/10" : "border-amber/40 bg-amber/10"} ${on(step >= 4, "opacity-100 translate-y-0")}`}>
            <span className={`flex items-center gap-1.5 font-semibold ${step >= 6 ? "text-[#ff8a8d]" : "text-amber"}`}>
              {step >= 6 ? <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> : <AlertTriangle className="h-3.5 w-3.5" aria-hidden />}
              Mobile phone · {step >= 6 ? "confirmed" : "pending review"}
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-ink-300">
              <EyeOff className="h-3 w-3" aria-hidden />
              <span className="rounded bg-white/10 px-1 font-mono text-[11px] text-white">[Crew-7F3A]</span> identity masked
            </span>
          </li>
          <li className={`flex items-center gap-2 rounded-card border border-white/10 bg-white/[0.03] p-2.5 ${on(step >= 5, "opacity-100 translate-y-0")}`}>
            <span className="grid h-6 w-6 place-items-center rounded-full bg-blue/25 text-[#7cc4f0]">
              <UserCheck className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="text-ink-200">
              {step >= 6 ? "Confirmed by reviewer · in report" : "Loco inspector reviewing clip…"}
            </span>
          </li>
        </ul>
      </div>

      {/* pipeline */}
      <ol className="flex items-center gap-1.5 border-t border-white/[0.06] px-4 py-3" aria-hidden>
        {PIPE.map((s, i) => (
          <li key={s.label} className="flex flex-1 items-center gap-1.5">
            <span
              className={`flex-1 rounded-full border px-2 py-1 text-center text-[11px] font-semibold transition-colors duration-500 ${
                step >= s.at ? "border-orange/50 bg-orange/15 text-orange" : "border-white/10 text-ink-400"
              }`}
            >
              {s.label}
            </span>
            {i < PIPE.length - 1 && <span className={`h-px w-3 ${step > s.at ? "bg-orange/60" : "bg-white/10"}`} />}
          </li>
        ))}
      </ol>
    </Shell>
  );
}
