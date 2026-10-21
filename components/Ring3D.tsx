"use client";

import { MeshRefractionMaterial } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import Diamond3D, { roundBrilliant, useStudioEnv } from "./Diamond3D";
import { build } from "./Stone3D";

// A platinum halo ring: an emerald-cut diamond in four claws, a halo of round diamonds on a scalloped
// frame with a basket underneath, and pavé diamonds down both shoulders of a slim band.
// Units: the band's inner radius is 1; the band lies in the XY plane (the finger runs along Z) with the
// centre stone on top. The emerald's long side runs along the finger, as in the photographs.

const BAND_IN = 1;
const BAND_OUT = 1.085;
const BAND_HALF = 0.068; // half the band's width along the finger
const SWELL = 0.55; // the band thickens and widens toward the shoulders, like the real piece
/** How much thicker the band is at angle t from its top (1 at the bottom). */
const swell = (t: number) => 1 + SWELL * Math.max(0, Math.cos(t)) ** 2;
/** The band's outer surface and half-width at angle t from the top. */
const outerAt = (t: number) => BAND_IN + (BAND_OUT - BAND_IN) * swell(t);
const halfAt = (t: number) => BAND_HALF * (1 + (swell(t) - 1) * 0.35);
const S = 0.42; // centre stone scale: emerald half-extents 0.7S across, 0.96S along the finger
const GIRDLE = 1.52; // height of the centre stone's girdle
const HALO_R = 0.06; // girdle radius of a halo diamond
const HALO_GAP = HALO_R + 0.014; // halo path, outside the centre stone's girdle
const FRAME_DEPTH = 0.055;
const PAVE_R = 0.052;
const PAVE = 12; // per shoulder
const PAVE_FROM = 0.4; // radians from the top of the band
const PAVE_TO = 1.45;

const Y = new THREE.Vector3(0, 1, 0);

/** Clipped rectangle (an emerald's outline) in the XZ plane, as 2D points (x, z), counter-clockwise. */
function octagon(hx: number, hz: number, c: number) {
  return [
    [hx, -hz + c], [hx, hz - c], [hx - c, hz], [-hx + c, hz],
    [-hx, hz - c], [-hx, -hz + c], [-hx + c, -hz], [hx - c, -hz],
  ].map(([x, z]) => new THREE.Vector2(x, z));
}

/** `n` evenly spaced points around a closed polygon, with the outward normal at each. */
function around(poly: THREE.Vector2[], n: number, offset = 0) {
  const segs = poly.map((p, i) => [p, poly[(i + 1) % poly.length]] as const);
  const lengths = segs.map(([a, b]) => a.distanceTo(b));
  const total = lengths.reduce((s, l) => s + l, 0);
  return Array.from({ length: n }, (_, k) => {
    let d = ((k + offset) / n) * total;
    let i = 0;
    while (d > lengths[i]) d -= lengths[i++];
    const [a, b] = segs[i];
    const t = b.clone().sub(a).normalize();
    return { p: a.clone().lerp(b, d / lengths[i]), n: new THREE.Vector2(t.y, -t.x) };
  });
}

type Placed = [THREE.Vector3, THREE.Vector3, number][]; // [position, up direction, scale]

/** Places the copies of an instanced mesh. */
function place(mesh: THREE.InstancedMesh, list: Placed) {
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  list.forEach(([pos, up, s], i) => mesh.setMatrixAt(i, m.compose(pos, q.setFromUnitVectors(Y, up.clone().normalize()), new THREE.Vector3(s, s, s))));
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

/** A metal bar from a to b. */
function bar(a: THREE.Vector3, b: THREE.Vector3, r: number, material: THREE.Material, taper = 1) {
  const len = a.distanceTo(b);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r * taper, r, len, 14), material);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(Y, b.clone().sub(a).normalize());
  return mesh;
}

