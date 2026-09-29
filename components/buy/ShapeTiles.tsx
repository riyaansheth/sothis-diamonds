import Link from "next/link";
import { InView } from "../Motion";

// Face-up outlines of each cut, in a -50..50 box. Drawn three times (girdle, crown, table) as a
// fine technical drawing, like the About page's anatomy drawing.
const oct = (w: number, h: number, c: number) => `M${-w + c},${-h}H${w - c}L${w},${-h + c}V${h - c}L${w - c},${h}H${-w + c}L${-w},${h - c}V${-h + c}Z`;
const OUTLINES: Record<string, string> = {
  Round: "M0,-40A40,40 0 1 1 0,40A40,40 0 1 1 0,-40Z",
  Oval: "M0,-44A30,44 0 1 1 0,44A30,44 0 1 1 0,-44Z",
  Pear: "M0,-44C22,-16 32,6 30,22A30,22 0 0 1 -30,22C-32,6 -22,-16 0,-44Z",
  Cushion: "M-26,-38H26Q38,-38 38,-26V26Q38,38 26,38H-26Q-38,38 -38,26V-26Q-38,-38 -26,-38Z",
  Emerald: oct(28, 42, 10),
  Radiant: oct(32, 40, 11),
  Asscher: oct(38, 38, 15),
  Princess: "M-38,-38H38V38H-38Z",
  Heart: "M0,40C-24,22 -40,6 -40,-12C-40,-30 -20,-40 0,-24C20,-40 40,-30 40,-12C40,6 24,22 0,40Z",
};

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
