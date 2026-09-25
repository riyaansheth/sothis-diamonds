"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { Price } from "./Store";

export type ChoirStone = {
  id: number;
  href: string;
  name: string;
  details: string;
  priceUsd: number | null;
  image: string;
  /** Where the stone sits in its photo: centre and diameter (or side) as fractions of the image width. */
  crop: { cx: number; cy: number; d: number };
  shape: "round" | "square" | "heart";
  /** Real diameter in millimetres, so the row shows the stones to scale. */
  mm: number;
};

/**
 * Four loose stones floating in a row, sized to their real diameters.
 * Hover or focus lifts one stone, dims the rest and shows its details in the caption.
 */
export function StoneChoir({ stones, intro }: { stones: ChoirStone[]; intro: string }) {
  const [active, setActive] = useState<number | null>(null);
  const current = stones.find((s) => s.id === active);

  return (
    <div className="flex flex-col items-center">
      <ul data-loupe className="choir flex items-center justify-center gap-[clamp(0.75rem,3.5vw,4rem)]" onMouseLeave={() => setActive(null)}>
        {stones.map((s, i) => (
          <li key={s.id} className="choir-rise" style={{ "--i": i } as CSSProperties}>
            <Link
              href={s.href}
              aria-label={`${s.name}, ${s.details}`}
              onMouseEnter={() => setActive(s.id)}
              onFocus={() => setActive(s.id)}
              onBlur={() => setActive(null)}
              data-state={active === null ? "idle" : active === s.id ? "on" : "off"}
              className="choir-stone group relative block rounded-full"
              style={{ "--mm": s.mm, "--i": i } as CSSProperties}
            >
              <span className="choir-glow" aria-hidden />
              <span className="choir-float">
                <StoneCutout stone={s} />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p aria-live="polite" className="mt-10 flex min-h-14 flex-col items-center text-center text-sm text-platinum-2 sm:mt-14">
        {current ? (
          <>
            <span className="font-display text-xl text-ink">{current.name}</span>
            <span>
              {current.details}
              {current.priceUsd ? <span className="text-burgundy"> {" "}<Price usd={current.priceUsd} /></span> : null}
            </span>
          </>
        ) : (
          <span className="choir-intro">{intro}</span>
        )}
      </p>
    </div>
  );
}

/** Crops the stone out of its product photo; a soft mask fades the photo's backdrop into the page. */
function StoneCutout({ stone }: { stone: ChoirStone }) {
  const { cx, cy, d } = stone.crop;
  const pad = stone.shape === "square" ? 1.06 : 1.04; // box around the stone, as a multiple of its size
  const photo = 1 / (pad * d); // photo width relative to the box
  return (
    <span className={`choir-cut relative block overflow-hidden mask-${stone.shape}`} style={{ "--pad": pad } as CSSProperties}>
      <Image
        src={stone.image}
        alt=""
        width={1024}
        height={1024}
        sizes="(min-width: 1024px) 30vw, 40vw"
        priority
        className="absolute max-w-none"
        style={{ width: `${photo * 100}%`, left: `${(0.5 - cx * photo) * 100}%`, top: `${(0.5 - cy * photo) * 100}%` }}
      />
    </span>
  );
}
