"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { light, startLight } from "@/lib/light";
import { Diamond3DLazy } from "./Diamond3DLazy";

type Side = { title: string; body: string; cta: string; after: string; href: string };

/**
 * The homepage opens on the Buy from us / Sell to us choice (buy left, sell right); each side is a link
 * to its own page. On a plain click the chosen half widens and collapses into a band first, the same
 * band its page opens with, so the page change reads as one movement.
 */
export function HomeChoice({ sell, buy }: { sell: Side; buy: Side }) {
  const [open, setOpen] = useState<null | "buy" | "sell">(null);
  const choice = useRef<HTMLElement>(null);
  const router = useRouter();

  // A soft glow on the silk that follows the light (cursor or tilt), eased, only while the split is on screen.
  useEffect(() => {
    const section = choice.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    startLight();
    const halves = [...section.querySelectorAll<HTMLElement>(".paths > a")];
    const at = { x: innerWidth / 2, y: innerHeight * 0.35 };
    let raf = 0;
    const frame = () => {
      at.x += ((light.x + 1) / 2 * innerWidth - at.x) * 0.06;
      at.y += ((light.y + 1) / 2 * innerHeight - at.y) * 0.06;
      for (const h of halves) {
        const r = h.getBoundingClientRect();
        h.style.setProperty("--gx", `${(at.x - r.left).toFixed(0)}px`);
        h.style.setProperty("--gy", `${(at.y - r.top).toFixed(0)}px`);
      }
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (e.isIntersecting) raf = requestAnimationFrame(frame);
    });
    io.observe(section);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const choose = (side: "buy" | "sell", href: string) => (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; // new tab etc.: plain link
    e.preventDefault();
    if (open) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return router.push(href);
    setOpen(side);
    window.setTimeout(() => router.push(href), 700);
  };

  const panel = "group relative flex flex-col justify-end overflow-hidden border-line p-8 text-left sm:p-12";

  const half = (side: "buy" | "sell", s: Side, bg: string, stone: { cut: "asscher" | "round"; color: string }) => {
    const hidden = open !== null && open !== side;
    return (
      <Link
        href={s.href}
        onClick={choose(side, s.href)}
        aria-hidden={hidden || undefined}
        tabIndex={hidden ? -1 : undefined}
        data-role={open === side ? "chosen" : hidden ? "other" : undefined}
        className={`${panel} home-${side}`}
      >
        <span aria-hidden className={`paths-bg ${bg}`} />
        <span aria-hidden className="paths-sheen" />
        <span aria-hidden className="paths-glow" />
        {/* Clicking the stone just spins it; only the rest of the half opens the page. */}
        <div aria-hidden onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="paths-window absolute left-1/2 top-[6%] isolate aspect-square w-[min(30rem,80vw)] -translate-x-1/2 md:top-1/2 md:w-[min(30rem,34vw)] md:-translate-y-[72%]">
          <div className="pointer-events-none absolute inset-x-[22%] bottom-[16%] h-[14%] rounded-full bg-[radial-gradient(closest-side,rgb(0_0_0/0.35),transparent)] blur-md" />
          <Diamond3DLazy cut={stone.cut} color={stone.color} className="absolute inset-[12%]" />
        </div>
        <span className="relative font-display text-[clamp(3rem,7.5vw,6rem)] leading-none whitespace-nowrap">{s.title}</span>
        <span className="relative mt-4 grid max-w-sm text-ink/80">
          <span className="home-before col-start-1 row-start-1">{s.body}</span>
          <span className="home-after col-start-1 row-start-1">{s.after}</span>
        </span>
        <span className="home-cta relative mt-8 inline-block self-start border-b border-white/70 pb-1 text-sm tracking-[0.04em] text-burgundy">{s.cta}</span>
      </Link>
    );
  };

  return (
    // Sits under the opening (a fixed layer with JS), which dissolves to reveal it in place.
    <section ref={choice} data-open={open ?? undefined} className="home-choice relative">
      <div className="paths flex flex-col md:flex-row">
        {half("buy", buy, "bg-[url(/brand/bg-buy-burgundy.webp)]", { cut: "asscher", color: "#ffffff" })}
        {half("sell", sell, "bg-[url(/brand/bg-sell-black.webp)]", { cut: "round", color: "#ffffff" })}
      </div>
    </section>
  );
}
