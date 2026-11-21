/* eslint-disable @next/next/no-img-element */
"use client";

import { ArrowRight, ArrowUpRight, Camera, CheckCircle2, ExternalLink, Play, Radio, Sparkles, Train, Video } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useInView, useScrollVar } from "./hooks";
import { rv } from "./reveal";
import { Stat } from "./Stat";
import { VideoModal } from "./VideoModal";

export interface Product {
  num: string;
  name: string;
  kicker: string;
  title: ReactNode;
  tags: string[];
  description: string;
  stats: Array<{ value: number; decimals?: number; prefix?: string; suffix?: string; label: string }>;
  posterUrl: string;
  videoUrl: string;
  videoDuration: string;
  liveUrl: string;
  scenarioLink: string;
  scenarioLabel: string;
  detectionHighlights: Array<{ label: string; badge: string; image: string }>;
}

/* Copy, assets and metrics mirror authentic aispry.ai production deployment on Indian Railways.
 * Display order: 01 Railcomm Analytics → 02 Locate → 03 Wagon Damage Detection. */
export const PRODUCTS: Product[] = [
  {
    num: "01",
    name: "Railcomm Audio Analytics",
    kicker: "Cab Radio Acoustic Denoising & Call-Out Intelligence",
    title: (
      <>
        Clean radio for <em>railway operations.</em>
      </>
    ),
    description:
      "Railway-trained AI denoising that strips engine roar (up to 110 dB), horns, and platform babble out of operational VHF radio in real time, while protecting safety call-outs (G&SR 4.40) and caution orders (T/409) under fail-open architecture.",
    tags: ["Acoustic AI Denoising", "Bilingual Hindi + English", "G&SR 4.40 Callouts", "Fail-Open Safety"],
    stats: [
      { value: 85, suffix: "%", label: "Noise reduction" },
      { value: 95, suffix: "%", label: "Communication clarity" },
      { value: 60, suffix: "%", label: "Fewer miscommunications" },
      { value: 11354, suffix: "+", label: "Audio files trained" },
    ],
    posterUrl: "/images/products/nmr-railway/railcomm-poster.jpg",
    videoUrl: "/videos/products/railcomm-audio-analytics-demo.mp4",
    videoDuration: "0:56",
    liveUrl: "https://nwradt.aispry.ai",
    scenarioLink: "/copilot?scenario=4",
    scenarioLabel: "Investigate VHF Miscommunications in Copilot",
    detectionHighlights: [
      { label: "110dB Roar Denoised", badge: "85% Noise Cut", image: "/images/products/detections/railcomm-frame-25.jpg" },
      { label: "Signal Call-Out Verified", badge: "G&SR 4.40", image: "/images/products/detections/railcomm-frame-50.jpg" },
      { label: "Caution Order T/409", badge: "Loop Line 30km/h", image: "/images/products/detections/railcomm-frame-75.jpg" },
    ],
  },
  {
    num: "02",
    name: "Locate",
    kicker: "Locomotive Cabin Video Analytics (CVVRS)",
    title: (
      <>
        AI eyes inside the <em>locomotive cabin.</em>
      </>
    ),
    description:
      "Edge-deployed YOLOv8 computer vision analyzing multi-camera CVVRS footplate video feeds. Automatically identifies five critical SOP violations (mobile phone, micro-sleep, eating, posture, unauthorized cab entry) while whitelisting compliant railway operations with human reviewer audits.",
    tags: ["CVVRS Multi-Camera", "YOLOv8 Edge Vision", "Human Review Audit", "DPDP Act Masked"],
    stats: [
      { value: 5, label: "Violation types detected" },
      { value: 3, label: "Compliant duties whitelisted" },
      { value: 100, suffix: "%", label: "Journey coverage" },
    ],
    posterUrl: "/images/products/nmr-railway/cvvrs-dashboard-v3.jpg",
    videoUrl: "/videos/products/locate-demo-2026-10-v2.mp4",
    videoDuration: "0:53",
    liveUrl: "https://nwrlcva.aispry.ai",
    scenarioLink: "/copilot?scenario=1",
    scenarioLabel: "Reconstruct SPAD Video Timeline in Copilot",
    detectionHighlights: [
      { label: "Mobile Phone Infraction", badge: "28s · CONFIRMED", image: "/images/products/detections/locate-frame-25.jpg" },
      { label: "Micro-Sleep Episode", badge: "03:45 AM Cluster", image: "/images/products/detections/locate-frame-50.jpg" },
      { label: "Reviewer Verification", badge: "DSO-BKN Cryptolock", image: "/images/products/detections/locate-frame-75.jpg" },
    ],
  },
  {
    num: "03",
    name: "Wagon Damage Detection",
    kicker: "Wayside 6-Gantry Vision & PaddleOCR",
    title: (
      <>
        AI vision for <em>wagon inspection.</em>
      </>
    ),
    description:
      "A high-speed six-camera YOLOv8 + PaddleOCR pipeline that inspects freight wagons as trains pass trackside gantries at line speed (up to 60 km/h). Reads every wagon serial number and cross-reconciles Entry vs Exit condition differentials across 8 damage classes with zero human compiling.",
    tags: ["6 High-Speed Cameras", "YOLOv8 Damage Vision", "PaddleOCR Serial Recognition", "Entry vs Exit Diff"],
    stats: [
      { value: 6, label: "Gantry camera angles" },
      { value: 8, label: "Damage defect classes" },
      { value: 99.2, decimals: 1, suffix: "%", label: "Frame detection rate" },
    ],
    posterUrl: "/images/products/nmr-railway/wdd-dashboard-v2.jpg",
    videoUrl: "/videos/products/wdd-demo-2026-11.mp4",
    videoDuration: "0:58",
    liveUrl: "https://nwrwdd.aispry.ai",
    scenarioLink: "/copilot?scenario=3",
    scenarioLabel: "Audit BOXN-542 Rake Damage in Copilot",
    detectionHighlights: [
      { label: "PaddleOCR Serial Read", badge: "BOXN-542 (98.2%)", image: "/images/products/detections/wdd-frame-25.jpg" },
      { label: "Transit Damage Detected", badge: "Left Door Flap", image: "/images/products/detections/wdd-frame-50.jpg" },
      { label: "6-Gantry Differential", badge: "Damage Debit Note", image: "/images/products/detections/wdd-frame-75.jpg" },
    ],
  },
];

