"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Diamond3DLazy } from "./Diamond3DLazy";

type Side = { title: string; body: string; cta: string };

/**
 * The homepage opens on the Sell / Buy choice. Buy navigates to the shop. Sell widens its half,
 * reveals the selling journey (server-rendered below, hidden until chosen) and glides into it.
 * The chosen state lives in the URL (#sell), so it can be linked to and "Back" returns to the choice.
 */
export function HomeChoice({ sell, buy, sellAfter, buyInstead, shopHref, children }: {
  sell: Side;
  buy: Side;
  sellAfter: string; // Sell's line once chosen
  buyInstead: [string, string]; // ["Buying instead?", "Explore the collection"]
  shopHref: string;
  children: ReactNode; // the selling journey
}) {
  const [open, setOpen] = useState(false);
  const journey = useRef<HTMLDivElement>(null);

  // Follow the URL: #sell opens the journey (direct links and Forward); anything else shows the choice.
  useEffect(() => {
    const sync = () => setOpen(location.hash === "#sell");
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, []);

  // Once revealed, the sections below have real sizes: let scroll-driven pieces re-measure.
  useEffect(() => {
    if (open) window.dispatchEvent(new Event("resize"));
  }, [open]);

  const choose = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    history.pushState(null, "", "#sell"); // Back returns to the untouched choice
    setOpen(true);
    // Let the Sell half widen first, then glide into the journey and hand focus to its first heading.
    window.setTimeout(
      () => {
        const first = journey.current?.querySelector<HTMLElement>("h2");
        journey.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        first?.setAttribute("tabindex", "-1");
        first?.focus({ preventScroll: true });
      },
      reduce ? 0 : 650,
    );
  };

  const panel = "group relative flex flex-col justify-end overflow-hidden border-line p-8 text-left sm:p-12";

  return (
    <>
      {/* Pulled up under the opening's last (pinned) screen, which fades away to reveal it (desktop). */}
      <section data-open={open ? "" : undefined} className="home-choice relative motion-safe:lg:-mt-[100svh]">
        <div className="paths flex flex-col md:flex-row">
          <button type="button" onClick={choose} aria-expanded={open} aria-controls="sell-journey" className={`${panel} home-sell`} disabled={open}>
            <span aria-hidden className="paths-bg bg-[url(/brand/bg-sell.webp)]" />
            <span aria-hidden className="paths-sheen" />
            <div aria-hidden className="paths-window absolute left-1/2 top-[6%] isolate aspect-square w-[min(30rem,80vw)] -translate-x-1/2 md:top-1/2 md:w-[min(30rem,34vw)] md:-translate-y-[72%]">
              <span className="paths-spotlight pointer-events-none absolute inset-[5%] -z-10 rounded-full" />
              <div className="pointer-events-none absolute inset-x-[22%] bottom-[16%] h-[14%] rounded-full bg-[radial-gradient(closest-side,rgb(81_31_42/0.18),transparent)] blur-md" />
              <Diamond3DLazy cut="round" color="#ffffff" className="pointer-events-none absolute inset-0" />
            </div>
            <span className="relative font-display text-6xl leading-none sm:text-8xl">{sell.title}</span>
            <span className="relative mt-4 grid max-w-sm text-ink/80">
              <span className="home-before col-start-1 row-start-1">{sell.body}</span>
              <span className="home-after col-start-1 row-start-1">{sellAfter}</span>
            </span>
            <span className="home-cta relative mt-8 inline-block self-start border-b border-champagne pb-1 text-sm tracking-[0.04em] text-burgundy">{sell.cta}</span>
          </button>

          <Link href={shopHref} className={`${panel} home-buy md:border-l md:border-l-champagne/60`} tabIndex={open ? -1 : undefined} aria-hidden={open}>
            <span aria-hidden className="paths-bg bg-[url(/brand/bg-buy.webp)]" />
            <span aria-hidden className="paths-sheen" />
            <div aria-hidden className="paths-window absolute left-1/2 top-[6%] isolate aspect-square w-[min(30rem,80vw)] -translate-x-1/2 md:top-1/2 md:w-[min(30rem,34vw)] md:-translate-y-[72%]">
              <span className="paths-spotlight pointer-events-none absolute inset-[5%] -z-10 rounded-full" />
              <div className="pointer-events-none absolute inset-x-[22%] bottom-[16%] h-[14%] rounded-full bg-[radial-gradient(closest-side,rgb(81_31_42/0.18),transparent)] blur-md" />
              <Diamond3DLazy cut="asscher" color="#f5d44a" className="pointer-events-none absolute inset-0" />
            </div>
            <span className="relative font-display text-6xl leading-none sm:text-8xl">{buy.title}</span>
            <span className="relative mt-4 max-w-sm text-ink/80">{buy.body}</span>
            <span className="relative mt-8 inline-block self-start border-b border-champagne pb-1 text-sm tracking-[0.04em] text-burgundy">{buy.cta}</span>
          </Link>
        </div>
        {/* Once Sell is chosen, the band keeps a way back to buying. */}
        {open && (
          <p className="home-instead absolute bottom-6 right-6 z-10 text-sm text-ink/75 sm:bottom-10 sm:right-12">
            {buyInstead[0]}{" "}
            <Link href={shopHref} className="border-b border-champagne pb-0.5 text-burgundy hover:border-burgundy">{buyInstead[1]}</Link>
          </p>
        )}
      </section>

      <div ref={journey} id="sell-journey" className="home-journey scroll-mt-20" data-open={open ? "" : undefined}>
        <div className="min-h-0">{children}</div>
      </div>
    </>
  );
}
