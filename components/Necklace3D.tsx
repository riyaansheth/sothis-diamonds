"use client";

import { MeshRefractionMaterial } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import Diamond3D, { roundBrilliant, useStudioEnv } from "./Diamond3D";
import { build } from "./Stone3D";

// A platinum pendant necklace: a pear-shaped diamond, tip up, in a halo of round diamonds on a slim
// frame, hung from a bail on a fine cable chain that falls in a soft V, as on a display bust.

const NECK = 0.82; // radius of the loop around the neck
const TOP = 1.05; // height of the chain at the back
const DROP = 1.55; // how far the front falls below the back
const LINK = 0.015; // link radius (a link is 1.5 times longer than wide): a fine jewellery chain
const STEP = 0.033; // distance between links along the chain
const PEAR = 0.4; // pendant stone scale
const HALO_R = 0.048;

const Y = new THREE.Vector3(0, 1, 0);
const Z = new THREE.Vector3(0, 0, 1);

/** The chain's path, a loop around the neck whose front falls into a V; t from 0 (front) round to 1. */
function chainAt(t: number) {
  const a = t * Math.PI * 2;
  const front = ((1 + Math.cos(a)) / 2) ** 2.2; // 1 at the front, 0 at the back
  return new THREE.Vector3(NECK * Math.sin(a), TOP - DROP * front, NECK * Math.cos(a) * 0.75);
}

/** The pear outline in the pendant's face plane (x right, y up, tip at the top), girdle radius about 1. */
function pearAt(t: number) {
  const a = t * Math.PI * 2;
  const y = -Math.cos(a);
  return new THREE.Vector2(0.78 * Math.sin(a) * ((1 + y) / 2) ** 0.75 * 1.25, -(y * 1.02 + 0.06));
}

