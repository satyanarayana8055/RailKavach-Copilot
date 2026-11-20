"use client";

import { BrainCircuit, Cable, Fingerprint, Radar, ScanEye, Sparkles } from "lucide-react";
import { useInView } from "./hooks";

const STAGES = [
  { n: "01", name: "Capture", icon: Radar, tags: ["CVVRS video", "VHF radio", "Gantry cams", "NTP sync"] },
  { n: "02", name: "Infer", icon: ScanEye, tags: ["YOLOv8", "YOLOv11-L", "PaddleOCR", "U-Net denoise"] },
  { n: "03", name: "Attribute", icon: Cable, tags: ["ROCP", "Canonical events"] },
  { n: "04", name: "Surface", icon: BrainCircuit, tags: ["Gemini 1.5 Pro / Flash", "6 Agent Skills"], hot: true },
  { n: "05", name: "Evidence", icon: Fingerprint, tags: ["SHA-256 custody", "Human review", "BSA 2023 §63"] },
];

const BUILT = [
  "Cross-modal time sync",
  "6 Gemini Agent Skills",
  "2M-token shift context",
  "CRS reports + BSA certificate",
  "Hindi ⇄ English reasoning",
  "ROCP plug-ins",
];

export function Architecture({ standalone = false }: { standalone?: boolean }) {
  const Heading = standalone ? "h1" : "h2";
  const { ref, inView } = useInView<HTMLElement>(0.25);
  return (
    <section id="architecture" ref={ref} aria-labelledby="arch-h" className={`bg-white ${standalone ? "min-h-[calc(100vh-var(--nav-h))]" : "border-y border-[var(--line)]"}`}>
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow eyebrow-light">Architecture</p>
            <Heading id="arch-h" className="h-display h-display-light mt-4 text-[36px] text-ink-950 sm:text-[52px]">
              Five stages. <em>Cloud or edge.</em>
            </Heading>
          </div>
          <ul className="flex flex-wrap gap-2" aria-label="Deployment modes">
            <li className="chip border-blue/30 bg-blue-soft px-3 py-1.5 text-blue-ink">Cloud · Gemini 1.5 Pro / Flash</li>
            <li className="chip border-ok/30 bg-ok-soft px-3 py-1.5 text-ok-ink">Air-gapped edge · Gemma 2B / 7B</li>
          </ul>
        </div>

        <ol className="relative mt-12 grid gap-4 md:grid-cols-5">
          {/* connector + travelling pulse */}
          <div className="absolute left-[10%] right-[10%] top-8 hidden h-px bg-ink-100 md:block" aria-hidden>
            <span className={`absolute -top-[3px] h-[7px] w-[7px] rounded-full bg-orange shadow-glow ${inView ? "animate-travel" : ""}`} />
          </div>
          {STAGES.map((s, i) => (
            <li
              key={s.n}
              className={`relative ${inView ? "animate-fade-up" : "opacity-0"}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div
                className={`relative z-10 mx-auto grid h-16 w-16 place-items-center rounded-panel border ${
                  s.hot ? "border-orange bg-ink-950 text-amber shadow-glow" : "border-[var(--line)] bg-white text-ink-900 shadow-card"
                }`}
              >
                <s.icon className="h-6 w-6" aria-hidden />
              </div>
              <div className="mt-4 text-center">
                <p className="font-mono text-[11px] font-semibold text-ink-400">{s.n}</p>
                <p className="mt-0.5 text-[17px] font-semibold text-ink-950">{s.name}</p>
                <ul className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {s.tags.map((t) => (
                    <li key={t} className="rounded-full bg-paper px-2.5 py-1 text-[12px] font-medium text-ink-700">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>

        <div className="on-dark mt-14 flex flex-col gap-4 rounded-panel bg-ink-950 p-5 text-white sm:p-6 lg:flex-row lg:items-center">
          <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-amber">
            <Sparkles className="h-4 w-4" aria-hidden /> Built at the Buildathon
          </span>
          <ul className="flex flex-wrap gap-2">
            {BUILT.map((b) => (
              <li key={b} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[13px] font-medium text-ink-100">
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
