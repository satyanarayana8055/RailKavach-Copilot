"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { useInView, useScrollVar } from "./hooks";
import { rv } from "./reveal";
import { LocateVisual, RailcommVisual, WddVisual } from "./ProductVisuals";
import { Stat } from "./Stat";

interface Product {
  num: string;
  name: string;
  kicker: string;
  title: ReactNode;
  tags: string[];
  stats: Array<{ value: number; decimals?: number; prefix?: string; suffix?: string; label: string }>;
  visual: (active: boolean) => ReactNode;
  /** Live AiSPRY production platform for this product */
  url: string;
}

/* Copy and figures mirror aispry.ai/products/railkavach.
 * Display order is fixed: 01 Railcomm Analytics → 02 Locate → 03 Wagon Damage Detection. */
const PRODUCTS: Product[] = [
  {
    num: "01",
    name: "Railcomm Analytics",
    kicker: "Audio Analytics",
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
    visual: (a) => <RailcommVisual active={a} />,
    url: "https://nwradt.aispry.ai",
  },
  {
    num: "02",
    name: "Locate",
    kicker: "Locomotive Cabin Video Analytics",
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
    visual: (a) => <LocateVisual active={a} />,
    url: "https://nwrlcva.aispry.ai",
  },
  {
    num: "03",
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
    visual: (a) => <WddVisual active={a} />,
    url: "https://nwrwdd.aispry.ai",
  },
];

function ProductRow({ p, flip }: { p: Product; flip: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const scrollRef = useScrollVar<HTMLElement>();
  const visualLeft = !flip;
  return (
    <article ref={scrollRef} aria-labelledby={`p-${p.num}`} className="py-14 [--p:.5] lg:py-20">
      <div ref={ref} data-on={inView} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={`reveal ${flip ? "lg:order-2" : ""}`} style={rv(0, { rx: visualLeft ? -48 : 48, ry: 0 })}>
        {/* gentle counter-scroll parallax on the visual */}
        <div className="will-change-transform" style={{ transform: "translateY(calc((var(--p) - .5) * -36px))" }}>
          {p.visual(inView)}
        </div>
      </div>

      <div className={`reveal ${flip ? "lg:order-1" : ""}`} style={rv(0.15, { rx: visualLeft ? 48 : -48, ry: 0 })}>
        <div className="flex items-baseline gap-4">
          <span
            className="font-mono text-5xl font-semibold text-transparent will-change-transform [-webkit-text-stroke:1px_rgba(244,130,32,.7)] sm:text-6xl"
            style={{ transform: "translateY(calc((var(--p) - .5) * 60px))" }}
          >
            {p.num}
          </span>
          <span className="mono-label text-ink-300">
            {p.name} · {p.kicker}
          </span>
        </div>
        <h3 id={`p-${p.num}`} className="h-display mt-4 text-[32px] text-white sm:text-[40px]">
          {p.title}
        </h3>
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technology">
          {p.tags.map((t, i) => (
            <li
              key={t}
              className="reveal rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-ink-200"
              style={rv(0.4 + i * 0.08, { ry: 6 })}
            >
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/[0.08] pt-6">
          {p.stats.map((s, i) => (
            <div key={s.label} className="reveal" style={rv(0.55 + i * 0.1, { ry: 10 })}>
              <Stat {...s} />
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn-amber h-11 px-5">
            Launch {p.name} <ArrowUpRight className="h-4 w-4" aria-hidden />
            <span className="sr-only">(opens {new URL(p.url).host} in a new tab)</span>
          </a>
          <a href="#demo" className="btn-ghost-dark h-11 px-5">
            Request a demo <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
      </div>
    </article>
  );
}

/** ROCP: any new railway product connects via a YAML manifest — no orchestrator code changes. */
function PlugInBand() {
  const yaml = [
    ["product_id", '"kavach_tcas_telemetry"'],
    ["display_name", '"Kavach-TCAS Train Protection"'],
    ["modality", '"SIGNAL_TELEMETRY"'],
    ["endpoint.url", '"local://data/telemetry_signals.json"'],
  ];
  const { ref, inView } = useInView<HTMLDivElement>(0.35);
  const line = (i: number) => rv(0.3 + i * 0.35, { rx: -8, ry: 0 });
  return (
    <div ref={ref} data-on={inView} className="mb-16 grid items-center gap-8 rounded-panel border border-dashed border-white/15 bg-white/[0.02] p-6 sm:p-8 lg:mb-24 lg:grid-cols-[1fr_1.1fr]">
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
          {["Kavach-TCAS · connected", "OHE Camera", "Axle counters", "CMS"].map((t, i) => (
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
          <span>connectors/kavach.yaml</span>
          <span className="reveal flex items-center gap-1.5 text-ok" style={line(5)}>
            <span className="h-1.5 w-1.5 animate-blink rounded-full bg-ok" aria-hidden /> registered
          </span>
        </figcaption>
        <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-7">
          {yaml.map(([k, v], i) => (
            <div key={k} className="reveal" style={line(i)}>
              <span className="text-cyan">{k}</span>
              <span className="text-ink-400">: </span>
              <span className="text-amber">{v}</span>
            </div>
          ))}
          <div className="reveal text-ink-500" style={line(4)}># → FunctionDeclaration generated · 0 code changes</div>
        </pre>
      </figure>
    </div>
  );
}

export function ProductSuite() {
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
            <ProductRow key={p.num} p={p} flip={i % 2 === 1} />
          ))}
        </div>
        <PlugInBand />
      </div>
    </section>
  );
}