type Placed = [THREE.Vector3, THREE.Quaternion, THREE.Vector3][];
function place(mesh: THREE.InstancedMesh, list: Placed) {
  const m = new THREE.Matrix4();
  list.forEach(([p, q, s], i) => mesh.setMatrixAt(i, m.compose(p, q, s)));
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

function useNecklace() {
  const env = useStudioEnv();
  return useMemo(() => {
    const platinum = new THREE.MeshStandardMaterial({ color: "#e9e9ec", metalness: 1, roughness: 0.12, envMap: env, envMapIntensity: 1.15 });
    const group = new THREE.Group();

    // Chain: oval links along the path, each turned a quarter round from the last (a cable chain).
    const samples = Array.from({ length: 601 }, (_, i) => chainAt(i / 600));
    const lengths = samples.slice(1).map((p, i) => p.distanceTo(samples[i]));
    const total = lengths.reduce((s, l) => s + l, 0);
    const count = Math.floor(total / STEP);
    const links: Placed = [];
    let walked = 0;
    let k = 0;
    for (let n = 0; n < count; n++) {
      const target = (n / count) * total;
      while (k < lengths.length - 1 && walked + lengths[k] < target) walked += lengths[k++];
      const p = samples[k].clone().lerp(samples[k + 1], (target - walked) / lengths[k]);
      const tangent = samples[k + 1].clone().sub(samples[k]).normalize();
      const side = new THREE.Vector3().crossVectors(tangent, Math.abs(tangent.y) > 0.9 ? Z : Y).normalize();
      const up = new THREE.Vector3().crossVectors(side, tangent);
      const basis = n % 2 ? new THREE.Matrix4().makeBasis(tangent, side, up) : new THREE.Matrix4().makeBasis(tangent, up, side);
      links.push([p, new THREE.Quaternion().setFromRotationMatrix(basis), new THREE.Vector3(1.5, 1, 1)]);
    }
    group.add(place(new THREE.InstancedMesh(new THREE.TorusGeometry(LINK, LINK * 0.24, 6, 16), platinum, links.length), links));

    // Pendant, hanging from the front of the chain, facing out (the stone's crown toward +z).
    const front = chainAt(0);
    const pendant = new THREE.Group();
    pendant.position.set(front.x, front.y - 0.07, front.z + 0.02);
    group.add(pendant);
    // The bail: a small upright loop the chain runs through.
    const bail = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.014, 10, 32), platinum);
    bail.rotation.y = Math.PI / 2;
    pendant.add(bail);

    const face = new THREE.Quaternion().setFromUnitVectors(Y, Z); // stone's up (crown) toward the viewer
    const tip = pearAt(0).y * PEAR; // the outline's top
    const centre = new THREE.Vector3(0, -0.05 - tip - HALO_R * 2.2, 0);

    // Halo: round diamonds around the pear, on a slim frame behind them.
    const ring = Array.from({ length: 160 }, (_, i) => pearAt(i / 160));
    const perimeter = ring.reduce((s, p, i) => s + p.distanceTo(ring[(i + 1) % ring.length]), 0) * PEAR * 1.2;
    const halo = Math.round(perimeter / (HALO_R * 2.15));
    const stones: Placed = [];
    for (let i = 0; i < halo; i++) {
      const o = pearAt(i / halo);
      // Outward from the pear's centre, so the halo keeps an even gap round the tip as well.
      const p = o.clone().multiplyScalar(PEAR).add(o.clone().normalize().multiplyScalar(HALO_R * 1.02));
      // Each tilted a little outward, as on a domed halo, so its facets catch the light.
      const out = new THREE.Vector3(o.x, o.y, 0).normalize();
      const up = Z.clone().add(out.multiplyScalar(0.45)).normalize();
      stones.push([new THREE.Vector3(p.x, p.y, 0.005).add(centre), new THREE.Quaternion().setFromUnitVectors(Y, up), new THREE.Vector3(HALO_R, HALO_R, HALO_R)]);
    }
    const frame = new THREE.Shape(ring.map((p) => p.clone().multiplyScalar(PEAR).add(p.clone().normalize().multiplyScalar(HALO_R * 1.25))));
    frame.holes.push(new THREE.Path(ring.map((p) => p.clone().multiplyScalar(PEAR * 0.96)).reverse()));
    const plate = new THREE.Mesh(new THREE.ExtrudeGeometry(frame, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2 }), platinum);
    plate.position.set(centre.x, centre.y, -0.045);
    pendant.add(plate);
    // The bail joins the frame's top.
    const join = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, Math.abs(centre.y + tip + HALO_R * 2.2) + 0.03, 10), platinum);
    join.position.set(0, (centre.y + tip + HALO_R * 2.2 - 0.05) / 2 - 0.02, -0.02);
    pendant.add(join);

    return { group, pendant, centre, face, stones, pear: build("Pear"), small: roundBrilliant() };
  }, [env]);
}

function NecklaceModel({ stone }: { stone: string }) {
  const env = useStudioEnv();
  const { group, pendant, centre, face, stones, pear, small } = useNecklace();
  const melee = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => void (melee.current && place(melee.current, stones)), [stones]);
  return (
    // Centred on its height (chain top about 1.05, pendant tip about -1.6), so nothing reaches the frame.
    <group position={[0, 0.27, -0.25]}>
      <primitive object={group} />
      {/* The diamonds hang with the pendant: placed in its space. */}
      <group position={pendant.position}>
        <mesh geometry={pear} position={centre} quaternion={face} scale={PEAR}>
          <MeshRefractionMaterial envMap={env} color={stone} bounces={2} ior={2.42} fresnel={1} aberrationStrength={0.012} fastChroma toneMapped={false} />
        </mesh>
        <instancedMesh ref={melee} args={[small, undefined, stones.length]}>
          <MeshRefractionMaterial envMap={env} color="#ffffff" bounces={2} ior={2.42} fresnel={1} aberrationStrength={0.02} fastChroma toneMapped={false} />
        </instancedMesh>
      </group>
    </group>
  );
}

/** The necklace, turning and leaning toward the light like the diamonds; drag to turn it. */
export default function Necklace3D({ stone = "#ffffff", className, active, size = 1 }: { stone?: string; className?: string; active?: boolean; size?: number }) {
  return <Diamond3D model={<NecklaceModel stone={stone} />} tilt={0.12} size={size} active={active} className={className} />;
}
