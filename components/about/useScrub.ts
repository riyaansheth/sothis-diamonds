"use client";

import { useEffect, useRef, type RefObject } from "react";

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** Eased 0..1 for the window [a, b] of a 0..1 progress. */
export const seg = (p: number, a: number, b: number) => ease(clamp01((p - a) / (b - a)));

/**
 * Scroll progress of a tall section whose child is sticky: 0 when its top reaches the top of the
 * viewport, 1 when its bottom reaches the bottom. Calls `onProgress` every frame while the section
 * is on screen (no React state; callers write styles or CSS variables directly).
 *
 * `pinned` is false below the lg breakpoint and with reduced motion: those layouts don't pin, so
 * callers show their final, static composition instead.
 */
export function useScrub<T extends HTMLElement>(ref: RefObject<T | null>, onProgress: (p: number, pinned: boolean) => void) {
  const cb = useRef(onProgress);
  useEffect(() => {
    cb.current = onProgress;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const wide = window.matchMedia("(min-width: 1024px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let running = false;

    const tick = () => {
      const pinned = wide.matches && !reduce.matches;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      cb.current(pinned ? clamp01(total > 0 ? -r.top / total : 0) : 1, pinned);
      raf = running ? requestAnimationFrame(tick) : 0;
    };
    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting;
      if (running && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    tick();
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [ref]);
}

/** Sets CSS custom properties on an element (numbers are written with 4 decimals). */
export function setVars(el: HTMLElement | null, vars: Record<string, number | string>) {
  if (!el) return;
  for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, typeof v === "number" ? v.toFixed(4) : v);
}
