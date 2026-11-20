"use client";

import { useCountUp, useInView } from "./hooks";

interface StatProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  tone?: "dark" | "light";
}

/** Animated KPI: large mono number that counts up on first view. */
export function Stat({ value, decimals = 0, prefix = "", suffix = "", label, tone = "dark" }: StatProps) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const v = useCountUp(value, inView);
  const dark = tone === "dark";
  return (
    <div ref={ref} className="min-w-0">
      <div className={`font-mono text-2xl font-semibold tabular-nums tracking-tight sm:text-3xl ${dark ? "text-white" : "text-ink-950"}`}>
        {prefix}
        {v.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
        <span className={dark ? "text-amber" : "text-orange-ink"}>{suffix}</span>
      </div>
      <div className={`mt-1 text-xs font-medium sm:text-[13px] ${dark ? "text-ink-200" : "text-ink-500"}`}>{label}</div>
    </div>
  );
}
