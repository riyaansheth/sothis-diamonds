import Link from "next/link";
import { InView } from "../Motion";
import { OUTLINES } from "@/lib/shapes";


/** The shapes in stock, each as a drawing that draws itself in; links into the filtered shop. */
export function ShapeTiles({ shapes, shopHref, t }: { shapes: [string, number][]; shopHref: string; t: { title: string; line: string; inStock: string } }) {
  return (
    <section className="wrap py-24 lg:py-32" aria-labelledby="buy-shapes-title">
      <h2 id="buy-shapes-title" className="text-4xl sm:text-5xl">{t.title}</h2>
      <p className="mt-4 max-w-xl text-platinum-2">{t.line}</p>
      <InView className="shape-tiles mt-14 grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
        {shapes.map(([shape, n], i) => (
          <Link
            key={shape}
            href={`${shopHref}?shape=${encodeURIComponent(shape)}`}
            className="shape-tile group relative flex aspect-square flex-col items-center justify-center gap-4 bg-ivory p-6 outline-none"
            style={{ ["--i" as string]: i }}
          >
            <span aria-hidden className="shape-corners pointer-events-none absolute inset-3" />
            <svg viewBox="-50 -50 100 100" className="shape-draw size-20 overflow-visible sm:size-24" aria-hidden>
              <g fill="none" stroke="currentColor" strokeLinejoin="round">
                <path d={OUTLINES[shape] ?? OUTLINES.Round} pathLength={1} strokeWidth="1.2" />
                <path d={OUTLINES[shape] ?? OUTLINES.Round} pathLength={1} strokeWidth="1.4" transform="scale(0.72)" className="shape-inner" />
                <path d={OUTLINES[shape] ?? OUTLINES.Round} pathLength={1} strokeWidth="1.8" transform="scale(0.42)" className="shape-inner" />
              </g>
            </svg>
            <span className="shape-label text-center">
              <span className="block font-display text-xl">{shape}</span>
              <span className="mt-1 block text-xs text-platinum-2">{t.inStock.replace("{n}", String(n))}</span>
            </span>
          </Link>
        ))}
      </InView>
    </section>
  );
}
