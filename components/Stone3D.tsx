"use client";

import { useMemo } from "react";
import * as THREE from "three";
import Diamond3D from "./Diamond3D";

// A 3D stone in any of the shop's shapes, built from its face-up outline: a brilliant (table, crown,
// girdle, pavilion, culet) fitted to the outline, or a step cut for Emerald and Asscher.

type Pt = [number, number];
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
export const STONE_SHAPES = Object.keys(OUTLINES);

/** Distance from the centre to the outline along angle a (ray against each edge). */
function reach(poly: Pt[], a: number) {
  const dx = Math.cos(a), dy = Math.sin(a);
  let best = 0;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i], [x2, y2] = poly[(i + 1) % poly.length];
    const ex = x2 - x1, ey = y2 - y1;
    const den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-9) continue;
    const t = (x1 * ey - y1 * ex) / den;
    const u = (x1 * dy - y1 * dx) / den;
    if (t > 0 && u >= 0 && u <= 1) best = Math.max(best, t);
  }
  return best;
}

type Ring = { k: number; y: number; off: number }; // fraction of the outline, height, half-step offset

function build(shape: string) {
  const poly = OUTLINES[shape] ?? OUTLINES.Round;
  const step = shape === "Emerald" || shape === "Asscher";
  // Step cuts follow their corners (no offsets: long flat steps); brilliants use 16 alternating
  // directions, which turns the bands into triangular facets.
  const angles = step ? poly.map(([x, y]) => Math.atan2(y, x)).sort((a, b) => a - b) : arc(16, (t) => [t * 2 * Math.PI, 0]).map(([a]) => a);
  const rings: Ring[] = step
    ? [
        { k: 0.62, y: 0.3, off: 0 }, { k: 0.8, y: 0.2, off: 0 }, { k: 0.92, y: 0.1, off: 0 }, { k: 1, y: 0.02, off: 0 },
        { k: 1, y: -0.02, off: 0 }, { k: 0.8, y: -0.26, off: 0 }, { k: 0.56, y: -0.47, off: 0 }, { k: 0.3, y: -0.64, off: 0 },
      ]
    : [
        { k: 0.56, y: 0.37, off: 0 }, { k: 0.82, y: 0.19, off: 0.5 }, { k: 1, y: 0.03, off: 0 },
        { k: 1, y: -0.03, off: 0 }, { k: 0.78, y: -0.27, off: 0.5 }, { k: 0.45, y: -0.56, off: 0 },
      ];
  const top = new THREE.Vector3(0, rings[0].y, 0);
  const culet = new THREE.Vector3(0, step ? -0.72 : -0.89, 0);
  const n = angles.length;
  const angleAt = (j: number, off: number) => {
    const a = angles[((j % n) + n) % n] + (j >= n ? 2 * Math.PI : 0);
    const b = angles[((j + 1) % n + n) % n] + (j + 1 >= n ? 2 * Math.PI : 0);
    return a + (b - a) * off;
  };
  const point = (r: Ring, j: number) => {
    const a = angleAt(j, r.off);
    const d = reach(poly, a) * r.k;
    return new THREE.Vector3(Math.cos(a) * d, r.y, Math.sin(a) * d);
  };
  const pts = rings.map((r) => Array.from({ length: n }, (_, j) => point(r, j)));

  const tris: THREE.Vector3[][] = [];
  for (let j = 0; j < n; j++) {
    tris.push([top, pts[0][j], pts[0][(j + 1) % n]]);
    tris.push([culet, pts.at(-1)![(j + 1) % n], pts.at(-1)![j]]);
    for (let i = 0; i + 1 < pts.length; i++) {
      const [a0, a1, b0, b1] = [pts[i][j], pts[i][(j + 1) % n], pts[i + 1][j], pts[i + 1][(j + 1) % n]];
      tris.push([a0, b0, a1], [a1, b0, b1]);
    }
  }
  // Every face points outward (the stone is star-shaped around its centre), so flip any that don't.
  const pos: number[] = [];
  const e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), nrm = new THREE.Vector3(), mid = new THREE.Vector3();
  for (const [a, b, c] of tris) {
    nrm.crossVectors(e1.subVectors(b, a), e2.subVectors(c, a));
    mid.copy(a).add(b).add(c);
    const [p, q, r] = nrm.dot(mid) < 0 ? [a, c, b] : [a, b, c];
    pos.push(p.x, p.y, p.z, q.x, q.y, q.z, r.x, r.y, r.z);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals(); // non-indexed, so each facet stays flat
  return g;
}

export default function Stone3D({ shape, color, size, className }: { shape: string; color: string; size: number; className?: string }) {
  const geometry = useMemo(() => build(shape), [shape]);
  return <Diamond3D geometry={geometry} color={color} size={size} tilt={1.0} className={className} />;
}
