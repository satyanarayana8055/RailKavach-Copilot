import { ArrowRight, Play } from "lucide-react";
import { IncidentVisual } from "./IncidentVisual";
import { Stat } from "./Stat";

export function Hero({ onRun }: { onRun: () => void }) {
  return (
    <section id="top" className="on-dark relative isolate overflow-hidden bg-navy text-white">
      <div className="bg-grid-dark mask-fade-b absolute inset-0 -z-10" aria-hidden />
      <div className="absolute -left-40 -top-40 -z-10 h-[520px] w-[520px] rounded-full bg-orange/20 blur-[120px]" aria-hidden />
      <div className="absolute -right-32 top-20 -z-10 h-[460px] w-[460px] rounded-full bg-cyan/15 blur-[120px]" aria-hidden />

      <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-4 pb-14 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-20 lg:pt-20">
        <div className="animate-fade-up">
          <p className="eyebrow">RailKavach Copilot · by AiSPRY</p>
          <h1 className="h-display mt-5 text-[40px] sm:text-[56px] lg:text-[64px]">
            3–5 days of
            <br />
            investigation.
            <br />
            <em>15 seconds.</em>
          </h1>
          <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink-200">
            A cross-modal reasoning engine that fuses what was heard, seen and sensed on every train run — in Hindi or English, with zero new hardware.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={onRun} className="btn-amber h-12 px-6">
              <Play className="h-4 w-4" aria-hidden /> Replay 12414 incident
            </button>
            <a href="#suite" className="btn-ghost-dark h-12 px-6">
              Explore the suite <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>

        <div className="animate-fade-up [animation-delay:.12s]">
          <IncidentVisual />
        </div>
      </div>

      <div className="border-t border-white/[0.08] bg-ink-950/40">
        <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-x-6 gap-y-6 px-4 py-7 sm:px-6 lg:grid-cols-4">
          <Stat value={11354} label="Audio files · NWR" />
          <Stat value={3.68} decimals={2} suffix="M" label="Transcript lines" />
          <Stat value={1583} label="Loco pilots covered" />
          <Stat value={15} suffix=" s" label="Cross-modal answer" />
        </div>
      </div>
    </section>
  );
}
