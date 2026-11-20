import { ArrowDown, ShieldCheck } from "lucide-react";
import { Waveform } from "./Waveform";

function LiveHeader({ left, right }: { left: string; right: string }) {
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

/* ---------- 01 · WDD: six gantry camera streams ---------- */

const STREAMS = [
  { id: "ENTRY · L", det: { label: "DENT 0.94", x: 30, y: 38, w: 26, h: 26, tone: "amber" } },
  { id: "ENTRY · TOP" },
  { id: "ENTRY · R", det: { label: "CLOSED DOOR 0.97", x: 44, y: 30, w: 34, h: 40, tone: "ok" } },
  { id: "EXIT · L" },
  { id: "EXIT · TOP", det: { label: "BULGE 0.81", x: 20, y: 34, w: 30, h: 30, tone: "danger" } },
  { id: "EXIT · R" },
] as const;

const DET_TONE = { amber: "#f59e0b", ok: "#10b981", danger: "#e5484d" } as const;

export function WddVisual() {
  return (
    <div className="panel-dark overflow-hidden" role="img" aria-label="Six live gantry camera streams with AI damage detections: dent, closed door, bulge">
      <LiveHeader left="Live · 6 streams" right="YOLOv11-L · 30 FPS" />
      <div className="grid grid-cols-3 gap-2 p-3">
        {STREAMS.map((s, i) => (
          <div key={s.id} className="relative aspect-[4/3] overflow-hidden rounded-btn border border-white/[0.06] bg-[#070a14]">
            <svg viewBox="0 0 100 75" className="absolute inset-0 h-full w-full" aria-hidden>
              {/* wagon body */}
              <rect x="6" y="18" width="88" height="40" rx="2" fill="#141a26" stroke="#2a3242" />
              {[22, 38, 54, 70].map((x) => (
                <line key={x} x1={x} x2={x} y1="18" y2="58" stroke="#1f2632" />
              ))}
              <circle cx="22" cy="63" r="5" fill="#0a0d12" stroke="#3a4456" />
              <circle cx="78" cy="63" r="5" fill="#0a0d12" stroke="#3a4456" />
              {"det" in s && s.det && (
                <g>
                  <rect x={s.det.x} y={s.det.y} width={s.det.w} height={s.det.h} fill="none" stroke={DET_TONE[s.det.tone]} strokeWidth="1.2" />
                  <rect x={s.det.x} y={s.det.y - 7} width={s.det.label.length * 3.1 + 4} height="7" fill={DET_TONE[s.det.tone]} />
                  <text x={s.det.x + 2} y={s.det.y - 1.8} fontSize="5" fontFamily="var(--font-mono)" fontWeight="700" fill="#0a0d12">
                    {s.det.label}
                  </text>
                </g>
              )}
            </svg>
            <div className="scanline" style={{ animationDelay: `${i * 0.35}s` }} />
            <span className="absolute bottom-1 left-1.5 font-mono text-[9px] font-semibold tracking-wider text-ink-200">{s.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- 02 · Locate: cabin CVVRS stream ---------- */

export function LocateVisual() {
  return (
    <div className="panel-dark overflow-hidden" role="img" aria-label="Locomotive cabin stream: loco pilot detected, walkie-talkie allowed, mobile phone flagged as violation">
      <LiveHeader left="Live · cabin stream" right="YOLOv8 · edge inference" />
      <div className="relative aspect-[16/10] overflow-hidden bg-[#070a14]">
        <svg viewBox="0 0 320 200" className="absolute inset-0 h-full w-full" aria-hidden>
          {/* windshield & track vanishing */}
          <path d="M40 18 H280 L262 92 H58Z" fill="#0d1220" stroke="#2a3242" />
          <path d="M150 92 L158 40 M170 92 L162 40" stroke="#f59e0b" strokeOpacity=".35" />
          <circle cx="160" cy="40" r="2" fill="#e5484d" className="animate-blink" />
          {/* console */}
          <path d="M0 200 L20 128 H300 L320 200Z" fill="#111725" stroke="#1f2632" />
          {/* loco pilot */}
          <circle cx="112" cy="112" r="17" fill="#2a3242" />
          <path d="M78 176 C80 146 96 134 112 134 C128 134 144 146 146 176Z" fill="#2a3242" />
          {/* boxes */}
          <rect x="70" y="88" width="84" height="94" fill="none" stroke="#009fce" strokeWidth="1.5" />
          <rect x="70" y="78" width="74" height="11" fill="#009fce" />
          <text x="74" y="86" fontSize="8" fontFamily="var(--font-mono)" fontWeight="700" fill="#03061a">LOCOPILOT 0.98</text>

          <rect x="132" y="104" width="22" height="26" fill="none" stroke="#e5484d" strokeWidth="2" className="animate-blink" />
          <rect x="132" y="94" width="92" height="11" fill="#e5484d" />
          <text x="136" y="102" fontSize="8" fontFamily="var(--font-mono)" fontWeight="700" fill="#fff">PHONE 0.94 · ALERT</text>

          <rect x="228" y="136" width="30" height="30" fill="none" stroke="#10b981" strokeWidth="1.5" />
          <rect x="212" y="126" width="62" height="11" fill="#10b981" />
          <text x="216" y="134" fontSize="8" fontFamily="var(--font-mono)" fontWeight="700" fill="#03061a">WALKIE 0.91</text>
        </svg>
        <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded bg-black/50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">
          <span className="h-1.5 w-1.5 animate-blink rounded-full bg-danger" /> REC
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] px-4 py-3 font-mono text-[11px]">
        <span className="text-ink-200">
          <span className="text-ink-400">[T+04:23:11Z]</span> VIOLATION = <span className="text-[#ff8a8d]">MOBILE_USE</span> · HIGH
        </span>
        <span className="rounded bg-ok/15 px-1.5 py-0.5 font-semibold text-ok">CLIP SAVED</span>
      </div>
    </div>
  );
}

/* ---------- 03 · Railcomm: denoise in → clean out ---------- */

export function RailcommVisual() {
  return (
    <div className="panel-dark overflow-hidden" role="img" aria-label="Noisy cab radio at minus 12 decibel SNR denoised to clean voice at plus 18 decibel SNR, safety keywords STOP and BLOCK preserved">
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
          <ArrowDown className="h-3.5 w-3.5" aria-hidden /> AI denoise + voice preserve
        </div>

        <div className="rounded-card border border-cyan/25 bg-cyan/[0.05] p-3">
          <div className="flex justify-between font-mono text-[11px]">
            <span className="text-cyan">OUTPUT · CLEAN</span>
            <span className="text-ok">+18 dB SNR</span>
          </div>
          <div className="relative mt-2">
            <Waveform bars={48} tone="cyan" noise={0.15} seed={11} className="h-12" />
            <span className="absolute left-[22%] top-1/2 -translate-y-1/2 rounded bg-amber px-1.5 font-mono text-[10px] font-bold text-ink-950">STOP</span>
            <span className="absolute left-[64%] top-1/2 -translate-y-1/2 rounded bg-amber px-1.5 font-mono text-[10px] font-bold text-ink-950">BLOCK</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {["CNN + RNN · U-Net", "Real-time streaming"].map((t) => (
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
