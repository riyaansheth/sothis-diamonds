"use client";

import Image from "next/image";
import { useRef } from "react";
import { seg, setVars, useScrub } from "./useScrub";

export type StoneFacts = {
  table: number; // % of diameter
  crown: number; // % of diameter
  crownAngle: number;
  pavilion: number; // % of diameter
  pavilionAngle: number;
  depth: number; // % of diameter
  diameter: string; // "11.94 – 12.09 mm"
};

const rad = (deg: number) => (deg * Math.PI) / 180;
const pt = (a: number, r: number) => `${(Math.cos(rad(a)) * r).toFixed(2)},${(Math.sin(rad(a)) * r).toFixed(2)}`;

/** Face-up line drawing of a round brilliant: girdle, table octagon, stars, bezels, upper girdles. */
function topView(table: number) {
  const tableR = table / Math.cos(rad(22.5)); // table vertex radius (girdle radius = 100)
  const starR = table + (100 - table) * 0.45;
  const d: string[] = [];
  const oct = Array.from({ length: 8 }, (_, k) => pt(22.5 + k * 45, tableR));
  d.push(`M${oct.join("L")}Z`);
  for (let k = 0; k < 8; k++) {
    const star = pt(k * 45, starR);
    d.push(`M${pt(k * 45 - 22.5, tableR)}L${star}L${pt(k * 45 + 22.5, tableR)}`); // star facet
    d.push(`M${pt(k * 45 - 22.5, 100)}L${star}L${pt(k * 45 + 22.5, 100)}`); // bezel sides
    d.push(`M${star}L${pt(k * 45, 100)}`); // upper girdle split
  }
  return d.join("");
}

/** Side profile from the report's proportions (girdle diameter = 200 units). */
function profile(f: StoneFacts) {
  const t = f.table;
  const c = f.crown * 2;
  const pv = f.pavilion * 2;
  const g = Math.max(2, (f.depth - f.crown - f.pavilion) * 2);
  const outline = `M${-t},${-c}L${t},${-c}L100,0L100,${g}L0,${g + pv}L-100,${g}L-100,0Z`;
  const facets = [
    `M${-t},${-c}L-78,0M${t},${-c}L78,0M${-t * 0.35},${-c}L-44,0M${t * 0.35},${-c}L44,0`,
    `M0,${g + pv}L-58,${g}M0,${g + pv}L58,${g}M0,${g + pv}L-22,${g}M0,${g + pv}L22,${g}`,
    `M-100,0L100,0`,
  ].join("");
  return { outline, facets, c, g, pv, t };
}

