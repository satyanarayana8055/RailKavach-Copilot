"use client";

import { ArrowRight, Camera, Check, KeyRound, Radio, ShieldCheck, Sparkles, Train } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { usePrefersReducedMotion } from "@/components/hooks";
import { ROLES } from "@/lib/data";
import type { UserRole } from "@/lib/types";

/**
 * Sign-in for the authorised workspace: a compact role picker beside a visual of what the Copilot does.
 * Demo stand-in: in production the role comes from the railway identity provider, not a picker.
 */
export function RoleGate({ onEnter }: { onEnter: (r: UserRole) => void }) {
  return (
    <main id="copilot" className="relative isolate overflow-hidden bg-navy">
      <div className="bg-grid-dark absolute inset-0 -z-10" aria-hidden />
      <div className="absolute -left-40 top-1/3 -z-10 h-[420px] w-[420px] rounded-full bg-orange/20 blur-[120px]" aria-hidden />
      <div className="absolute -right-32 bottom-0 -z-10 h-[380px] w-[380px] rounded-full bg-cyan/20 blur-[120px]" aria-hidden />

      <div className="mx-auto grid min-h-[calc(100vh-var(--nav-h))] max-w-[1300px] grid-cols-1 items-center gap-10 px-4 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_470px] lg:gap-14 lg:py-12">
        <section aria-labelledby="gate-h" className="min-w-0">
          <p className="eyebrow">RailKavach Copilot</p>
          <h1 id="gate-h" className="h-display mt-4 text-[34px] leading-[1.05] text-white sm:text-[48px]">
            Ask once. <em>Every source answers.</em>
          </h1>
          <div className="mt-10 hidden lg:block">
            <CopilotFlow />
          </div>
        </section>

        <SignIn onEnter={onEnter} />
      </div>
    </main>
  );
}

/* ---------------------------------------------------------------- sign-in card */

