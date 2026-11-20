"use client";

import { useInView } from "./hooks";
import { dly, rv } from "./reveal";

const SOURCES = [
  { y: 24, verb: "HEARD", name: "Railcomm", meta: "11,354 audio files", color: "#009fce" },
  { y: 134, verb: "SEEN", name: "Locate", meta: "CVVRS video alerts", color: "#f48220" },
  { y: 244, verb: "SENSED", name: "WDD + WILD", meta: "Gantry & axle sensors", color: "#f59e0b" },
];

/** "Data-rich, insight-poor": three siloed dashboards converge into one reasoning layer. */
export function Convergence() {
  const { ref, inView } = useInView<HTMLElement>(0.3);

  return (
    <section ref={ref} data-on={inView} aria-labelledby="problem-h" className="relative isolate overflow-hidden bg-paper">
      <div className="bg-grid-light mask-fade-b absolute inset-0 -z-10" aria-hidden />
      <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
        <div>
          <p className="eyebrow eyebrow-light">The problem</p>
          <h2 id="problem-h" className="h-display h-display-light mt-4 text-[36px] text-ink-950 sm:text-[52px]">
            Data-rich. <em className="whitespace-nowrap">Insight-poor.</em>
          </h2>

          {/* Race: manual vs copilot */}
          <div className="mt-10 space-y-5" role="img" aria-label="Manual investigation takes 3 to 5 days across 3 dashboards; RailKavach Copilot answers in 15 seconds">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-ink-700">Manual · 3 dashboards</span>
                <span className="font-mono text-lg font-semibold text-ink-950">3–5 days</span>
              </div>
              <div className="mt-2 flex h-3 gap-[2px] overflow-hidden rounded-full bg-ink-100">
                {["#009fce", "#f48220", "#f59e0b"].map((c, i) => (
                  <span key={c} className="grow-bar h-full w-1/3 rounded-full opacity-50" style={{ background: c, ...dly(i * 0.2) }} />
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-ink-950">RailKavach Copilot</span>
                <span className="font-mono text-lg font-semibold text-orange-ink">15 s</span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-ink-100">
                <span className="block h-full w-[2.5%] min-w-[12px] rounded-full bg-orange shadow-glow" />
              </div>
            </div>
          </div>
        </div>

        {/* Convergence diagram */}
        <figure className="card overflow-hidden p-4 sm:p-6">
          <svg viewBox="0 0 560 330" className="w-full" role="img" aria-label="Railcomm (heard), Locate (seen) and WDD plus WILD (sensed) converge into RailKavach Copilot, producing one grounded timeline">
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" />
              </filter>
            </defs>

            {SOURCES.map((s, i) => (
              <g key={s.name} className="reveal" style={rv(i * 0.2, { rx: -28, ry: 0 })}>
                <path
                  d={`M190 ${s.y + 31} C 270 ${s.y + 31}, 270 165, 340 165`}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2"
                  strokeDasharray="6 8"
                  className="animate-flow"
                  opacity=".9"
                />
                <rect x="10" y={s.y} width="180" height="62" rx="10" fill="#fff" stroke="#dde2ea" />
                <rect x="10" y={s.y} width="4" height="62" rx="2" fill={s.color} />
                <text x="28" y={s.y + 20} fontSize="10" fontFamily="var(--font-mono)" fontWeight="700" letterSpacing="1.5" fill="#6b7689">
                  {s.verb}
                </text>
                <text x="28" y={s.y + 38} fontSize="15" fontFamily="var(--font-geist-sans)" fontWeight="600" fill="#0a0d12">
                  {s.name}
                </text>
                <text x="28" y={s.y + 53} fontSize="10.5" fontFamily="var(--font-geist-sans)" fill="#6b7689">
                  {s.meta}
                </text>
              </g>
            ))}

            {/* Copilot core */}
            <rect x="340" y="120" width="200" height="90" rx="14" fill="#f48220" opacity=".35" filter="url(#glow)" className="animate-blink" />
            <rect x="340" y="120" width="200" height="90" rx="14" fill="#0a0d12" />
            <text x="360" y="148" fontSize="10" fontFamily="var(--font-mono)" fontWeight="700" letterSpacing="1.5" fill="#f59e0b">
              REASONING ENGINE
            </text>
            <text x="360" y="170" fontSize="17" fontFamily="var(--font-display)" fontWeight="600" fill="#fff">
              RailKavach Copilot
            </text>
            <text x="360" y="192" fontSize="10.5" fontFamily="var(--font-mono)" fill="#b6bfcd">
              Gemini · 6 Agent Skills
            </text>

            {/* Output */}
            <g className="reveal" style={rv(1.1, { ry: 0 })}>
            <path d="M440 210 V 262" stroke="#0a0d12" strokeWidth="2" strokeDasharray="6 8" className="animate-flow" />
            <rect x="350" y="262" width="180" height="44" rx="22" fill="#fef0e0" stroke="#f48220" />
            <text x="440" y="289" textAnchor="middle" fontSize="13" fontFamily="var(--font-geist-sans)" fontWeight="600" fill="#c2410c">
              1 grounded timeline
            </text>
            </g>
          </svg>
        </figure>
      </div>
    </section>
  );
}
