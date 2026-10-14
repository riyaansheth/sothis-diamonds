"use client";

import { useEffect, useMemo, useRef } from "react";
import { light, startLight } from "@/lib/light";

// The visitor's stone, seen face-up, drawn as they describe it: the shape sets the outline and its
// facet pattern, the carat sets its size, the colour grade tints it, lower clarity grades show a few
// specks. Each facet catches the light by its angle, and the light follows the cursor (lib/light).

type Pt = [number, number];

/** Outlines as polygons in a unit box (radius about 1), sampled from simple curves. */
const arc = (n: number, f: (t: number) => Pt) => Array.from({ length: n }, (_, i) => f(i / n));
const clipped = (w: number, h: number, c: number): Pt[] => [
  [-w + c, -h], [w - c, -h], [w, -h + c], [w, h - c], [w - c, h], [-w + c, h], [-w, h - c], [-w, -h + c],
];
const OUTLINES: Record<string, Pt[]> = {
  Round: arc(64, (t) => [Math.cos(t * 2 * Math.PI), Math.sin(t * 2 * Math.PI)]),
  Oval: arc(64, (t) => [0.74 * Math.cos(t * 2 * Math.PI), Math.sin(t * 2 * Math.PI)]),
  Pear: arc(64, (t) => {
    const a = t * 2 * Math.PI;
    const y = -Math.cos(a); // tip at the top
    return [0.78 * Math.sin(a) * Math.pow((1 + y) / 2, 0.75) * 1.25, y * 1.02 + 0.06];
  }),
  Marquise: arc(64, (t) => {
    const a = t * 2 * Math.PI;
    return [0.52 * Math.sin(a) * Math.abs(Math.sin(a)) ** 0.15, -Math.cos(a)];
  }),
  Heart: arc(96, (t) => {
    const a = t * 2 * Math.PI;
    const x = 16 * Math.sin(a) ** 3;
    const y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
    return [x / 17, -y / 17 - 0.1];
  }),
  Cushion: arc(64, (t) => {
    const a = t * 2 * Math.PI;
    const c = Math.cos(a), s = Math.sin(a);
    return [0.92 * Math.sign(c) * Math.abs(c) ** 0.6, 0.92 * Math.sign(s) * Math.abs(s) ** 0.6];
  }),
  Princess: clipped(0.88, 0.88, 0.02),
  Radiant: clipped(0.74, 0.94, 0.16),
  Emerald: clipped(0.7, 0.96, 0.2),
  Asscher: clipped(0.9, 0.9, 0.3),
};
const STEP_CUTS = new Set(["Emerald", "Asscher"]);

/** Distance from the centre to the outline along angle a (ray against each edge). */
function reach(poly: Pt[], a: number) {
  const dx = Math.cos(a), dy = Math.sin(a);
  let best = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length];
    const ex = x2 - x1, ey = y2 - y1;
    const den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-9) continue;
    const t = (x1 * ey - y1 * ex) / den; // along the ray
    const u = (x1 * dy - y1 * dx) / den; // along the edge
    if (t > 0 && u >= 0 && u <= 1) best = Math.max(best, t);
  }
  return best;
}

type Facet = { pts: Pt[]; angle: number; depth: number };

/** Face-up brilliant: table, star, kite and upper girdle facets, fitted to any outline. */
function brilliant(poly: Pt[]): Facet[] {
  const at = (a: number, k: number): Pt => [Math.cos(a) * reach(poly, a) * k, Math.sin(a) * reach(poly, a) * k];
  const step = Math.PI / 4;
  const A = (j: number) => -Math.PI / 2 + j * step;
  const T = (j: number) => at(A(j), 0.56);
  const S = (j: number) => at(A(j) + step / 2, 0.8);
  const facets: Facet[] = [{ pts: Array.from({ length: 8 }, (_, j) => T(j)), angle: 0, depth: 0 }];
  for (let j = 0; j < 8; j++) {
    const a = A(j), m = a + step / 2;
    facets.push({ pts: [T(j), S(j), T(j + 1)], angle: m, depth: 1 });
    facets.push({ pts: [S(j - 1), T(j), S(j), at(a, 1)], angle: a, depth: 2 });
    facets.push({ pts: [S(j), at(a, 1), at(a + step / 4, 1), at(m, 1)], angle: a + step / 4, depth: 3 });
    facets.push({ pts: [S(j), at(m, 1), at(m + step / 4, 1), at(a + step, 1)], angle: m + step / 4, depth: 3 });
  }
  return facets;
}

/** Face-up step cut: the table inside three bands of long facets running parallel to the outline. */
function stepCut(poly: Pt[]): Facet[] {
  const rings = [1, 0.86, 0.73, 0.6];
  const facets: Facet[] = [{ pts: poly.map(([x, y]) => [x * 0.6, y * 0.6]), angle: 0, depth: 0 }];
  for (let b = 0; b < 3; b++)
    poly.forEach(([x1, y1], i) => {
      const [x2, y2] = poly[(i + 1) % poly.length];
      const [o, n] = [rings[b], rings[b + 1]];
      facets.push({ pts: [[x1 * o, y1 * o], [x2 * o, y2 * o], [x2 * n, y2 * n], [x1 * n, y1 * n]], angle: Math.atan2(y1 + y2, x1 + x2), depth: 3 - b });
    });
  return facets;
}

