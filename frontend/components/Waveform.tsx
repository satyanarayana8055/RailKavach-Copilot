const TONES = {
  cyan: "bg-cyan",
  orange: "bg-orange",
  amber: "bg-amber",
  muted: "bg-ink-500",
  white: "bg-white",
} as const;

interface WaveformProps {
  bars?: number;
  tone?: keyof typeof TONES;
  className?: string;
  /** deterministic amplitude seed so SSR and client markup match */
  seed?: number;
  animated?: boolean;
  /** 0–1: jitter. Higher = noisier, spikier signal */
  noise?: number;
}

/** Decorative animated audio waveform (CSS-only, respects reduced motion). */
export function Waveform({ bars = 24, tone = "cyan", className = "", seed = 7, animated = true, noise = 0.35 }: WaveformProps) {
  const heights = Array.from({ length: bars }, (_, i) => {
    const s = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
    const r = s - Math.floor(s);
    const env = 0.45 + 0.55 * Math.sin((i / bars) * Math.PI);
    return Math.max(0.12, Math.min(1, env * (1 - noise) + r * noise * 1.4));
  });
  return (
    <div className={`flex items-center gap-[3px] ${className}`} aria-hidden>
      {heights.map((h, i) => (
        <span
          key={i}
          className={`w-[3px] flex-1 origin-center rounded-full ${TONES[tone]} ${animated ? "animate-wave" : ""}`}
          style={{ height: `${Math.round(h * 100)}%`, animationDelay: `${(i % 7) * 0.11}s` }}
        />
      ))}
    </div>
  );
}