export function Anatomy({ cutout, facts, values, t }: {
  cutout: string;
  facts: StoneFacts;
  values: string[]; // shown next to each factor, same order as t.factors
  t: { title: string; body: string; factors: string[][]; table: string; crown: string; pavilion: string; depth: string; diameter: string };
}) {
  const root = useRef<HTMLElement>(null);
  const pr = profile(facts);
  const fmt = (n: number) => n.toFixed(1);

  useScrub(root, (p, pinned) => {
    if (!pinned) {
      setVars(root.current, { "--photo": 0, "--draw": 1, "--rot": 0, "--top": 0, "--prof": 1, "--dims": 1, "--end": 0, ...Object.fromEntries(t.factors.map((_, i) => [`--f${i}`, 1])) });
      return;
    }
    setVars(root.current, {
      "--draw": seg(p, 0.04, 0.3), // lines trace the facets over the photo
      "--photo": 1 - seg(p, 0.2, 0.38), // the photograph gives way to the drawing
      "--rot": seg(p, 0, 0.46) * 30, // the stone turns slowly
      "--top": 1 - seg(p, 0.42, 0.56), // face-up view tips over...
      "--prof": seg(p, 0.5, 0.64), // ...into the side profile
      "--dims": seg(p, 0.62, 0.8),
      "--end": seg(p, 0.9, 1), // the drawing contracts to the marker that starts the journey
      ...Object.fromEntries(t.factors.map((_, i) => [`--f${i}`, seg(p, 0.3 + i * 0.075, 0.38 + i * 0.075)])),
    });
  });

  return (
    <section ref={root} className="anatomy relative overflow-x-clip bg-ivory motion-safe:lg:h-[340vh]" aria-labelledby="anatomy-title">
      <div className="relative motion-safe:lg:sticky motion-safe:lg:top-20 lg:h-[calc(100vh-5rem)] lg:overflow-hidden">
        <span aria-hidden className="anatomy-grid pointer-events-none absolute inset-0" />
        <div className="wrap relative grid gap-12 py-24 lg:h-full lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)_minmax(0,19rem)] lg:items-center lg:gap-10 lg:py-0">
          <div>
            <h2 id="anatomy-title" className="text-[2.75rem] leading-[1.05] sm:text-6xl">{t.title}</h2>
            <p className="mt-6 text-lg text-platinum-2">{t.body}</p>
          </div>

          {/* The drawing */}
          <div className="relative mx-auto aspect-square w-full max-w-[34rem]" style={{ transform: "translateY(calc(var(--end, 0) * 30vh)) scale(calc(1 - var(--end, 0) * 0.86))", opacity: "calc(1 - var(--end, 0) * 0.9)" }}>
            {/* Face-up: photo and line drawing, turning together, then tipping edge-on. */}
            <div className="absolute inset-0" style={{ transform: "scaleY(calc(0.06 + var(--top, 1) * 0.94)) rotate(calc(var(--rot, 0) * 1deg))", opacity: "var(--top, 1)" }}>
              <div className="absolute -inset-[22.2%]" style={{ opacity: "var(--photo, 1)" }}>
                <Image src={cutout} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain" />
              </div>
              <svg viewBox="-110 -110 220 220" className="absolute inset-0 size-full overflow-visible" aria-hidden>
                <g fill="none" stroke="var(--color-ink)" strokeWidth="0.45" strokeLinejoin="round">
                  <circle r="100" pathLength={1} className="anatomy-draw" />
                  <path d={topView(facts.table)} pathLength={1} className="anatomy-draw" />
                </g>
              </svg>
            </div>

            {/* Edge-on: the profile, with its real proportions and dimensions. */}
            <svg
              viewBox="-160 -80 320 230"
              className="absolute inset-0 size-full overflow-visible"
              style={{ transform: "scaleY(calc(0.06 + var(--prof, 0) * 0.94))", opacity: "var(--prof, 0)" }}
              role="img"
              aria-label={`${t.table} ${fmt(facts.table)}%, ${t.crown} ${fmt(facts.crownAngle)}°, ${t.pavilion} ${fmt(facts.pavilionAngle)}°, ${t.depth} ${fmt(facts.depth)}%, ${t.diameter} ${facts.diameter}`}
            >
              <g fill="none" stroke="var(--color-ink)" strokeLinejoin="round">
                <path d={pr.outline} strokeWidth="0.7" />
                <path d={pr.facets} strokeWidth="0.3" />
              </g>
              <g stroke="var(--color-champagne)" strokeWidth="0.5" fill="none" style={{ opacity: "var(--dims, 0)" }}>
                <path d={`M${-pr.t},${-pr.c - 14}H${pr.t}M${-pr.t},${-pr.c - 18}v8M${pr.t},${-pr.c - 18}v8`} pathLength={1} className="anatomy-dim" />
                <path d={`M-100,${pr.g + pr.pv + 16}H100M-100,${pr.g + pr.pv + 12}v8M100,${pr.g + pr.pv + 12}v8`} pathLength={1} className="anatomy-dim" />
                <path d={`M118,${-pr.c}V${pr.g + pr.pv}M114,${-pr.c}h8M114,${pr.g + pr.pv}h8`} pathLength={1} className="anatomy-dim" />
              </g>
              <g fill="var(--color-ink)" fontSize="7.5" fontFamily="var(--font-sans)" style={{ opacity: "var(--dims, 0)" }}>
                <text x="0" y={-pr.c - 20} textAnchor="middle">{t.table} {fmt(facts.table)}%</text>
                <text x="0" y={pr.g + pr.pv + 28} textAnchor="middle">{t.diameter} {facts.diameter}</text>
                <text x="124" y={(pr.g + pr.pv - pr.c) / 2 - 4}>{t.depth}</text>
                <text x="124" y={(pr.g + pr.pv - pr.c) / 2 + 6}>{fmt(facts.depth)}%</text>
                <text x="-104" y={-pr.c / 2 - 2} textAnchor="end">{t.crown} {fmt(facts.crownAngle)}°</text>
                <text x="-104" y={-pr.c / 2 + 8} textAnchor="end" fill="var(--color-platinum-2)">{fmt(facts.crown)}%</text>
                <text x="-60" y={pr.g + pr.pv / 2} textAnchor="end">{t.pavilion} {fmt(facts.pavilionAngle)}°</text>
                <text x="-60" y={pr.g + pr.pv / 2 + 10} textAnchor="end" fill="var(--color-platinum-2)">{fmt(facts.pavilion)}%</text>
              </g>
            </svg>
          </div>

          {/* The characteristics that set a value, with this stone's figures. */}
          <dl className="divide-y divide-line border-y border-line">
            {t.factors.map(([name, body], i) => (
              <div key={name} className="grid grid-cols-[1fr_auto] gap-x-4 py-3" style={{ opacity: `var(--f${i}, 1)`, transform: `translateX(calc((1 - var(--f${i}, 1)) * 1.5rem))` }}>
                <dt className="font-display text-xl">{name}</dt>
                <dd className="text-right text-sm text-burgundy">{values[i]}</dd>
                <dd className="col-span-2 text-sm text-platinum-2">{body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
