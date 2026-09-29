"use client";

import { useEffect, useRef } from "react";

/** A number that counts up from 0 the first time it scrolls into view (the real value is always in the DOM). */
export function CountUp({ value }: { value: number }) {
  const el = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const node = el.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 900);
        node.textContent = String(Math.round(value * (1 - Math.pow(1 - t, 3))));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      node.textContent = "0";
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(node);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);
  return <span ref={el} className="tabular-nums">{value}</span>;
}
