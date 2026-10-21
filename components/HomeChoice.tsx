"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { light, startLight } from "@/lib/light";
import { PieceSlot } from "./PieceLayer";

/** One half: its silk (burgundy "buy" or black "sell") and what floats over it (a stone, or the ring). */
export type Side = {
  title: string;
  body: string;
  cta: string;
  after?: string;
  href: string;
  silk: "buy" | "sell";
  piece: { cut: "asscher" | "round"; color: string } | { ring: string };
};

/**
 * The homepage choice, Diamond | Jewellery, each half a link to its own page. On a plain click the chosen
 * half widens to the whole screen, which is exactly how its page (KindChoice) begins, before settling.
 */
export function HomeChoice({ sides }: { sides: [Side, Side] }) {
  const [open, setOpen] = useState<null | 0 | 1>(null);
  const choice = useRef<HTMLElement>(null);
  const router = useRouter();

  // A soft glow on the silk that follows the light (cursor or tilt), eased, only while the split is on screen.
  useEffect(() => {
    const section = choice.current;
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    startLight();
    const halves = [...section.querySelectorAll<HTMLElement>(".paths > a")].map((h) => ({ h, glow: h.querySelector<HTMLElement>(".paths-glow")! }));
    const at = { x: innerWidth / 2, y: innerHeight * 0.35 };
    let raf = 0;
    const frame = () => {
      at.x += ((light.x + 1) / 2 * innerWidth - at.x) * 0.06;
      at.y += ((light.y + 1) / 2 * innerHeight - at.y) * 0.06;
      const rects = halves.map(({ h }) => h.getBoundingClientRect()); // all reads, then all writes
      halves.forEach(({ glow }, i) => {
        glow.style.transform = `translate(${(at.x - rects[i].left).toFixed(0)}px, ${(at.y - rects[i].top).toFixed(0)}px)`;
      });
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

  const choose = (side: 0 | 1, href: string) => (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; // new tab etc.: plain link
    e.preventDefault();
    if (open !== null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return router.push(href);
    setOpen(side);
    window.setTimeout(() => router.push(href), 900); // once the widening (0.9 s) has finished: the next page starts from that frame
  };

  const panel = "group relative flex flex-col justify-end overflow-hidden border-line p-8 text-left sm:p-12";

  const half = (side: 0 | 1) => {
    const s = sides[side];
    const hidden = open !== null && open !== side;
    return (
      <Link
        href={s.href}
        onClick={choose(side, s.href)}
        aria-hidden={hidden || undefined}
        tabIndex={hidden ? -1 : undefined}
        data-role={open === side ? "chosen" : hidden ? "other" : undefined}
        className={`${panel} home-${s.silk}`}
      >
        <span aria-hidden className={`paths-bg ${s.silk === "buy" ? "bg-[url(/brand/bg-buy-burgundy.webp)]" : "bg-[url(/brand/bg-sell-black.webp)]"}`} />
        <span aria-hidden className="paths-sheen" />
        <span aria-hidden className="paths-glow" />
        {/* The piece itself is drawn by PieceLayer over this slot, so it carries on to the next page. */}
        <div aria-hidden className="paths-window absolute left-1/2 top-[6%] isolate aspect-square w-[min(30rem,80vw)] -translate-x-1/2 md:top-1/2 md:w-[min(30rem,34vw)] md:-translate-y-[72%]">
          <div className="pointer-events-none absolute inset-x-[22%] bottom-[16%] h-[14%] rounded-full bg-[radial-gradient(closest-side,rgb(0_0_0/0.35),transparent)] blur-md" />
          <PieceSlot piece={s.piece} className={"ring" in s.piece ? "absolute inset-[6%]" : "absolute inset-[12%]"} />
        </div>
        <span className="relative font-display text-[clamp(3rem,7.5vw,6rem)] leading-none whitespace-nowrap">{s.title}</span>
        <span className="relative mt-4 grid max-w-sm text-ink/80">
          <span className={s.after ? "home-before col-start-1 row-start-1" : "col-start-1 row-start-1"}>{s.body}</span>
          {s.after && <span className="home-after col-start-1 row-start-1">{s.after}</span>}
        </span>
        <span className="home-cta relative mt-8 inline-block self-start border-b border-white/70 pb-1 text-sm tracking-[0.04em] text-burgundy">{s.cta}</span>
      </Link>
    );
  };

  return (
    // Sits under the opening (a fixed layer with JS), which dissolves to reveal it in place.
    <section ref={choice} data-open={open ?? undefined} className="home-choice relative">
      <div className="paths flex flex-col md:flex-row">
        {half(0)}
        {half(1)}
      </div>
    </section>
  );
}