function SignIn({ onEnter }: { onEnter: (r: UserRole) => void }) {
  const roles = Object.values(ROLES);
  const [sel, setSel] = useState<UserRole>("ROLE_SR_DSO");
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const r = ROLES[sel];

  const move = (e: KeyboardEvent) => {
    const i = roles.findIndex((x) => x.code === sel);
    const next = e.key === "ArrowDown" || e.key === "ArrowRight" ? i + 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? i - 1 : null;
    if (next !== null) {
      e.preventDefault();
      const code = roles[(next + roles.length) % roles.length].code;
      setSel(code);
      refs.current[code]?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onEnter(sel);
    }
  };

  return (
    <section aria-labelledby="signin-h" className="min-w-0 rounded-[16px] bg-white p-5 shadow-[0_30px_80px_rgba(0,0,0,.45)] sm:p-6">
      <header className="flex items-center justify-between gap-3">
        <h2 id="signin-h" className="flex items-center gap-2 text-[17px] font-semibold text-ink-950">
          <KeyRound className="h-4 w-4 text-orange-ink" aria-hidden /> Sign in
        </h2>
        <span className="chip shrink-0 border-ok/30 bg-ok-soft text-ok-ink">
          <ShieldCheck className="h-3 w-3" aria-hidden /> Railway SSO · demo
        </span>
      </header>

      <div role="radiogroup" aria-label="Choose your role" onKeyDown={move} className="mt-4 space-y-1.5">
        {roles.map((x) => {
          const on = x.code === sel;
          return (
            <div
              key={x.code}
              ref={(el) => {
                refs.current[x.code] = el;
              }}
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              onClick={() => setSel(x.code)}
              onDoubleClick={() => onEnter(x.code)}
              className={`flex cursor-pointer items-center gap-3 rounded-btn border px-3 py-2 outline-none transition duration-200 ease-brand focus-visible:ring-2 focus-visible:ring-orange/50 ${
                on ? "border-orange bg-orange-soft" : "border-[var(--line)] hover:border-ink-200 hover:bg-paper"
              }`}
            >
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-btn transition ${on ? "bg-orange text-white" : "bg-paper-2 text-ink-700"}`}>
                <x.icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold leading-snug text-ink-950">{x.designation}</span>
                <span className="block font-mono text-[10.5px] text-ink-500">{x.division}</span>
              </span>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onEnter(sel)}
        aria-label={`Continue as ${r.designation}`}
        className="group mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-btn bg-amber text-[15px] font-semibold text-ink-950 transition duration-200 ease-brand hover:bg-orange hover:text-white"
      >
        Continue as {r.short}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
      </button>
      <p className="mt-3 text-center font-mono text-[10.5px] text-ink-500">Every sign-in and question goes to a tamper-evident audit log</p>
    </section>
  );
}

/* ---------------------------------------------------------------- the visual */

/** Three sources stream into the Copilot; it answers with checks on evidence, privacy and rules. */
function CopilotFlow() {
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (reduced) return setStep(4);
    const t = setInterval(() => setStep((s) => (s + 1) % 7), 1100);
    return () => clearInterval(t);
  }, [reduced]);

  const IN = [
    { y: 60, icon: Radio, name: "Railcomm", stat: "1,053 radio calls", tint: "text-cyan", stroke: "#009fce" },
    { y: 170, icon: Camera, name: "Locate", stat: "723 cabin alerts", tint: "text-orange", stroke: "#f48220" },
    { y: 280, icon: Train, name: "WDD", stat: "58 wagons scanned", tint: "text-amber", stroke: "#f59e0b" },
  ];
  const paths = ["M190,60 C232,60 226,170 252,170", "M190,170 L252,170", "M190,280 C232,280 226,170 252,170"];
  const OUT = ["Evidence hash verified", "Identities masked", "Rules checked · G&SR 4.40"];

  return (
    <figure className="relative aspect-[600/340] w-full max-w-[620px]" aria-label="Railcomm, Locate and WDD records flow into the Copilot, which answers with verified evidence, masked identities and checked rules">
      <svg viewBox="0 0 600 340" className="absolute inset-0 h-full w-full" aria-hidden>
        {paths.map((d, i) => (
          <g key={d}>
            <path id={`flow-${i}`} d={d} fill="none" stroke={IN[i].stroke} strokeOpacity=".35" strokeWidth="1.5" strokeDasharray="3 5" />
            {!reduced && (
              <circle r="3.5" fill={IN[i].stroke}>
                <animateMotion dur="1.8s" begin={`${i * 0.45}s`} repeatCount="indefinite">
                  <mpath href={`#flow-${i}`} />
                </animateMotion>
              </circle>
            )}
          </g>
        ))}
        <path id="flow-out" d="M348,170 L400,170" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" strokeDasharray="3 5" />
        {!reduced && (
          <circle r="3.5" fill="#fff">
            <animateMotion dur="1.2s" repeatCount="indefinite">
              <mpath href="#flow-out" />
            </animateMotion>
          </circle>
        )}
      </svg>

      {IN.map((s) => (
        <div key={s.name} className="panel-dark absolute left-0 flex w-[31.7%] items-center gap-3 px-3" style={{ top: `${((s.y - 32) / 340) * 100}%`, height: `${(64 / 340) * 100}%` }}>
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-btn bg-white/[0.06] ${s.tint}`}>
            <s.icon className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-[14px] font-semibold text-white">{s.name}</span>
            <span className="block truncate font-mono text-[10.5px] text-ink-300">{s.stat}</span>
          </span>
        </div>
      ))}

      {/* core */}
      <div className="absolute grid place-items-center" style={{ left: `${(252 / 600) * 100}%`, top: `${(122 / 340) * 100}%`, width: `${(96 / 600) * 100}%`, height: `${(96 / 340) * 100}%` }}>
        <span className="absolute inset-0 rounded-full border border-dashed border-white/25 motion-safe:animate-[spin_14s_linear_infinite]" aria-hidden />
        <span className="absolute inset-[14%] rounded-full bg-brand-x opacity-90 shadow-[0_0_40px_rgba(244,130,32,.45)]" aria-hidden />
        <Sparkles className="relative h-6 w-6 text-white" aria-hidden />
      </div>

      {/* answer */}
      <div className="absolute rounded-card bg-white p-3.5 shadow-[0_18px_50px_rgba(0,0,0,.4)]" style={{ left: `${(400 / 600) * 100}%`, top: `${(78 / 340) * 100}%`, width: `${(200 / 600) * 100}%` }}>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">Answer</p>
        <p className="mt-1 text-[14px] font-semibold leading-snug text-ink-950">12414 stopped 60 m short. No SPAD.</p>
        <ul className="mt-2.5 space-y-1.5">
          {OUT.map((t, i) => (
            <li key={t} className={`flex items-center gap-1.5 text-[12px] font-medium transition duration-500 ease-brand ${step > i ? "translate-x-0 text-ink-800 opacity-100" : "-translate-x-1 opacity-0"}`}>
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-ok text-white">
                <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
