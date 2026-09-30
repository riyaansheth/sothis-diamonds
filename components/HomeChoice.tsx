"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Diamond3DLazy } from "./Diamond3DLazy";

type Side = { title: string; body: string; cta: string; after: string };
type Open = null | "buy" | "sell";

/**
 * The homepage opens on the Buy / Sell choice (Buy left, Sell right). Choosing a side widens its
 * half, collapses the choice into that side's band and reveals its journey (both journeys are
 * server-rendered below and hidden until chosen), then glides into it. In-page state only: every
 * visit starts at the choice; the band switches to the other journey or restores the choice.
 */
export function HomeChoice({ sell, buy, instead, change, buyJourney, sellJourney }: {
  sell: Side;
  buy: Side;
  instead: { buy: [string, string]; sell: [string, string] }; // shown on the Buy band / Sell band
  change: string;
  buyJourney: ReactNode;
  sellJourney: ReactNode;
}) {
  const [open, setOpen] = useState<Open>(null);
  const choice = useRef<HTMLElement>(null);
  const buyRef = useRef<HTMLDivElement>(null);
  const sellRef = useRef<HTMLDivElement>(null);

  // Old links may still carry #sell (it used to hold this state): drop it so a visit starts fresh.
  useEffect(() => {
    if (location.hash === "#sell") history.replaceState(null, "", location.pathname + location.search);
  }, []);

  // Once revealed, the sections below have real sizes: let scroll-driven pieces re-measure.
  useEffect(() => {
    if (open) window.dispatchEvent(new Event("resize"));
  }, [open]);

  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const choose = (side: "buy" | "sell") => {
    const switching = open !== null;
    setOpen(side);
    // Let the half widen first (or the band swap), then glide into the journey and focus its heading.
    window.setTimeout(
      () => {
        const el = (side === "buy" ? buyRef : sellRef).current;
        const first = el?.querySelector<HTMLElement>("h2");
        el?.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "start" });
        first?.setAttribute("tabindex", "-1");
        first?.focus({ preventScroll: true });
      },
      reduce() ? 0 : switching ? 350 : 650,
    );
  };

  const reset = () => {
    setOpen(null);
    requestAnimationFrame(() => choice.current?.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "start" }));
  };

  const panel = "group relative flex flex-col justify-end overflow-hidden border-line p-8 text-left sm:p-12";
  const other = open === "buy" ? "sell" : "buy";

  const half = (side: "buy" | "sell", s: Side, bg: string, stone: { cut: "asscher" | "round"; color: string }) => {
    const hidden = open !== null && open !== side;
    return (
      <button
        type="button"
        onClick={() => choose(side)}
        aria-expanded={open === side}
        aria-controls={`${side}-journey`}
        disabled={open === side}
        tabIndex={hidden ? -1 : undefined}
        aria-hidden={hidden || undefined}
        data-role={open === side ? "chosen" : hidden ? "other" : undefined}
        className={`${panel} home-${side} ${side === "sell" ? "md:border-l md:border-l-champagne/60" : ""}`}
      >
        <span aria-hidden className={`paths-bg ${bg}`} />
        <span aria-hidden className="paths-sheen" />
        <div aria-hidden className="paths-window absolute left-1/2 top-[6%] isolate aspect-square w-[min(30rem,80vw)] -translate-x-1/2 md:top-1/2 md:w-[min(30rem,34vw)] md:-translate-y-[72%]">
          <div className="pointer-events-none absolute inset-x-[22%] bottom-[16%] h-[14%] rounded-full bg-[radial-gradient(closest-side,rgb(0_0_0/0.35),transparent)] blur-md" />
          <Diamond3DLazy cut={stone.cut} color={stone.color} className="pointer-events-none absolute inset-0" />
        </div>
        <span className="relative font-display text-6xl leading-none sm:text-8xl">{s.title}</span>
        <span className="relative mt-4 grid max-w-sm text-ink/80">
          <span className="home-before col-start-1 row-start-1">{s.body}</span>
          <span className="home-after col-start-1 row-start-1">{s.after}</span>
        </span>
        <span className="home-cta relative mt-8 inline-block self-start border-b border-white/70 pb-1 text-sm tracking-[0.04em] text-burgundy">{s.cta}</span>
      </button>
    );
  };

  return (
    <>
      {/* Pulled up under the opening's last (pinned) screen, which fades away to reveal it (desktop). */}
      <section ref={choice} data-open={open ?? undefined} className="home-choice relative motion-safe:lg:-mt-[100svh]">
        <div className="paths flex flex-col md:flex-row">
          {half("buy", buy, "bg-[url(/brand/bg-buy-burgundy.webp)]", { cut: "asscher", color: "#d4b9cb" })}
          {half("sell", sell, "bg-[url(/brand/bg-sell-black.webp)]", { cut: "round", color: "#ffffff" })}
        </div>
        {/* The band keeps a way to the other journey, and back to the choice. */}
        {open && (
          <div key={open} className="home-instead absolute bottom-8 left-8 right-8 z-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink/75 sm:left-12 sm:right-12">
            <p>
              {instead[open][0]}{" "}
              <button type="button" onClick={() => choose(other)} className="border-b border-white/70 pb-0.5 text-burgundy hover:border-burgundy">{instead[open][1]}</button>
            </p>
            <button type="button" onClick={reset} className="flex items-center gap-1.5 text-ink/70 hover:text-burgundy">
              <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current [stroke-width:1.5]" aria-hidden><path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" /></svg>
              {change}
            </button>
          </div>
        )}
      </section>

      <div ref={buyRef} id="buy-journey" className="home-journey" data-open={open === "buy" ? "" : undefined}>
        <div className="min-h-0">{buyJourney}</div>
      </div>
      <div ref={sellRef} id="sell-journey" className="home-journey" data-open={open === "sell" ? "" : undefined}>
        <div className="min-h-0">{sellJourney}</div>
      </div>
    </>
  );
}