function useRing() {
  const env = useStudioEnv();
  return useMemo(() => {
    const platinum = new THREE.MeshStandardMaterial({ color: "#e9e9ec", metalness: 1, roughness: 0.1, envMap: env, envMapIntensity: 1.15 });
    const group = new THREE.Group();

    // Band: a rounded, comfort-fit section swept round the finger.
    const section: THREE.Vector2[] = [];
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      const c = Math.cos(a), s = Math.sin(a);
      section.push(new THREE.Vector2((BAND_IN + BAND_OUT) / 2 + ((BAND_OUT - BAND_IN) / 2) * Math.sign(c) * Math.abs(c) ** 0.45, BAND_HALF * Math.sign(s) * Math.abs(s) ** 0.45));
    }
    const band = new THREE.LatheGeometry(section, 220).rotateX(Math.PI / 2);
    const pos = band.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      const r = Math.hypot(x, y);
      const k = swell(Math.atan2(x, y));
      const r2 = BAND_IN + (r - BAND_IN) * k;
      pos.setXYZ(i, (x / r) * r2, (y / r) * r2, pos.getZ(i) * (1 + (k - 1) * 0.35));
    }
    band.computeVertexNormals();
    group.add(new THREE.Mesh(band, platinum));

    // Pavé down both shoulders, each stone between two pairs of beads.
    const small = roundBrilliant();
    const stones: Placed = [];
    const beads: Placed = [];
    for (const side of [-1, 1]) {
      for (let k = 0; k <= PAVE; k++) {
        const t = PAVE_FROM + ((PAVE_TO - PAVE_FROM) * k) / PAVE;
        const out = new THREE.Vector3(side * Math.sin(t), Math.cos(t), 0);
        for (const z of [-1, 1]) beads.push([out.clone().multiplyScalar(outerAt(t) + 0.014).setZ(z * (halfAt(t) - 0.014)), out, 0.022]);
        if (k === PAVE) break;
        const mid = t + (PAVE_TO - PAVE_FROM) / PAVE / 2;
        const dir = new THREE.Vector3(side * Math.sin(mid), Math.cos(mid), 0);
        stones.push([dir.clone().multiplyScalar(outerAt(mid) + 0.006), dir, PAVE_R]);
      }
    }

    // Halo: round diamonds around the emerald on a frame, beads between them inside and out.
    const c = 0.2 * S;
    const hx = 0.7 * S, hz = 0.96 * S;
    const path = octagon(hx + HALO_GAP, hz + HALO_GAP, c + HALO_GAP * (Math.SQRT2 - 1));
    const perimeter = path.reduce((s, p, i) => s + p.distanceTo(path[(i + 1) % path.length]), 0);
    const count = Math.round(perimeter / (HALO_R * 2.15));
    const top = GIRDLE - 0.02;
    for (const { p } of around(path, count)) stones.push([new THREE.Vector3(p.x, top, p.y), Y, HALO_R]);
    for (const { p, n } of around(path, count, 0.5)) {
      for (const k of [-1, 1]) beads.push([new THREE.Vector3(p.x + n.x * k * (HALO_R + 0.006), top + 0.012, p.y + n.y * k * (HALO_R + 0.006)), Y, 0.017]);
    }
    group.add(place(new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), platinum, beads.length), beads));

    // The halo frame: a slim collar under the halo stones (their girdles sit above it, so they sparkle
    // from the side too), open in the middle for the centre stone.
    const outer = new THREE.Shape(octagon(hx + HALO_GAP + HALO_R * 0.4, hz + HALO_GAP + HALO_R * 0.4, c + (HALO_GAP + HALO_R * 0.4) * 0.41));
    outer.holes.push(new THREE.Path(octagon(hx + 0.012, hz + 0.012, c).reverse()));
    const frame = new THREE.ExtrudeGeometry(outer, { depth: FRAME_DEPTH, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 3, curveSegments: 4 }).rotateX(Math.PI / 2);
    const collar = new THREE.Mesh(frame, platinum);
    collar.position.y = top - HALO_R * 0.7;
    group.add(collar);

    // Basket: four posts from the frame's corners down to the shoulders, and a bridge across each side.
    const base = top - HALO_R * 0.7 - FRAME_DEPTH;
    const onBand = (x: number) => Math.cos(Math.asin(x / outerAt(0))) * outerAt(0) - 0.02;
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        group.add(bar(new THREE.Vector3(sx * (hx - 0.02), base, sz * (hz - 0.06)), new THREE.Vector3(sx * 0.2, onBand(0.2), sz * (BAND_HALF - 0.02)), 0.022, platinum));
      }
      group.add(bar(new THREE.Vector3(sx * (hx + 0.02), base + 0.02, -hz * 0.7), new THREE.Vector3(sx * (hx + 0.02), base + 0.02, hz * 0.7), 0.016, platinum));
    }

    // Four claws on the emerald's cut corners, rising from the frame and leaning in over the crown.
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const corner = new THREE.Vector3(sx * (hx - c / 2 + 0.012), 0, sz * (hz - c / 2 + 0.012));
        const tip = corner.clone().multiplyScalar(0.93).setY(GIRDLE + 0.3 * S * 0.62);
        group.add(bar(corner.clone().setY(top - 0.03), tip, 0.026, platinum, 0.45));
      }
    }

    return { group, emerald: build("Emerald"), small, stones };
  }, [env]);
}

function RingModel({ stone }: { stone: string }) {
  const env = useStudioEnv();
  const { group, emerald, small, stones } = useRing();
  // Every halo and pavé diamond in one instanced draw, refracting like the centre stone.
  const melee = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => void (melee.current && place(melee.current, stones)), [stones]);
  return (
    <group position={[0, -0.34, 0]}>
      <primitive object={group} />
      <instancedMesh ref={melee} args={[small, undefined, stones.length]}>
        <MeshRefractionMaterial envMap={env} color="#ffffff" bounces={2} ior={2.42} fresnel={1} aberrationStrength={0.01} fastChroma toneMapped={false} />
      </instancedMesh>
      <mesh geometry={emerald} position={[0, GIRDLE, 0]} scale={S}>
        <MeshRefractionMaterial envMap={env} color={stone} bounces={3} ior={2.42} fresnel={1} aberrationStrength={0.012} fastChroma toneMapped={false} />
      </mesh>
    </group>
  );
}

/** The ring, turning and leaning toward the light like the diamonds; drag to turn it. */
export default function Ring3D({ stone = "#ffffff", className, active }: { stone?: string; className?: string; active?: boolean }) {
  return <Diamond3D model={<RingModel stone={stone} />} tilt={0.42} size={1.0} active={active} className={className} />;
}
