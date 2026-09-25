"use client";

import { useEffect, useRef, useState } from "react";

/** Where each value lives on the stone, in fractions of the photo (the stone spans ~0.26..0.74). */
const POINTS = [
  { x: 0.41, y: 0.37 },
  { x: 0.61, y: 0.34 },
  { x: 0.68, y: 0.53 },
  { x: 0.5, y: 0.49 },
  { x: 0.38, y: 0.63 },
];
const ZOOM = 2.6;
const EDGE_ZOOM = ZOOM * 0.84; // the rim magnifies a little less, like the edge of a real lens
const HIT = 0.075; // how close (fraction of the photo) the lens centre must be to a point

/**
 * Chapter 03. A jeweller's loupe over a studio photograph of the stone. The lens shows the exact
 * area beneath it at ZOOM (same image, mapped in pixels), follows the pointer with easing, and
 * reveals the value annotated at each inspection point. Buttons give the same tour by keyboard.
 */
export function Loupe({ src, t }: {
  src: string; // an optimised URL; the base image and the lens must use the very same image
  t: { title: string; body: string; inspect: string; inspectTouch: string; pointsLabel: string; point: string; points: string[][] };
}) {
  const [active, setActive] = useState<number | null>(null);
  const [moved, setMoved] = useState(false);
  const square = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0.27, y: 0.74 }); // resting on the surface, beside the stone
  const last = useRef<number | null>(null);

  useEffect(() => {
    const sq = square.current;
    const ln = lens.current;
    if (!sq || !ln) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pos = { ...target.current };
    let raf = 0;
    let running = false;

    const frame = () => {
      const W = sq.clientWidth;
      const L = ln.offsetWidth;
      const k = reduce ? 1 : 0.2;
      pos.x += (target.current.x - pos.x) * k;
      pos.y += (target.current.y - pos.y) * k;
      // Keep the whole lens inside the inspection area.
      const half = L / 2 / W;
      const fx = Math.min(1 - half, Math.max(half, pos.x));
      const fy = Math.min(1 - half, Math.max(half, pos.y));
      const cx = fx * W;
      const cy = fy * W;
      ln.style.transform = `translate3d(${cx - L / 2}px, ${cy - L / 2}px, 0)`;
      ln.style.setProperty("--size", `${W * ZOOM}px ${W * ZOOM}px`);
      ln.style.setProperty("--pos", `${L / 2 - cx * ZOOM}px ${L / 2 - cy * ZOOM}px`);
      ln.style.setProperty("--edge-size", `${W * EDGE_ZOOM}px ${W * EDGE_ZOOM}px`);
      ln.style.setProperty("--edge-pos", `${L / 2 - cx * EDGE_ZOOM}px ${L / 2 - cy * EDGE_ZOOM}px`);

      // Nearest inspection point under the lens; the last one found stays shown until the next.
      let hit: number | null = null;
      let best = HIT;
      POINTS.forEach((p, i) => {
        const d = Math.hypot(p.x - fx, p.y - fy);
        if (d < best) [best, hit] = [d, i];
      });
      if (hit !== null && hit !== last.current) setActive((last.current = hit));
      raf = running ? requestAnimationFrame(frame) : 0;
    };

    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting;
      if (running && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(sq);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  const follow = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    // On touch, hold the lens above the finger so the finger doesn't cover what it magnifies.
    const lift = e.pointerType === "touch" ? (lens.current?.offsetWidth ?? 0) * 0.62 : 0;
    target.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top - lift) / r.height };
    if (!moved) setMoved(true);
  };
  const goTo = (i: number) => {
    target.current = { ...POINTS[i] };
    setMoved(true);
  };

  return (
    <section className="relative bg-ivory-deep py-24 lg:py-32" aria-labelledby="loupe-title">
      <div className="wrap grid gap-12 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-12">
        <div className="lg:pt-10">
          <h2 id="loupe-title" className="text-[2.75rem] leading-[1.05] sm:text-6xl">{t.title}</h2>
          <p className="mt-6 max-w-sm text-lg text-platinum-2">{t.body}</p>
          <p className="mt-8 text-sm text-burgundy">
            <span className="hidden [@media(hover:hover)]:inline">{t.inspect}</span>
            <span className="[@media(hover:hover)]:hidden">{t.inspectTouch}</span>
          </p>

          <nav aria-label={t.pointsLabel} className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-platinum-2">{t.pointsLabel}</p>
            <ol className="mt-4 flex flex-wrap gap-2 lg:block lg:space-y-1">
              {t.points.map(([name], i) => (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    onFocus={() => goTo(i)}
                    aria-pressed={active === i}
                    className="flex items-baseline gap-3 border border-line px-3 py-1.5 text-sm transition-colors hover:text-burgundy aria-pressed:border-burgundy aria-pressed:text-burgundy lg:border-0 lg:px-0"
                  >
                    <span className="font-display text-champagne">{String(i + 1).padStart(2, "0")}</span>
                    {name}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="relative lg:pr-[17.5rem]">
          {/* Inspection area: the photo, the markers, the leader lines and the lens. */}
          <div
            ref={square}
            onPointerMove={follow}
            onPointerDown={follow}
            className="loupe-area relative mx-auto aspect-square w-full max-w-[36rem] cursor-none touch-none select-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- the lens maps to this exact image, so it can't be swapped by srcset */}
            <img src={src} alt="" draggable={false} className="absolute inset-0 size-full object-cover" />

            {POINTS.map((p, i) => (
              <div key={i} data-on={active === i ? "" : undefined} className="loupe-point pointer-events-none contents">
                <span aria-hidden className="loupe-marker absolute size-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-champagne" style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }} />
                {/* Leader: from the marker to just past the right edge of the inspection area. */}
                <span aria-hidden className="loupe-leader absolute hidden h-px origin-left bg-champagne lg:block" style={{ left: `calc(${p.x * 100}% + 9px)`, top: `${p.y * 100}%`, width: `calc(${(1 - p.x) * 100}% + 1.5rem - 9px)` }} />
                <div className="loupe-note absolute hidden w-60 -translate-y-1/2 lg:block" style={{ left: "calc(100% + 2.25rem)", top: `${p.y * 100}%` }}>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-platinum-2">{t.point.replace("{n}", String(i + 1).padStart(2, "0"))}</p>
                  <p className="mt-1 font-display text-2xl">{t.points[i][0]}</p>
                  <p className="mt-1 text-sm text-platinum-2">{t.points[i][1]}</p>
                </div>
              </div>
            ))}

            <div
              ref={lens}
              aria-hidden
              data-moved={moved ? "" : undefined}
              className="loupe-lens pointer-events-none absolute left-0 top-0 size-[clamp(9rem,36%,15rem)] rounded-full will-change-transform"
              style={{ backgroundImage: `url("${src}")` }}
            >
              <span className="loupe-edge absolute inset-0 rounded-full" style={{ backgroundImage: `url("${src}")` }} />
              <span className="loupe-glass absolute inset-0 rounded-full" />
            </div>
          </div>

          {/* Mobile and screen readers: the active value as text. */}
          <div aria-live="polite" className="mx-auto mt-8 max-w-[36rem] lg:sr-only">
            {active !== null && (
              <div key={active} className="loupe-mobile-note">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-platinum-2">{t.point.replace("{n}", String(active + 1).padStart(2, "0"))}</p>
                <p className="mt-1 font-display text-2xl">{t.points[active][0]}</p>
                <p className="mt-1 text-platinum-2">{t.points[active][1]}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
