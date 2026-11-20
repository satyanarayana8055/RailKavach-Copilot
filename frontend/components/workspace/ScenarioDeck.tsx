import { ArrowRight, Moon, Siren, Train, RefreshCw } from "lucide-react";

const SCENARIOS = [
  { n: 1 as const, tag: "Near-SPAD", title: "Train 12414 · Suratgarh", icon: Siren, accent: "bg-orange", ink: "text-orange-ink", soft: "bg-orange-soft" },
  { n: 2 as const, tag: "Night fatigue", title: "02:00–05:00 micro-sleeps", icon: Moon, accent: "bg-amber", ink: "text-amber-ink", soft: "bg-amber-soft" },
  { n: 3 as const, tag: "WDD differential", title: "Rake BOXN-542 damage", icon: Train, accent: "bg-cyan", ink: "text-cyan-ink", soft: "bg-cyan-soft" },
];

export function ScenarioDeck({ onRun, running }: { onRun: (n: 1 | 2 | 3) => void; running: number | null }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {SCENARIOS.map((s) => {
        const busy = running === s.n;
        return (
          <button
            key={s.n}
            type="button"
            onClick={() => onRun(s.n)}
            disabled={running !== null}
            className="card card-hover group relative overflow-hidden p-5 text-left disabled:cursor-wait"
          >
            <span className={`absolute inset-x-0 top-0 h-[3px] ${s.accent}`} aria-hidden />
            <div className="flex items-start justify-between">
              <span className={`grid h-10 w-10 place-items-center rounded-card ${s.soft} ${s.ink}`}>
                <s.icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="font-mono text-3xl font-semibold text-ink-100 transition group-hover:text-ink-200">0{s.n}</span>
            </div>
            <p className={`mono-label mt-4 font-semibold ${s.ink}`}>{s.tag}</p>
            <p className="mt-1 text-[17px] font-semibold text-ink-950">{s.title}</p>
            <span className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold ${s.ink}`}>
              {busy ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" aria-hidden /> Running…
                </>
              ) : (
                <>
                  Run <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                </>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
