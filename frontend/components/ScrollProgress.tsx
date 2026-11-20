"use client";

import { useEffect, useRef } from "react";

/** Thin brand-gradient reading-progress bar pinned under the navbar. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <div className="absolute inset-x-0 -bottom-[2px] h-[2px] bg-transparent" aria-hidden>
      <div ref={bar} className="h-full origin-left scale-x-0 bg-gradient-to-r from-amber via-white to-amber" />
    </div>
  );
}
