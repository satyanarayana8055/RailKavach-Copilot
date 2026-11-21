import { Camera, Gauge, Radio } from "lucide-react";
import { Waveform } from "./Waveform";

/** Animated reconstruction of the 12414 near-SPAD: train approaches a RED home signal and stops 60 m short. */
export function IncidentVisual() {
  const sleepers = Array.from({ length: 36 }, (_, i) => i * 16);
  return (
    <figure className="panel-dark relative overflow-hidden p-4 sm:p-5">
      <figcaption className="sr-only">
        Reconstruction of Train 12414 approaching Suratgarh Junction: phone distraction detected, assistant pilot warning, emergency brake,
        train halts 60 metres before a red home signal.
      </figcaption>

      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping2 rounded-full bg-danger" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-danger" />
          </span>
          Live reconstruction
        </span>
        <span className="text-right font-mono text-[11px] text-ink-200">12414 · SURATGARH</span>
      </div>

      <svg viewBox="0 0 560 150" className="mt-3 w-full" aria-hidden>
        <defs>
          <radialGradient id="redGlow">
            <stop offset="0" stopColor="#e5484d" stopOpacity=".9" />
            <stop offset="1" stopColor="#e5484d" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="loco" x1="0" x2="1">
            <stop offset="0" stopColor="#f48220" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="trackFade" x1="0" x2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset=".15" stopColor="#fff" stopOpacity=".35" />
            <stop offset="1" stopColor="#fff" stopOpacity=".35" />
          </linearGradient>
        </defs>

        {sleepers.map((x) => (
          <rect key={x} x={x} y={114} width={6} height={18} rx={1} fill="#fff" opacity=".07" />
        ))}
        <rect x="0" y="117" width="560" height="2" fill="url(#trackFade)" />
        <rect x="0" y="127" width="560" height="2" fill="url(#trackFade)" />

        {/* 60 m safety margin */}
        <g className="animate-blink">
          <line x1="440" x2="500" y1="96" y2="96" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="440" x2="440" y1="90" y2="102" stroke="#f59e0b" strokeWidth="1.5" />
          <line x1="500" x2="500" y1="90" y2="102" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="470" y="86" textAnchor="middle" fill="#f59e0b" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600">
            60 m
          </text>
        </g>

        {/* Home signal at danger */}
        <circle cx="512" cy="34" r="22" fill="url(#redGlow)" className="animate-blink" />
        <rect x="510" y="44" width="4" height="72" rx="1" fill="#2a3242" />
        <rect x="502" y="20" width="20" height="30" rx="5" fill="#0a0d12" stroke="#2a3242" />
        <circle cx="512" cy="29" r="5" fill="#e5484d" />
        <circle cx="512" cy="41" r="3.5" fill="#1f2632" />

        {/* Train (front at x=40, animates to x=440) */}
        <g className="animate-approach" style={{ ["--stop" as string]: "400px" }}>
          <rect x="-196" y="90" width="76" height="24" rx="4" fill="#1f2632" stroke="#2a3242" />
          <rect x="-114" y="90" width="76" height="24" rx="4" fill="#1f2632" stroke="#2a3242" />
          <path d="M-32 90 h56 a16 16 0 0 1 16 16 v8 h-72z" fill="url(#loco)" />
          <rect x="14" y="94" width="12" height="8" rx="2" fill="#03061a" opacity=".8" />
          <circle cx="38" cy="108" r="2.5" fill="#fff" />
          {[-182, -134, -100, -52, -18, 20].map((cx) => (
            <circle key={cx} cx={cx} cy="116" r="3.5" fill="#0a0d12" stroke="#828ea1" />
          ))}
        </g>
      </svg>

      <ul className="mt-2 grid gap-2 sm:grid-cols-3">
        <li className="rounded-card border border-white/[0.07] bg-white/[0.03] p-3">
          <div className="flex items-center justify-between">
            <span className="mono-label flex items-center gap-1.5 text-cyan">
              <Radio className="h-3.5 w-3.5" aria-hidden /> Railcomm
            </span>
            <span className="font-mono text-[11px] text-ink-300">Heard</span>
          </div>
          <Waveform bars={22} className="mt-2 h-7" tone="cyan" />
        </li>
        <li className="rounded-card border border-danger/30 bg-danger/[0.08] p-3">
          <div className="flex items-center justify-between">
            <span className="mono-label flex items-center gap-1.5 text-[#ff8a8d]">
              <Camera className="h-3.5 w-3.5" aria-hidden /> Locate
            </span>
            <span className="font-mono text-[11px] text-ink-300">Seen</span>
          </div>
          <div className="mt-2 font-mono text-sm font-semibold text-white">
            PHONE <span className="text-[#ff8a8d]">0.94</span>
          </div>
        </li>
        <li className="rounded-card border border-white/[0.07] bg-white/[0.03] p-3">
          <div className="flex items-center justify-between">
            <span className="mono-label flex items-center gap-1.5 text-amber">
              <Gauge className="h-3.5 w-3.5" aria-hidden /> Brake
            </span>
            <span className="font-mono text-[11px] text-ink-300">Sensed</span>
          </div>
          <svg viewBox="0 0 100 28" className="mt-2 h-7 w-full" aria-hidden>
            <path d="M0 4 H58 C64 4 66 24 74 24 H100" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
            <text x="0" y="16" fill="#b6bfcd" fontSize="8" fontFamily="var(--font-mono)">5.0</text>
            <text x="86" y="18" fill="#b6bfcd" fontSize="8" fontFamily="var(--font-mono)">0.0</text>
          </svg>
        </li>
      </ul>
    </figure>
  );
}
