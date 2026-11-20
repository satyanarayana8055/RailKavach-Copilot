import type { CSSProperties } from "react";

/**
 * Style vars for the `.reveal` / `.draw` / `.sweep` keyframes in globals.css.
 * delay in seconds; rx/ry offsets in px; rs = starting scale.
 */
export function rv(delay = 0, { rx = 0, ry = 12, rs = 1 }: { rx?: number; ry?: number; rs?: number } = {}): CSSProperties {
  return { "--d": `${delay}s`, "--rx": `${rx}px`, "--ry": `${ry}px`, "--rs": rs } as CSSProperties;
}

export const dly = (delay: number): CSSProperties => ({ "--d": `${delay}s` }) as CSSProperties;
