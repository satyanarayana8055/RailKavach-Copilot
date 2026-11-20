"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import type { TabId } from "@/lib/types";
import { useInView } from "./hooks";
import { LocateVisual, RailcommVisual, WddVisual } from "./ProductVisuals";
import { Stat } from "./Stat";

interface Product {
  num: string;
  name: string;
  kicker: string;
  title: ReactNode;
  tags: string[];
  stats: Array<{ value: number; decimals?: number; prefix?: string; suffix?: string; label: string }>;
  visual: ReactNode;
  tab: TabId;
  cta: string;
  /** Live AiSPRY production platform for this product */
  url: string;
}

/* Copy and figures mirror aispry.ai/products/railkavach. */
const PRODUCTS: Product[] = [
  {
    num: "01",
    name: "Wagon Damage Detection",
    kicker: "WDD",
    title: (
      <>
        AI vision for <em>wagon inspection.</em>
      </>
    ),
    tags: ["YOLOv11", "PaddleOCR", "Entry + exit gantries"],
    stats: [
      { value: 6, label: "Cameras" },
      { value: 8, label: "Damage classes" },
      { value: 99.2, decimals: 1, suffix: "%", label: "Frame detection" },
      { value: 2, prefix: "5–8→", suffix: "h", label: "Inspection / train" },
    ],
    visual: <WddVisual />,
    tab: "wdd",
    url: "https://nwrwdd.aispry.ai",
    cta: "Open gantry differential",
  },
  {
    num: "02",
    name: "Locate",
    kicker: "Cabin video analytics",
    title: (
      <>
        AI eyes inside the <em>locomotive cabin.</em>
      </>
    ),
    tags: ["YOLOv8", "CVVRS", "Edge inference"],
    stats: [
      { value: 5, label: "Violation types" },
      { value: 3, label: "Compliant activities" },
      { value: 100, suffix: "%", label: "Journey coverage" },
      { value: 24, suffix: "×7", label: "Monitoring" },
    ],
    visual: <LocateVisual />,
    tab: "timeline",
    url: "https://nwrlcva.aispry.ai",
    cta: "Open incident timeline",
  },
  {
    num: "03",
    name: "Railcomm",
    kicker: "Audio analytics",
    title: (
      <>
        Clean radio for <em>railway operations.</em>
      </>
    ),
    tags: ["Deep-learning denoise", "9+ noise classes", "Fail-open"],
    stats: [
      { value: 85, suffix: "%", label: "Noise reduction" },
      { value: 95, suffix: "%", label: "Clarity" },
      { value: 60, suffix: "%", label: "Fewer miscommunications" },
      { value: 9, suffix: "+", label: "Noise classes" },
    ],
    visual: <RailcommVisual />,
    tab: "copilot",
    cta: "Ask the voice copilot",
    url: "https://nwradt.aispry.ai",
  },
];

