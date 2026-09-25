"use client";

import Image from "next/image";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { clamp01, ease, setVars, useScrub } from "./useScrub";

export type JourneyMedia = {
  submit: string; // a ring photographed on white
  stone: string; // optimised studio photo of the stone (also used by the lens)
  boxed: string; // a ring in its presentation box
  cutout: string;
  doc: [string, string][]; // [label, value] rows for the valuation document
};
type T = { title: string; stage: string; stages: string[][]; photoAdded: string; document: string; documentOffer: string; documentNote: string; confidence: string; diameter: string; table: string; measure: string; tablePct: string };

/** CSS progress for a window [a, b] of the stage's local progress --q (0..1). */
const w = (a: number, b: number) => `clamp(0, (var(--q, 1) - ${a}) / ${b - a}, 1)`;

function Frame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`relative size-full overflow-hidden ${className}`}>{children}</div>;
}

/** Each stage's picture. Everything is driven by --q, so a static --q: 1 shows its final frame. */
function Visual({ i, m, t }: { i: number; m: JourneyMedia; t: T }) {
  switch (i) {
    case 0: // Submit: the viewfinder closes in, the shutter fires, the shot becomes a submitted photo.
      return (
        <Frame className="bg-[#e7e0d5]">
          <div className="absolute inset-0" style={{ transform: `scale(calc(1 - 0.38 * ${w(0.58, 0.9)}))` }}>
            <div className="absolute inset-0 bg-[#f3efe8] shadow-[0_30px_60px_-30px_rgb(36_21_25/0.45)]" style={{ opacity: w(0.58, 0.9) }} />
            <div className="absolute inset-[12%]">
              <Image src={m.submit} alt="" fill sizes="40vw" className="object-contain mix-blend-multiply" />
            </div>
            <div className="absolute inset-[16%]" style={{ transform: `scale(calc(1.35 - 0.35 * ${w(0.05, 0.38)}))`, opacity: `calc(${w(0.05, 0.3)} * (1 - ${w(0.58, 0.72)}))` }}>
              {["left-0 top-0 border-l border-t", "right-0 top-0 border-r border-t", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map((c) => (
                <span key={c} className={`absolute size-10 border-ink/70 ${c}`} />
              ))}
            </div>
            <div className="absolute inset-0 bg-white" style={{ opacity: "clamp(0, min(1 - (var(--q, 1) - 0.5) * 14, 1 + (var(--q, 1) - 0.5) * 14), 0.9)" }} />
          </div>
          <p className="absolute bottom-[8%] left-1/2 -translate-x-1/2 text-sm text-platinum-2" style={{ opacity: w(0.8, 0.95) }}>{t.photoAdded}</p>
        </Frame>
      );
    case 1: // Expert review: a lens travels across the facets, magnifying exactly what it covers.
      return (
        <Frame className="bg-ivory-deep">
          {/* eslint-disable-next-line @next/next/no-img-element -- mapped exactly by the lens below */}
          <img src={m.stone} alt="" className="absolute inset-0 size-full object-cover" />
          <div
            className="absolute aspect-square w-[42%] rounded-full shadow-[0_18px_40px_-16px_rgb(36_21_25/0.55)] ring-1 ring-champagne"
            style={{
              left: `calc((0.37 + 0.26 * ${w(0, 1)} - 0.21) * 100%)`,
              top: `calc((0.41 + 0.13 * ${w(0, 1)} - 0.21) * 100%)`,
              backgroundImage: `url("${m.stone}")`,
              backgroundSize: `${(2.4 / 0.42) * 100}%`,
              backgroundPosition: `calc(((0.37 + 0.26 * ${w(0, 1)}) * 2.4 - 0.21) / 1.98 * 100%) calc(((0.41 + 0.13 * ${w(0, 1)}) * 2.4 - 0.21) / 1.98 * 100%)`,
            }}
          />
        </Frame>
      );
    case 2: // Offer: the inspection notes resolve into a clean document. No figures are invented.
      return (
        <Frame className="grid place-items-center bg-ivory-deep">
          <div className="relative w-[78%] max-w-md p-8" style={{ backgroundColor: `rgb(247 242 234 / calc(${w(0.15, 0.6)}))`, boxShadow: `0 30px 60px -30px rgb(36 21 25 / calc(0.4 * ${w(0.15, 0.6)}))` }}>
            <p className="font-display text-2xl" style={{ opacity: w(0.35, 0.6) }}>{t.document}</p>
            <dl className="mt-6 space-y-3 text-sm">
              {m.doc.map(([k, v], n) => {
                const dx = [-60, 70, -40, 55][n % 4];
                const dy = [-40, -20, 30, 50][n % 4];
                return (
                  <div key={k} className="flex justify-between gap-6 border-b border-line pb-2" style={{ transform: `translate(calc(${dx}px * (1 - ${w(0, 0.55)})), calc(${dy}px * (1 - ${w(0, 0.55)})))` }}>
                    <dt className="text-platinum-2">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                );
              })}
              <div className="flex items-center justify-between gap-6 pt-3" style={{ opacity: w(0.55, 0.85) }}>
                <dt className="text-platinum-2">{t.documentOffer}</dt>
                <dd aria-hidden className="h-4 w-28 rounded-sm bg-ink/15 blur-[2px]" />
              </div>
            </dl>
            <p className="mt-5 text-xs text-burgundy" style={{ opacity: w(0.6, 0.9) }}>{t.documentNote}</p>
          </div>
        </Frame>
      );
    case 3: // Accept and send: the piece in its box, the camera settling in as the light passes.
      return (
        <Frame>
          <div className="absolute inset-0" style={{ transform: `scale(calc(1.2 - 0.2 * ${w(0, 1)}))` }}>
            <Image src={m.boxed} alt="" fill sizes="50vw" className="object-cover" />
          </div>
          <span className="absolute inset-0 bg-[linear-gradient(100deg,transparent_35%,rgb(255_244_220/0.35)_50%,transparent_65%)]" style={{ transform: `translateX(calc((${w(0.2, 0.8)} * 2.2 - 1.1) * 100%))` }} />
        </Frame>
      );
    case 4: // Inspection: a slow macro pass across the stone while measurements are drawn.
      return (
        <Frame className="bg-ink">
          <div className="absolute inset-0" style={{ transform: `scale(2.3) translate(calc((0.5 - ${w(0, 1)}) * 14%), calc((${w(0, 1)} - 0.5) * 6%))` }}>
            <Image src={m.stone} alt="" fill sizes="60vw" className="object-cover" unoptimized />
          </div>
          <svg viewBox="0 0 100 125" className="absolute inset-0 size-full" aria-hidden>
            <g fill="none" stroke="var(--color-champagne)" strokeWidth="0.35">
              <path d="M14,104H86M14,101v6M86,101v6" pathLength={1} strokeDasharray="1" style={{ strokeDashoffset: `calc(1 - ${w(0.15, 0.5)})` }} />
              <path d="M30,20H70M30,17v6M70,17v6" pathLength={1} strokeDasharray="1" style={{ strokeDashoffset: `calc(1 - ${w(0.45, 0.8)})` }} />
            </g>
          </svg>
          <p className="absolute bottom-[10%] left-1/2 -translate-x-1/2 whitespace-nowrap bg-ivory/90 px-2 py-0.5 text-xs text-ink" style={{ opacity: w(0.35, 0.55) }}>{t.measure}</p>
          <p className="absolute left-1/2 top-[10%] -translate-x-1/2 whitespace-nowrap bg-ivory/90 px-2 py-0.5 text-xs text-ink" style={{ opacity: w(0.65, 0.85) }}>{t.tablePct}</p>
        </Frame>
      );
    default: // Payment: a quiet close.
      return (
        <Frame className="grid place-items-center bg-ivory">
          <div className="relative aspect-square w-[46%]" style={{ opacity: w(0, 0.4), transform: `scale(calc(0.9 + 0.1 * ${w(0, 0.6)}))` }}>
            <Image src={m.cutout} alt="" fill sizes="25vw" className="object-contain" />
          </div>
          <p className="absolute bottom-[10%] px-6 text-center font-display text-3xl sm:text-4xl" style={{ opacity: w(0.35, 0.7), transform: `translateY(calc((1 - ${w(0.35, 0.7)}) * 1rem))` }}>{t.confidence}</p>
        </Frame>
      );
  }
}

/**
 * Chapter 05. Desktop: pinned; scrolling plays six stages one at a time, each with its own motion,
 * and releases the page when the last completes (scrolling back reverses it). Mobile and reduced
 * motion: a vertical sequence showing each stage's final frame.
 */
export function Journey({ media, t }: { media: JourneyMedia; t: T }) {
  const root = useRef<HTMLElement>(null);
  const stages = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const last = useRef(0);

  useScrub(root, (p, pinned) => {
    if (!pinned) return;
    const x = p * 6;
    stages.current.forEach((el, i) => {
      if (!el) return;
      const inW = i === 0 ? 1 : clamp01((x - i + 0.1) / 0.2);
      const outW = i === 5 ? 1 : clamp01((i + 1 + 0.1 - x) / 0.2);
      setVars(el, { "--q": ease(clamp01((x - i) / 0.92)), "--v": Math.min(inW, outW) });
    });
    setVars(root.current, { "--jp": p });
    const now = Math.min(5, Math.floor(x));
    if (now !== last.current) setActive((last.current = now));
  });

  const label = (i: number) => t.stage.replace("{n}", String(i + 1));

  return (
    <section ref={root} className="journey relative bg-ivory motion-safe:lg:h-[640vh]" aria-labelledby="journey-title">
      {/* Desktop: the pinned filmstrip. */}
      <div className="sticky top-20 hidden h-[calc(100vh-5rem)] overflow-hidden motion-safe:lg:block">
        <div className="wrap grid h-full grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] items-center gap-16">
          <div className="relative aspect-[4/5] max-h-[78vh] w-full">
            {t.stages.map((_, i) => (
              <div
                key={i}
                ref={(el) => {
                  stages.current[i] = el;
                }}
                className="absolute inset-0"
                style={{ opacity: "var(--v, 0)" }}
              >
                <Visual i={i} m={media} t={t} />
              </div>
            ))}
          </div>

          <div className="relative">
            <h2 id="journey-title" className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-platinum-2">{t.title}</h2>
            <div className="relative mt-8 min-h-[20rem]">
              {t.stages.map(([title, body], i) => (
                <div key={title} aria-hidden={active !== i} data-on={active === i ? "" : undefined} className="journey-copy absolute inset-x-0 top-0">
                  <p className="font-display text-7xl text-champagne">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-4 text-4xl">{title}</h3>
                  <p className="mt-4 max-w-sm text-lg text-platinum-2">{body}</p>
                </div>
              ))}
            </div>
            {/* Progress: the inspection marker from the drawing, now counting the stages. */}
            <div className="mt-10 flex items-center gap-5">
              <svg viewBox="0 0 40 40" className="size-14 -rotate-90" aria-hidden>
                <circle cx="20" cy="20" r="17" fill="none" stroke="var(--color-line)" strokeWidth="1" />
                <circle cx="20" cy="20" r="17" fill="none" stroke="var(--color-champagne)" strokeWidth="2" pathLength={1} strokeDasharray="1" style={{ strokeDashoffset: "calc(1 - var(--jp, 0))" }} />
              </svg>
              <p className="text-sm text-platinum-2" aria-live="polite">{label(active)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile and reduced motion: the same six stages, one after another. */}
      <div className="wrap py-24 motion-safe:lg:hidden">
        <h2 className="font-sans text-sm font-semibold uppercase tracking-[0.14em] text-platinum-2">{t.title}</h2>
        <ol className="mt-10 space-y-16">
          {t.stages.map(([title, body], i) => (
            <li key={title} className="grid gap-6 sm:grid-cols-2 sm:items-center sm:gap-10">
              <div className="relative aspect-[4/5]" style={{ "--q": 1 } as CSSProperties}>
                <Visual i={i} m={media} t={t} />
              </div>
              <div>
                <p className="font-display text-5xl text-champagne">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 text-3xl">{title}</h3>
                <p className="mt-3 text-platinum-2">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
