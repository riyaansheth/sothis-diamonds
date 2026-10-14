"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// The visitor's stone in 3D, built as they describe it: the shape sets the cut, the carat its size,
// the colour grade (or a picked colour) its tint. Until they describe it, a white round brilliant.

const Stone3D = dynamic(() => import("./Stone3D"), { ssr: false });

/** Same tints as the colour chips: D reads white, N–Z light yellow; fancy is a deeper yellow. */
function tint(colour: string | undefined, grades: string[]) {
  const i = colour ? grades.indexOf(colour) : -1;
  if (i < 0) return "#ffffff";
  if (i > 10) return "hsl(44, 90%, 62%)";
  return `hsl(48, ${Math.round((i / 10) * 75)}%, ${100 - i * 2.5}%)`;
}

export type StoneSpec = { shape?: string; carat?: string; colour?: string; hue?: string; grades: string[] };

export function StonePreview({ shape, carat, colour, hue, grades, className, zoom = 1 }: StoneSpec & { className?: string; zoom?: number }) {
  const ct = Number.parseFloat((carat ?? "").replace(",", "."));
  // Size grows with the cube root of the weight (its diameter), within the frame; unknown weight shows as about 5 ct.
  const size = ct > 0 ? Math.min(1.12, Math.max(0.7, 0.72 + 0.16 * Math.cbrt(ct))) : 1;

  return (
    <div className={`relative aspect-square ${className ?? ""}`}>
      {/* Shapes it has no model for ("Other", "I don't know") show as a round. */}
      <Stone3D shape={shape || "Round"} color={hue || tint(colour, grades)} size={size * zoom} className="absolute inset-0" />
    </div>
  );
}

// The valuation form announces the stone being described; a stage elsewhere on the page shows it.
const EVENT = "sothis:stone";
type Announced = StoneSpec | null;
let last: Announced = null;

export function announceStone(spec: Announced) {
  last = spec;
  window.dispatchEvent(new CustomEvent<Announced>(EVENT, { detail: spec }));
}

/** The described stone, large, beside the form (sell pages). Nothing while the item isn't a stone. */
export function StoneStage({ unknown }: { unknown: string }) {
  const [spec, setSpec] = useState<Announced>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pick up what the form already announced
    setSpec(last);
    const on = (e: Event) => setSpec((e as CustomEvent<Announced>).detail);
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  if (!spec) return null;
  return (
    // As large as the space left under the text allows (the column is sticky, so it stays in view).
    <figure aria-hidden className="mt-4 w-[min(100%,34rem,calc(100svh-31rem))] min-w-64">
      <StonePreview {...spec} zoom={1.3} className="w-full" />
      <figcaption className="mt-2 min-h-5 text-center text-sm text-platinum-2">{[spec.carat && `${spec.carat} ct`, spec.shape, spec.colour].filter((v) => v && v !== unknown).join(", ")}</figcaption>
    </figure>
  );
}
