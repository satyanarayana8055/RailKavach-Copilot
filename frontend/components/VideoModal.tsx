/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, ExternalLink, Play, Sparkles, X } from "lucide-react";

export interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    num: string;
    name: string;
    kicker: string;
    videoUrl: string;
    posterUrl: string;
    videoDuration: string;
    description: string;
    liveUrl: string;
    stats: Array<{ value: number | string; label: string; suffix?: string; prefix?: string }>;
    detectionHighlights?: Array<{ label: string; badge: string; image: string }>;
  } | null;
}

export function VideoModal({ isOpen, onClose, product }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-ink-950/85 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-panel border border-white/15 bg-[#0a0e17] text-white shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange/20 font-mono text-xs font-semibold text-orange">
              {product.num}
            </span>
            <div>
              <h3 id="video-modal-title" className="text-base font-semibold text-white sm:text-lg">
                {product.name}
              </h3>
              <p className="font-mono text-xs text-ink-300">
                {product.kicker} · Recorded live on Indian Railways
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-btn border border-white/10 bg-white/5 text-ink-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Close video player"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full bg-black">
          <video
            ref={videoRef}
            src={product.videoUrl}
            poster={product.posterUrl}
            controls
            autoPlay
            playsInline
            className="h-full w-full object-contain"
          >
            <track kind="captions" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Footer & Telemetry Highlights */}
        <div className="flex flex-col gap-4 border-t border-white/10 bg-[#070a12] p-5 sm:px-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs leading-relaxed text-ink-200 sm:text-sm">
                {product.description}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <a
                href={product.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs font-semibold text-white transition hover:bg-white/15"
              >
                <span>Live Platform</span>
                <ExternalLink className="h-3.5 w-3.5 text-orange" />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-orange px-4 py-2 font-mono text-xs font-semibold text-white transition hover:brightness-110"
              >
                Done
              </button>
            </div>
          </div>

          {/* Real Detection Thumbnails */}
          {product.detectionHighlights && product.detectionHighlights.length > 0 && (
            <div className="border-t border-white/10 pt-3">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-ink-400">
                Key AI Detection Frames from Video
              </p>
              <div className="grid grid-cols-3 gap-3">
                {product.detectionHighlights.map((det) => (
                  <div
                    key={det.label}
                    className="group relative overflow-hidden rounded-btn border border-white/10 bg-white/5 transition hover:border-orange/50"
                  >
                    <img
                      src={det.image}
                      alt={det.label}
                      className="aspect-[16/10] w-full object-cover transition group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold text-white drop-shadow">
                        {det.label}
                      </span>
                      <span className="rounded bg-orange/90 px-1 py-0.5 font-mono text-[10px] font-bold text-white">
                        {det.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