/** Same tints as the colour chips: D reads white, N–Z light yellow; fancy is a deeper yellow. */
function tint(colour: string | undefined, grades: string[]) {
  const i = colour ? grades.indexOf(colour) : -1;
  if (i < 0) return "hsl(0 0% 100%)";
  if (i > 10) return "hsl(44 90% 62%)";
  return `hsl(48 ${Math.round((i / 10) * 75)}% ${100 - i * 2.5}%)`;
}

const path = (pts: Pt[]) => `M${pts.map(([x, y]) => `${(x * 40).toFixed(2)},${(y * 40).toFixed(2)}`).join("L")}Z`;
const SPECKS: Pt[] = [[-0.22, 0.14], [0.26, -0.2], [0.08, 0.34], [-0.34, -0.28], [0.38, 0.22]];
const TWINKLES: [number, number, number][] = [[-0.3, -0.42, 0], [0.46, 0.08, 1.3], [-0.12, 0.5, 2.4]]; // x, y, delay (s)

/** How much light a facet sends back: facets facing the light flash, the rest stay dark, with a
 *  fixed scatter per facet so neighbours never match (what reads as sparkle). */
function brightness(f: Facet, i: number, lx: number, ly: number) {
  if (f.depth === 0) return 0.1 + 0.14 * Math.max(0, -ly);
  const toward = Math.cos(f.angle - Math.atan2(ly, lx)) * Math.min(1, Math.hypot(lx, ly) + 0.35);
  const scatter = ((i * 7919) % 13) / 13;
  return Math.max(0.02, Math.min(1, 0.02 + 0.9 * Math.max(0, toward) ** 3 + 0.5 * scatter ** 2 * (f.depth === 2 ? 1 : 0.7)));
}

export function StonePreview({ shape, carat, colour, clarity, grades, empty }: {
  shape?: string;
  carat?: string;
  colour?: string;
  clarity?: string;
  grades: string[];
  empty: string;
}) {
  const known = shape && OUTLINES[shape] ? shape : shape ? "Round" : null;
  const outline = known ? OUTLINES[known] : null;
  const facets = useMemo(() => (outline ? (STEP_CUTS.has(known!) ? stepCut(outline) : brilliant(outline)) : []), [outline, known]);
  const group = useRef<SVGGElement>(null);

  // Facets catch the light as it moves (eased); still for visitors who prefer reduced motion.
  useEffect(() => {
    const g = group.current;
    if (!g) return;
    const els = [...g.querySelectorAll<SVGPathElement>("[data-facet]")];
    const paint = (lx: number, ly: number) => els.forEach((el, i) => el.style.setProperty("fill-opacity", brightness(facets[i], i, lx, ly).toFixed(3)));
    const at = { x: -0.5, y: -0.6 };
    paint(at.x, at.y);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    startLight();
    let raf = 0;
    const frame = () => {
      const tx = light.x * 0.9 - 0.2, ty = light.y * 0.9 - 0.3;
      if (Math.abs(tx - at.x) + Math.abs(ty - at.y) > 0.002) {
        at.x += (tx - at.x) * 0.08;
        at.y += (ty - at.y) * 0.08;
        paint(at.x, at.y);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [facets]);

  const ct = Number.parseFloat((carat ?? "").replace(",", "."));
  // Size grows with the cube root of the weight (its diameter), within the frame.
  const scale = ct > 0 ? Math.min(1.12, Math.max(0.55, 0.5 + 0.24 * Math.cbrt(ct))) : 0.8;
  const specks = !clarity ? 0 : /^I\d/.test(clarity) ? 5 : /^SI/.test(clarity) ? 2 : 0;
  const colourFill = tint(colour, grades);

  return (
    <div className="stone-preview relative grid aspect-square place-items-center">
      {outline ? (
        <svg viewBox="-50 -50 100 100" className="size-full overflow-visible" aria-hidden>
          <defs>
            <radialGradient id="stone-halo">
              <stop offset="0" stopColor={colourFill} stopOpacity="0.16" />
              <stop offset="1" stopColor={colourFill} stopOpacity="0" />
            </radialGradient>
            <radialGradient id="stone-depth" cx="0.4" cy="0.35" r="0.75">
              <stop offset="0" stopColor="#2a2629" />
              <stop offset="1" stopColor="#020202" />
            </radialGradient>
          </defs>
          <circle r={50} fill="url(#stone-halo)" className="stone-halo" />
          <g className="stone-size" style={{ transform: `scale(${scale})` }}>
            {/* Keyed by shape so a new shape draws itself again. */}
            <g key={known} ref={group}>
              <path d={path(outline)} fill="url(#stone-depth)" className="stone-body" />
              <g className="stone-facets" style={{ fill: colourFill }}>
                {facets.map((f, i) => (
                  <path key={i} data-facet d={path(f.pts)} style={{ animationDelay: `${0.5 + i * 0.012}s` }} />
                ))}
              </g>
              {SPECKS.slice(0, specks).map(([x, y], i) => <circle key={i} cx={x * 40} cy={y * 40} r={0.9} className="stone-speck" />)}
              <path d={path(outline)} pathLength={1} className="stone-outline" />
              {TWINKLES.map(([x, y, d], i) => (
                <g key={i} transform={`translate(${x * 40} ${y * 40})`}>
                  <path d="M0,-3.2 L0.5,-0.5 L3.2,0 L0.5,0.5 L0,3.2 L-0.5,0.5 L-3.2,0 L-0.5,-0.5Z" className="stone-twinkle" style={{ animationDelay: `${1.2 + d}s` }} />
                </g>
              ))}
            </g>
          </g>
        </svg>
      ) : (
        <p className="max-w-[12rem] text-center text-sm text-platinum-2">{empty}</p>
      )}
    </div>
  );
}