function ProductRow({
  p,
  flip,
  onWatchVideo,
}: {
  p: Product;
  flip: boolean;
  onWatchVideo: (product: Product) => void;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const scrollRef = useScrollVar<HTMLElement>();
  const visualLeft = !flip;

  return (
    <article ref={scrollRef} aria-labelledby={`p-${p.num}`} className="py-14 [--p:.5] lg:py-20">
      <div ref={ref} data-on={inView} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Visual / Video Showcase Column */}
        <div className={`reveal ${flip ? "lg:order-2" : ""}`} style={rv(0, { rx: visualLeft ? -48 : 48, ry: 0 })}>
          <div className="flex flex-col gap-3">
            {/* Interactive Video Poster Card */}
            <div
              onClick={() => onWatchVideo(p)}
              className="group relative cursor-pointer overflow-hidden rounded-card border border-white/15 bg-[#070a14] shadow-lift transition duration-300 hover:border-orange/60 hover:shadow-2xl"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onWatchVideo(p)}
              aria-label={`Watch production demo video for ${p.name}`}
            >
              {/* Poster Image / Background Video Animation for Locate */}
              {p.num === "02" ? (
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#050d1c]">
                  <video
                    className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster="/images/products/locate-login-hero-frame.webp"
                    src="/videos/locate-login-hero.mp4"
                    aria-label="Locate NWRLCVA locomotive cabin surveillance animation"
                  />
                  {/* Subtle edge vignette matching nwrlcva.aispry.ai */}
                  <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_50%_45%,transparent_55%,rgb(5_13_28/0.85)_100%)]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20 transition group-hover:opacity-75" />
                </div>
              ) : (
                <>
                  <img
                    src={p.posterUrl}
                    alt={`${p.name} live dashboard interface`}
                    className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/10 transition group-hover:opacity-85" />
                </>
              )}

              {/* Status Header Badge */}
              <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/20 bg-ink-950/80 px-3 py-1 backdrop-blur-md">
                <span className="h-2 w-2 animate-blink rounded-full bg-ok" aria-hidden />
                <span className="font-mono text-[11px] font-semibold text-white uppercase tracking-wider">
                  {p.num === "02" ? "Live Cabin Animation · NWR LCVA" : "Recorded in Production · NWR"}
                </span>
              </div>

              {/* Centered Play Button */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/40 bg-orange/90 text-white shadow-glow transition duration-300 group-hover:scale-110 group-hover:bg-orange">
                  <Play className="ml-1 h-7 w-7 fill-white" />
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/75 px-3 py-1 backdrop-blur-md">
                  <Video className="h-3.5 w-3.5 text-orange" />
                  <span className="font-mono text-xs font-semibold text-white">
                    Watch Demo Video ({p.videoDuration})
                  </span>
                </div>
              </div>

              {/* Bottom Details Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-ink-300">
                <span className="font-mono text-[11px] text-white/90">
                  Click to inspect live detections
                </span>
                <span className="font-mono text-[11px] font-semibold text-orange">
                  Full 1080p Telemetry ↗
                </span>
              </div>
            </div>

            {/* AI Detection Frames Thumbnail Strip */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3" role="group" aria-label="Key detection frames">
              {p.detectionHighlights.map((det, i) => (
                <div
                  key={det.label}
                  onClick={() => onWatchVideo(p)}
                  className="group relative cursor-pointer overflow-hidden rounded-btn border border-white/10 bg-white/[0.03] transition hover:border-orange/60"
                  title={`View ${det.label} in video player`}
                >
                  <img
                    src={det.image}
                    alt={det.label}
                    className="aspect-[16/10] w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                  <div className="absolute bottom-1.5 left-1.5 right-1.5">
                    <p className="truncate font-mono text-[10px] font-semibold text-white drop-shadow">
                      {det.label}
                    </p>
                    <span className="mt-0.5 inline-block rounded bg-orange/90 px-1 py-px font-mono text-[9px] font-bold text-white">
                      {det.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Text & Statistics Column */}
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

          <p className="mt-4 text-sm leading-relaxed text-ink-200 sm:text-base">
            {p.description}
          </p>

          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technology and features">
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

          <div className={`mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/[0.08] pt-6 ${p.stats.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4"}`}>
            {p.stats.map((s, i) => (
              <div key={s.label} className="reveal" style={rv(0.55 + i * 0.1, { ry: 10 })}>
                <Stat {...s} />
              </div>
            ))}
          </div>

          {/* Action Button Row */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onWatchVideo(p)}
              className="flex items-center gap-2 rounded-full bg-orange px-5 py-2.5 font-mono text-xs font-semibold text-white shadow-glow transition hover:brightness-110 active:scale-95"
            >
              <Play className="h-3.5 w-3.5 fill-white" aria-hidden /> Watch Production Video ({p.videoDuration})
            </button>
            <a
              href={p.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 font-mono text-xs font-medium text-ink-200 transition hover:bg-white/10 hover:text-white"
            >
              <span>Live Platform</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-orange" aria-hidden />
            </a>
            <a
              href={p.scenarioLink}
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 font-mono text-xs font-medium text-ink-200 transition hover:bg-white/10 hover:text-white"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber" aria-hidden />
              <span>Copilot Demo</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductSuite() {
  const [activeVideoProduct, setActiveVideoProduct] = useState<Product | null>(null);

  return (
    <section id="suite" aria-labelledby="suite-h" className="on-dark relative isolate overflow-hidden bg-ink-950 text-white">
      <div className="bg-grid-dark absolute inset-0 -z-10 opacity-60" aria-hidden />
      <div className="mx-auto max-w-[1280px] px-4 pt-16 sm:px-6 lg:pt-24">
        <p className="eyebrow">Already in production · Indian Railways</p>
        <h2 id="suite-h" className="h-display mt-4 max-w-3xl text-[36px] sm:text-[52px]">
          The foundation. <em>Three live platforms.</em>
        </h2>
        <p className="mt-4 max-w-2xl text-base text-ink-300">
          AiSPRY&apos;s deployed vision and audio engines produce the evidence streams. RailKavach Copilot provides the cognitive reasoning layer uniting them all into one statutory truth.
        </p>

        <div className="divide-y divide-white/[0.06]">
          {PRODUCTS.map((p, i) => (
            <ProductRow
              key={p.num}
              p={p}
              flip={i % 2 === 1}
              onWatchVideo={(prod) => setActiveVideoProduct(prod)}
            />
          ))}
        </div>

      </div>

      {/* Interactive Production Video Lightbox Modal */}
      <VideoModal
        isOpen={!!activeVideoProduct}
        onClose={() => setActiveVideoProduct(null)}
        product={activeVideoProduct}
      />
    </section>
  );
}
