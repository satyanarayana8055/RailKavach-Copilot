"use client";

import { ArrowRight, EyeOff, Fingerprint, Languages, ShieldCheck } from "lucide-react";
import { useInView } from "./hooks";
import { rv } from "./reveal";

const PILLARS = [
  { icon: ShieldCheck, title: "Role-scoped", line: "Each official sees only their remit" },
  { icon: Fingerprint, title: "Evidence on every answer", line: "Timestamped audio, video, sensor" },
  { icon: EyeOff, title: "DPDP by design", line: "Personal data masked by default" },
  { icon: Languages, title: "Hindi + English", line: "Ask by voice or text" },
];

/** Public mention of the authorised copilot — describes it, doesn't expose it. */
export function CopilotTeaser() {
  const { ref, inView } = useInView<HTMLElement>(0.3);
  return (
    <section ref={ref} data-on={inView} aria-labelledby="copilot-teaser-h" className="relative isolate overflow-hidden bg-paper">
      <div className="bg-grid-light mask-fade-b absolute inset-0 -z-10" aria-hidden />
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow eyebrow-light">For railway officials</p>
            <h2 id="copilot-teaser-h" className="h-display h-display-light mt-4 max-w-2xl text-[36px] text-ink-950 sm:text-[52px]">
              Ask a question. <em>Get the evidence.</em>
            </h2>
          </div>
          <a href="/copilot/" className="btn-ink h-12 px-6">
            Open Copilot · authorised staff <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <li key={p.title} className="reveal card p-5" style={rv(i * 0.12, { ry: 16 })}>
              <span className="grid h-10 w-10 place-items-center rounded-btn bg-orange-soft text-orange-ink">
                <p.icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-4 font-semibold text-ink-950">{p.title}</p>
              <p className="mt-1 text-sm text-ink-500">{p.line}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
