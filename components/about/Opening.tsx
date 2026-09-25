"use client";

import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { seg, setVars, useScrub } from "./useScrub";

/**
 * Chapter 01. The stone sits in shadow; a narrow studio light reveals it on load. Scrolling moves
 * the camera into the stone until its facets fill the screen and dissolve into the ivory of
 * chapter 02.
 */
export function Opening({ cutout, title, line, scroll, crumbs }: { cutout: string; title: string; line: string; scroll: string; crumbs: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useScrub(root, (p, pinned) => {
    const q = pinned ? p : 0;
    setVars(root.current, {
      "--zoom": 1 + Math.pow(seg(q, 0.08, 0.92), 2.2) * 9, // approaches slowly, then passes into the stone
      "--turn": seg(q, 0, 0.9) * 28,
      "--copy": 1 - seg(q, 0.02, 0.22),
      "--light": seg(q, 0.55, 0.9), // the stone brightens as the camera passes the table
      "--ivory": seg(q, 0.78, 1),
    });
  });

  return (
    <section ref={root} data-header-dark className="relative bg-ink bg-[url(/brand/bg-about-opening.webp)] bg-cover bg-center lg:bg-fixed pt-20 text-on-accent motion-safe:lg:h-[260vh]">
      <div className="relative flex h-[calc(100svh-5rem)] min-h-[34rem] items-center justify-center overflow-hidden motion-safe:lg:sticky motion-safe:lg:top-20">
        <div className="wrap absolute inset-x-0 top-6 z-10 text-on-accent/70 [&_*]:!text-on-accent/70" style={{ opacity: "var(--copy, 1)" }}>{crumbs}</div>

        {/* The stone: revealed by the light on load; its scale and turn follow the scroll. */}
        <div
          className="relative aspect-square w-[min(78vw,62vh,36rem)]"
          style={{ transform: "scale(var(--zoom, 1)) rotate(calc(var(--turn, 0) * 1deg))" }}
        >
          <div className="absolute inset-0" style={{ filter: "brightness(calc(1 + var(--light, 0) * 0.9))" }}>
            <div className="opening-stone absolute inset-0">
              <Image src={cutout} alt="" fill priority sizes="(min-width: 1024px) 40vw, 80vw" className="object-contain" />
            </div>
          </div>
          <span aria-hidden className="opening-light pointer-events-none absolute -inset-[20%]" />
        </div>

        <div className="absolute inset-x-0 bottom-0" style={{ opacity: "var(--copy, 1)" }}>
          <div className="wrap flex flex-col gap-6 pb-12 sm:pb-16 lg:flex-row lg:items-end lg:justify-between">
            <h1 className="opening-title font-display text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-7xl">
              {title.split(" ").map((w, i) => (
                <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                  <span className="inline-block" style={{ animationDelay: `${0.9 + i * 0.09}s` }}>{w}&nbsp;</span>
                </span>
              ))}
            </h1>
            <p className="opening-line max-w-xs text-on-accent/75">{line}</p>
          </div>
        </div>

        <p aria-hidden className="opening-scroll absolute bottom-4 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-on-accent/60 lg:flex" style={{ opacity: "var(--copy, 1)" }}>
          {scroll}
          <span className="block h-8 w-px bg-champagne/70" />
        </p>

        <span aria-hidden className="pointer-events-none absolute inset-0 bg-ivory" style={{ opacity: "var(--ivory, 0)" }} />
      </div>
    </section>
  );
}
