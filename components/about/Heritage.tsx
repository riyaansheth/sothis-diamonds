"use client";

import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { seg, setVars, useScrub } from "./useScrub";

/**
 * Chapter 02. An exhibition print of today's stone opens from a framed mat to a full-bleed image
 * while the headline gives way to a two-column text with a line from 1970 to today.
 * No archive photographs exist in the export, so nothing here pretends to be historical.
 * It opens the About page, so its column heading is the page's h1.
 */
export function Heritage({ photo, t, crumbs }: {
  photo: string;
  crumbs?: ReactNode;
  t: { rooted: string; since: string; heritage: string[]; then: string; now: string; nowPlace: string; founded: string; caption: string };
}) {
  const root = useRef<HTMLElement>(null);

  useScrub(root, (p, pinned) => {
    const e = pinned ? seg(p, 0.18, 0.62) : 1;
    setVars(root.current, {
      "--e": e,
      "--head": pinned ? 1 - seg(p, 0.12, 0.34) : 0,
      "--cols": pinned ? seg(p, 0.42, 0.66) : 1,
      "--line": pinned ? seg(p, 0.55, 0.92) : 1,
    });
  });

  return (
    <section ref={root} className="grain relative bg-[#1a0f10] bg-[url(/brand/bg-about-antwerp.webp)] bg-cover bg-center pt-20 lg:bg-none lg:pt-0 motion-safe:lg:h-[280vh]">
      <div className="relative overflow-hidden motion-safe:lg:sticky motion-safe:lg:top-0 lg:h-screen lg:bg-[url(/brand/bg-about-antwerp.webp)] lg:bg-cover lg:bg-center lg:pt-20">
        {crumbs && <div className="wrap relative z-20 pt-6 lg:absolute lg:inset-x-0 lg:top-20">{crumbs}</div>}
        {/* Headline above the print, before the frame opens. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[17%] z-10 hidden justify-center lg:flex" style={{ opacity: "var(--head, 0)" }}>
          <p className="text-center font-display text-7xl leading-none" style={{ transform: "translateY(calc((1 - var(--head, 0)) * -6vh))" }}>{t.rooted}</p>
        </div>

        {/* The print: a small matted frame that opens past the edges of the screen (desktop). */}
        <figure className="heritage-frame relative mx-4 mt-16 sm:mx-auto sm:w-[60vw] lg:absolute lg:mx-0 lg:mt-0">
          <div className="relative aspect-[4/5] overflow-hidden lg:aspect-auto lg:size-full">
            <Image src={photo} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
          </div>
          <figcaption className="heritage-cap mt-3 max-w-sm text-xs text-platinum-2 [text-shadow:0_1px_6px_#000,0_0_2px_#000] lg:absolute lg:-bottom-8 lg:left-[14px] lg:mt-0">
            {t.caption}
          </figcaption>
        </figure>

        {/* Two-column text and the line from then to now. */}
        <div className="wrap relative py-16 lg:grid lg:h-full lg:grid-cols-[1fr_1fr] lg:items-center lg:py-0" style={{ opacity: "var(--cols, 1)" }}>
          <div className="max-w-md lg:pr-10" style={{ transform: "translateY(calc((1 - var(--cols, 1)) * 3rem))" }}>
            {/* The page's heading. On desktop "Rooted in Antwerp." is shown large (centred, above) first. */}
            <h1 className="font-display text-[2.75rem] leading-[1.05] sm:text-6xl">
              <span className="block lg:sr-only">{t.rooted}</span>
              <span className="block text-burgundy">{t.since}</span>
            </h1>
            <div className="mt-8 space-y-4 text-lg">
              {t.heritage.map((h) => <p key={h}>{h}</p>)}
            </div>
            <ol className="relative mt-12 space-y-8 border-l border-line pl-6">
              <span aria-hidden className="absolute -left-px top-0 w-px origin-top bg-champagne" style={{ height: "100%", transform: "scaleY(var(--line, 1))" }} />
              {[[t.founded, t.then], [t.now, t.nowPlace]].map(([when, what]) => (
                <li key={when} className="relative">
                  <span aria-hidden className="absolute -left-[1.72rem] top-1.5 size-2 rounded-full bg-champagne" />
                  <p className="font-display text-2xl">{when}</p>
                  <p className="text-sm text-platinum-2">{what}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