function ProductRow({ p, flip, onOpen }: { p: Product; flip: boolean; onOpen: (t: TabId) => void }) {
  const { ref, inView } = useInView<HTMLElement>(0.2);
  return (
    <article
      ref={ref}
      aria-labelledby={`p-${p.num}`}
      className={`grid items-center gap-10 py-14 lg:grid-cols-2 lg:gap-16 lg:py-20 ${inView ? "animate-fade-up" : "opacity-0"}`}
    >
      <div className={flip ? "lg:order-2" : ""}>{p.visual}</div>

      <div className={flip ? "lg:order-1" : ""}>
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-5xl font-semibold text-transparent [-webkit-text-stroke:1px_rgba(244,130,32,.7)] sm:text-6xl">{p.num}</span>
          <span className="mono-label text-ink-300">
            {p.name} · {p.kicker}
          </span>
        </div>
        <h3 id={`p-${p.num}`} className="h-display mt-4 text-[32px] text-white sm:text-[40px]">
          {p.title}
        </h3>
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technology">
          {p.tags.map((t) => (
            <li key={t} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-ink-200">
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/[0.08] pt-6">
          {p.stats.map((s) => (
            <Stat key={s.label} {...s} />
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn-amber h-11 px-5">
            Launch {p.name} <ArrowUpRight className="h-4 w-4" aria-hidden />
            <span className="sr-only">(opens {new URL(p.url).host} in a new tab)</span>
          </a>
          <button type="button" onClick={() => onOpen(p.tab)} className="btn-ghost-dark h-11 px-5">
            {p.cta} <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  );
}

/** ROCP: any new railway product connects via a YAML manifest — no orchestrator code changes. */
function PlugInBand() {
  const yaml = [
    ["product_id", '"wild_wheel_impact_detector"'],
    ["display_name", '"Wheel Impact Load Detector (WILD)"'],
    ["modality", '"SENSOR_TELEMETRY"'],
    ["endpoint.url", '"local://data/wild_telemetry.json"'],
  ];
  return (
    <div className="mb-16 grid items-center gap-8 rounded-panel border border-dashed border-white/15 bg-white/[0.02] p-6 sm:p-8 lg:mb-24 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-5xl font-semibold text-transparent [-webkit-text-stroke:1px_rgba(245,158,11,.7)]">+</span>
          <span className="mono-label text-ink-300">RailKavach Open Connector Protocol</span>
        </div>
        <h3 className="h-display mt-3 text-[28px] text-white sm:text-[34px]">
          Plug in <em>any product.</em>
        </h3>
        <ol className="mt-6 flex flex-wrap items-center gap-2 font-mono text-[12px] text-ink-200">
          {["Expose endpoint", "Drop YAML", "Auto-registered as Gemini tool"].map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-amber font-semibold text-ink-950">{i + 1}</span>
              {s}
              {i < 2 && <span className="h-px w-5 bg-white/20" aria-hidden />}
            </li>
          ))}
        </ol>
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Next connectors">
          {["WILD · connected", "OHE", "Kavach-TCAS", "Axle counters", "CMS"].map((t, i) => (
            <li
              key={t}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${i === 0 ? "bg-ok/15 text-ok" : "border border-white/10 text-ink-300"}`}
            >
              {t}
            </li>
          ))}
        </ul>
      </div>
      <figure className="overflow-hidden rounded-card border border-white/[0.08] bg-[#070a14]">
        <figcaption className="flex items-center justify-between border-b border-white/[0.07] px-4 py-2.5 font-mono text-[11px] text-ink-300">
          <span>connectors/wild.yaml</span>
          <span className="flex items-center gap-1.5 text-ok">
            <span className="h-1.5 w-1.5 animate-blink rounded-full bg-ok" aria-hidden /> registered
          </span>
        </figcaption>
        <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-7">
          {yaml.map(([k, v]) => (
            <div key={k}>
              <span className="text-cyan">{k}</span>
              <span className="text-ink-400">: </span>
              <span className="text-amber">{v}</span>
            </div>
          ))}
          <div className="text-ink-500"># → FunctionDeclaration generated · 0 code changes</div>
        </pre>
      </figure>
    </div>
  );
}

export function ProductSuite({ onOpen }: { onOpen: (t: TabId) => void }) {
  return (
    <section id="suite" aria-labelledby="suite-h" className="on-dark relative isolate overflow-hidden bg-ink-950 text-white">
      <div className="bg-grid-dark absolute inset-0 -z-10 opacity-60" aria-hidden />
      <div className="mx-auto max-w-[1280px] px-4 pt-16 sm:px-6 lg:pt-24">
        <p className="eyebrow">Already in production · Indian Railways</p>
        <h2 id="suite-h" className="h-display mt-4 max-w-3xl text-[36px] sm:text-[52px]">
          The foundation. <em>Three live platforms.</em>
        </h2>
        <div className="divide-y divide-white/[0.06]">
          {PRODUCTS.map((p, i) => (
            <ProductRow key={p.num} p={p} flip={i % 2 === 1} onOpen={onOpen} />
          ))}
        </div>
        <PlugInBand />
      </div>
    </section>
  );
}
