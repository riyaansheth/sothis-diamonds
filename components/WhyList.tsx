"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CroppedImage, type Crop } from "./CroppedImage";

export type WhyStone = { src: string; name: string; href: string; crop?: Crop };

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => x * x * (3 - 2 * x);

/**
 * Why Sothis: a pinned stone on the left, the reasons on the right. Scrolling from one reason to the
 * next morphs its stone into the next: it dissolves into light and re-forms, blended additively so
 * the picture never dims or looks see-through. Hovering or focusing a reason morphs to its stone.
 */
export function WhyList({ items, stones, view }: { items: string[][]; stones: WhyStone[]; view: string }) {
  const [active, setActive] = useState(0);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const root = useRef<HTMLDivElement>(null);
  const pinned = useRef<number | null>(null); // a hovered/focused row overrides the scroll position

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let shown = 0;
    let raf = 0;
    let running = false;
    let last = -1;

    // Fractional position of the viewport's middle among the rows. It rests on each row and only
    // moves through the middle of the gap between two, so a stone holds while its reason is read.
    const scrollPos = () => {
      const mid = window.innerHeight / 2;
      const c = rows.current.map((r) => {
        const b = r!.getBoundingClientRect();
        return b.top + b.height / 2;
      });
      if (mid <= c[0]) return 0;
      for (let i = 0; i < c.length - 1; i++) {
        if (mid <= c[i + 1]) return i + smooth(clamp01(((mid - c[i]) / (c[i + 1] - c[i]) - 0.3) / 0.4));
      }
      return c.length - 1;
    };

    const frame = () => {
      const target = pinned.current ?? scrollPos();
      shown = reduce ? target : shown + (target - shown) * 0.14;
      if (Math.abs(target - shown) < 0.001) shown = target;
      const pos = reduce ? Math.round(shown) : shown;

      layers.current.forEach((el, i) => {
        if (!el) return;
        const w = clamp01(1 - Math.abs(pos - i)); // this stone's share of the picture
        const m = 1 - w; // how far it has dissolved
        el.style.opacity = String(w);
        el.style.visibility = w > 0 ? "visible" : "hidden";
        el.style.filter = m > 0.001 ? `blur(${(m * 22).toFixed(1)}px) brightness(${(1 + m * 0.55).toFixed(2)}) saturate(${(1 - m * 0.3).toFixed(2)})` : "";
        el.style.transform = `scale(${(1 + m * 0.1).toFixed(3)})`;
      });
      const now = Math.round(pos);
      if (now !== last) setActive((last = now));
      raf = running ? requestAnimationFrame(frame) : 0;
    };

    // Only animate while the section is on screen.
    const io = new IntersectionObserver(([e]) => {
      running = e.isIntersecting;
      if (running && !raf) raf = requestAnimationFrame(frame);
    });
    if (root.current) io.observe(root.current);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  const pin = (i: number | null) => {
    pinned.current = i;
  };

  return (
    <div ref={root} className="grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <div className="sticky top-20 h-[calc(100dvh-5rem)] overflow-hidden bg-ivory-deep">
          {/* Isolated so the additive blend mixes the stones with each other, not with the page. */}
          <div className="absolute inset-0 isolate">
            {stones.map((s, i) => (
              <div
                key={s.src}
                ref={(el) => {
                  layers.current[i] = el;
                }}
                className="absolute inset-0 mix-blend-plus-lighter will-change-[opacity,filter,transform]"
                style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? "visible" : "hidden" }}
              >
                <CroppedImage src={s.src} crop={s.crop} sizes="60vw" />
              </div>
            ))}
          </div>
          <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-6 bg-gradient-to-b from-ink/45 to-transparent p-8 pb-24 text-on-accent">
            <p key={active} className="why-caption font-display text-2xl">{stones[active]?.name}</p>
            <Link href={stones[active]?.href ?? "#"} className="border-b border-champagne pb-0.5 text-sm">{view}</Link>
          </div>
        </div>
      </div>

      <ol className="wrap py-10 lg:py-[20vh] lg:pl-16 lg:pr-[max(1rem,calc((100vw-80rem)/2))]" onMouseLeave={() => pin(null)}>
        {items.map(([title, body], i) => (
          <li
            key={title}
            ref={(el) => {
              rows.current[i] = el;
            }}
            data-on={i === active ? "" : undefined}
            tabIndex={0}
            onMouseEnter={() => pin(i)}
            onFocus={() => pin(i)}
            onBlur={() => pin(null)}
            className="why-item relative grid grid-cols-[3.5rem_1fr] gap-x-4 py-10 outline-none sm:grid-cols-[5.5rem_1fr] sm:gap-x-6"
          >
            <span aria-hidden className="why-n font-display text-3xl leading-none sm:text-6xl">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3 className="text-2xl sm:text-3xl">{title}</h3>
              <p className="mt-3 max-w-md text-platinum-2">{body}</p>
            </div>
            <span aria-hidden className="why-rule absolute inset-x-0 bottom-0 h-px" />
          </li>
        ))}
      </ol>
    </div>
  );
}
