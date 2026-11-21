"use client";

import {
  Ban, BrainCircuit, Camera, Check, Cloud, FileSignature, Fingerprint, Gauge, KeyRound, Link2, Radio,
  Scale, ScrollText, ShieldCheck, Train, UserRoundX, Workflow,
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "./hooks";

/**
 * The real request path, as built (backend/app): governance → engine (skills + Gemini/Gemma, cache fallback)
 * → custody + rules + masking → outputs, with every step written to the hash-chained audit log.
 */
type Item = { icon: typeof Radio; label: string; sub?: string };
const STAGES: Array<{ id: string; name: string; icon: typeof Radio; items: Item[]; detail: string }> = [
  {
    id: "sources", name: "Sources", icon: Workflow,
    items: [
      { icon: Radio, label: "Railcomm", sub: "radio" },
      { icon: Camera, label: "Locate", sub: "cabin video" },
      { icon: Train, label: "WDD", sub: "wagons" },
    ],
    detail: "Records from the three AiSPRY products. Every audio clip and image gets a SHA-256 hash when it is stored.",
  },
  {
    id: "gate", name: "Access check", icon: KeyRound,
    items: [
      { icon: ShieldCheck, label: "Role + purpose" },
      { icon: Scale, label: "Scope check" },
      { icon: UserRoundX, label: "Refuse or trim" },
    ],
    detail: "The server checks who is asking and why. A question outside the role's sources is refused; out-of-scope evidence is removed.",
  },
  {
    id: "engine", name: "Copilot", icon: BrainCircuit,
    items: [
      { icon: Workflow, label: "6 agent skills", sub: "fetch records" },
      { icon: Cloud, label: "Gemini", sub: "cloud" },
      { icon: Gauge, label: "Gemma", sub: "on-prem" },
    ],
    detail: "Skills pull the matching radio, cabin and wagon records. Gemini answers from them, or Gemma on railway premises. If the model is unavailable, cached answers built from the same data are served.",
  },
  {
    id: "trust", name: "Trust checks", icon: Fingerprint,
    items: [
      { icon: Fingerprint, label: "Evidence hash", sub: "re-verified" },
      { icon: Scale, label: "Rules", sub: "checked vs library" },
      { icon: ShieldCheck, label: "Identities", sub: "masked · DPDP" },
    ],
    detail: "Each citation is bound to its stored file and hash. Every rule named in the answer is checked against the rule library. Personal data is masked unless the role and purpose allow it.",
  },
  {
    id: "out", name: "Outputs", icon: ScrollText,
    items: [
      { icon: Check, label: "Answer", sub: "with citations" },
      { icon: Workflow, label: "Synced timeline" },
      { icon: FileSignature, label: "Report", sub: "§63 draft" },
    ],
    detail: "An answer where every line points to evidence, a timeline across all sources, and an inquiry report with a draft BSA 2023 §63 certificate for signature.",
  },
];

export function Architecture({ standalone = false }: { standalone?: boolean }) {
  const Heading = standalone ? "h1" : "h2";
  const reduced = usePrefersReducedMotion();
  const [refused, setRefused] = useState(false);
  const [step, setStep] = useState(0);
  const [pinned, setPinned] = useState<number | null>(null);
  const stop = refused ? 1 : STAGES.length - 1;

  useEffect(() => {
    if (reduced) return setStep(stop);
    setStep(0);
    const t = setInterval(() => setStep((s) => (s >= stop + 1 ? 0 : s + 1)), 1300);
    return () => clearInterval(t);
  }, [reduced, stop]);

  const live = Math.min(step, stop);
  const shown = pinned ?? live;

  return (
    <section
      id="architecture"
      aria-labelledby="arch-h"
      className={`relative isolate overflow-hidden bg-navy ${standalone ? "min-h-[calc(100vh-var(--nav-h))]" : ""}`}
    >
      <div className="bg-grid-dark absolute inset-0 -z-10" aria-hidden />
      <div className="absolute -left-40 top-20 -z-10 h-[420px] w-[420px] rounded-full bg-orange/15 blur-[120px]" aria-hidden />
      <div className="absolute -right-40 bottom-0 -z-10 h-[420px] w-[420px] rounded-full bg-cyan/15 blur-[120px]" aria-hidden />

      <div className="mx-auto max-w-[1300px] px-4 py-14 sm:px-8 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Architecture</p>
            <Heading id="arch-h" className="h-display mt-4 text-[34px] leading-[1.05] text-white sm:text-[48px]">
              How a question <em>becomes evidence.</em>
            </Heading>
          </div>
          <div role="radiogroup" aria-label="Request path" className="flex rounded-full border border-white/15 bg-white/[0.04] p-1">
            {[
              [false, "Allowed"],
              [true, "Out of scope"],
            ].map(([v, l]) => (
              <button
                key={String(v)}
                type="button"
                role="radio"
                aria-checked={refused === v}
                onClick={() => {
                  setRefused(v as boolean);
                  setPinned(null);
                }}
                className={`rounded-full px-4 py-1.5 text-[14px] font-semibold transition ${refused === v ? (v ? "bg-danger text-white" : "bg-white text-ink-950") : "text-ink-200 hover:text-white"}`}
              >
                {l as string}
              </button>
            ))}
          </div>
        </div>

        {/* pipeline */}
        <ol className="mt-10 grid gap-3 lg:grid-cols-5 lg:gap-0">
          {STAGES.map((s, i) => {
            const reached = i <= live;
            const isLive = i === live;
            const dead = refused && i > 1;
            const deny = refused && i === 1 && step >= 1;
            return (
              <li key={s.id} className="relative flex items-stretch lg:pr-6 last:lg:pr-0">
                <button
                  type="button"
                  onMouseEnter={() => setPinned(i)}
                  onMouseLeave={() => setPinned(null)}
                  onFocus={() => setPinned(i)}
                  onBlur={() => setPinned(null)}
                  aria-describedby="arch-detail"
                  className={`panel-dark flex w-full flex-col justify-start p-4 text-left outline-none transition duration-500 ease-brand focus-visible:ring-2 focus-visible:ring-orange/60 ${
                    deny ? "!border-danger/60 shadow-[0_0_36px_rgba(229,72,77,.35)]" : isLive ? "!border-orange/60 shadow-[0_0_36px_rgba(244,130,32,.3)]" : ""
                  } ${dead ? "opacity-35" : reached ? "opacity-100" : "opacity-70"}`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={`grid h-9 w-9 place-items-center rounded-btn transition ${deny ? "bg-danger text-white" : reached && !dead ? "bg-brand-x text-white" : "bg-white/[0.06] text-ink-300"}`}>
                      {deny ? <Ban className="h-4 w-4" aria-hidden /> : <s.icon className="h-4 w-4" aria-hidden />}
                    </span>
                    <span>
                      <span className="block font-mono text-[10.5px] text-ink-300">0{i + 1}</span>
                      <span className="block text-[15px] font-semibold text-white">{s.name}</span>
                    </span>
                  </span>
                  <ul className="mt-4 w-full space-y-2">
                    {s.items.map((it) => (
                      <li key={it.label} className="flex min-h-[46px] items-center gap-2.5 rounded-btn bg-white/[0.04] px-2.5 py-2">
                        <it.icon className="h-3.5 w-3.5 shrink-0 text-amber" aria-hidden />
                        <span className="min-w-0 text-[13px] font-medium text-ink-100">
                          {it.label}
                          {it.sub && <span className="block font-mono text-[10.5px] leading-tight text-ink-300">{it.sub}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {deny && (
                    <p className="mt-3 flex animate-fade-up items-center gap-1.5 text-[12.5px] font-semibold text-[#ff8a8e]">
                      <Ban className="h-3.5 w-3.5" aria-hidden /> Refused · logged
                    </p>
                  )}
                </button>

                {/* connector to the next stage */}
                {i < STAGES.length - 1 && (
                  <span className="absolute right-0 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-white/15 lg:block" aria-hidden>
                    {!reduced && i === live && step <= stop && !dead && !(refused && i >= 1) && (
                      <span key={step} className="absolute -top-[3px] h-[7px] w-[7px] animate-travel rounded-full bg-orange shadow-glow [animation-duration:1.3s]" />
                    )}
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        {/* audit rail: every stage writes here */}
        <div className="mt-3 grid gap-3 lg:grid-cols-5 lg:gap-6">
          <div className="panel-dark flex items-center gap-3 px-4 py-3 lg:col-span-5">
            <Link2 className="h-4 w-4 shrink-0 text-cyan" aria-hidden />
            <span className="text-[14px] font-semibold text-white">Audit log</span>
            <span className="hidden font-mono text-[11px] text-ink-300 sm:inline">every step · hash-chained · tamper-evident</span>
            <span className="ml-auto flex items-center gap-1" aria-hidden>
              {Array.from({ length: 10 }, (_, k) => (
                <span
                  key={k}
                  className={`h-2 w-4 rounded-sm transition duration-500 ${k < (live + 1) * 2 ? (refused && k >= 2 && k < 4 ? "bg-danger" : "bg-cyan") : "bg-white/10"}`}
                />
              ))}
            </span>
          </div>
        </div>

        {/* what happens here */}
        <p id="arch-detail" aria-live="polite" className="mt-6 min-h-[48px] max-w-[880px] text-[15px] leading-relaxed text-ink-100">
          <span className="mr-2 font-mono text-[11px] uppercase tracking-[0.14em] text-amber">{STAGES[shown].name}</span>
          {refused && shown === 1 ? "This role asked about a source outside its scope. The server refuses before any model sees the data, and records the refusal in the audit log." : STAGES[shown].detail}
        </p>

        {/* runs on */}
        <ul className="mt-8 flex flex-wrap gap-2 border-t border-white/[0.08] pt-6" aria-label="Runs on">
          {[
            [Cloud, "Google Cloud Run · Mumbai (asia-south1)"],
            [Cloud, "Cloud Storage · evidence files"],
            [Gauge, "Gemma · on railway premises"],
            [ScrollText, "Langfuse traces · identities masked"],
          ].map(([Icon, l]) => {
            const I = Icon as typeof Cloud;
            return (
              <li key={l as string} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[13px] font-medium text-ink-100">
                <I className="h-3.5 w-3.5 text-ink-300" aria-hidden /> {l as string}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
