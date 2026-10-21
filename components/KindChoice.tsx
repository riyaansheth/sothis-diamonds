"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Diamond3DLazy, Ring3DLazy } from "./Diamond3DLazy";
import type { Side } from "./HomeChoice";

type Half = Omit<Side, "piece" | "after">;

/**
 * /diamonds/ and /jewellery/. The page arrives as the homepage half that was chosen (its silk full screen,
 * its piece in the middle), then that half settles into a band naming the choice, Buy | Sell opens
 * beneath it, and the piece glides down onto their seam: you are now inside Diamonds (or Jewellery).
 * Choosing a half widens it and the journey page opens on its band.
 */
export function KindChoice({ band, piece, sides }: {
  band: { title: string; body: string; silk: "buy" | "sell"; instead: string; insteadLabel: string; insteadHref: string };
  piece: Side["piece"];
  sides: [Half, Half];
}) {
  const [open, setOpen] = useState<null | 0 | 1>(null);
  const router = useRouter();

  const choose = (side: 0 | 1, href: string) => (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; // new tab etc.: plain link
    e.preventDefault();
    if (open !== null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return router.push(href);
    setOpen(side);
    window.setTimeout(() => router.push(href), 650);
  };
  const silk = (s: "buy" | "sell") => (s === "buy" ? "bg-[url(/brand/bg-buy-burgundy.webp)]" : "bg-[url(/brand/bg-sell-black.webp)]");

  return (
    <section data-open={open ?? undefined} className="kind-choice">
      <div className="kind-band relative isolate flex flex-col justify-end overflow-hidden px-8 pb-8 sm:px-12 sm:pb-10">
        <span aria-hidden className={`paths-bg ${silk(band.silk)}`} />
        <h1 className="relative font-display text-[clamp(3rem,7.5vw,6rem)] leading-none">{band.title}</h1>
        <p className="relative mt-3 text-ink/80">{band.body}</p>
        <p className="kind-instead absolute right-8 bottom-8 hidden text-sm text-ink/75 sm:right-12 sm:bottom-10 md:block">
          {band.instead}{" "}
          <Link href={band.insteadHref} className="border-b border-white/70 pb-0.5 hover:border-ink">{band.insteadLabel}</Link>
        </p>
      </div>

      <div className="paths flex min-h-0 flex-1 flex-col md:flex-row">
        {sides.map((s, i) => {
          const side = i as 0 | 1;
          const hidden = open !== null && open !== side;
          return (
            <Link
              key={s.href}
              href={s.href}
              onClick={choose(side, s.href)}
              aria-hidden={hidden || undefined}
              tabIndex={hidden ? -1 : undefined}
              data-role={open === side ? "chosen" : hidden ? "other" : undefined}
              // Buy reads from the left edge, Sell from the right: the seam stays clear for the piece.
              className={`kind-half group relative flex flex-col justify-end overflow-hidden p-8 sm:p-12 ${side ? "md:items-end md:text-right" : ""}`}
            >
              <span aria-hidden className={`paths-bg ${silk(s.silk)}`} />
              <span aria-hidden className="paths-sheen" />
              <span className="relative font-display text-[clamp(2.5rem,4.6vw,4.75rem)] leading-none whitespace-nowrap">{s.title}</span>
              <span className="relative mt-4 max-w-sm text-ink/80">{s.body}</span>
              <span className={`relative mt-8 inline-block border-b border-white/70 pb-1 text-sm tracking-[0.04em] ${side ? "self-start md:self-end" : "self-start"}`}>{s.cta}</span>
            </Link>
          );
        })}
      </div>

      {/* The piece, on the seam between Buy and Sell. Clicking it just spins it. */}
      <div aria-hidden onClick={(e) => e.stopPropagation()} className="kind-piece">
        <div className="pointer-events-none absolute inset-x-[22%] bottom-[16%] h-[14%] rounded-full bg-[radial-gradient(closest-side,rgb(0_0_0/0.35),transparent)] blur-md" />
        {"ring" in piece ? <Ring3DLazy stone={piece.ring} className="absolute inset-[6%]" /> : <Diamond3DLazy cut={piece.cut} color={piece.color} className="absolute inset-[12%]" />}
      </div>
    </section>
  );
}
