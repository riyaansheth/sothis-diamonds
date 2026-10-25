"use client";

import { MeshRefractionMaterial } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import Diamond3D, { roundBrilliant, useStudioEnv } from "./Diamond3D";

// A platinum tennis bracelet: one line of equal round diamonds, each in its own collet with four claws,
// hinged into a soft circle. Round, so it reads as a bracelet from every angle as it turns.

const R = 1.05; // radius of the circle
const N = 40; // stones
const STONE = 0.072; // stone girdle radius
const Y = new THREE.Vector3(0, 1, 0);
const Z = new THREE.Vector3(0, 0, 1);

type Placed = [THREE.Vector3, THREE.Quaternion, THREE.Vector3][];
function place(mesh: THREE.InstancedMesh, list: Placed) {
  const m = new THREE.Matrix4();
  list.forEach(([p, q, s], i) => mesh.setMatrixAt(i, m.compose(p, q, s)));
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

function useBracelet() {
  const env = useStudioEnv();
  return useMemo(() => {
    const platinum = new THREE.MeshStandardMaterial({ color: "#e9e9ec", metalness: 1, roughness: 0.14, envMap: env, envMapIntensity: 1.15 });
    const group = new THREE.Group();
    const one = new THREE.Vector3(1, 1, 1);
    const stones: Placed = [];
    const collets: Placed = [];
    const claws: Placed = [];
    const links: Placed = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const out = new THREE.Vector3(Math.cos(a), 0, Math.sin(a)); // the stone faces outward
      const along = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a));
      const p = out.clone().multiplyScalar(R);
      stones.push([p.clone().addScaledVector(out, 0.005), new THREE.Quaternion().setFromUnitVectors(Y, out), new THREE.Vector3(STONE, STONE, STONE)]);
      // The collet round the girdle, and four claws over its edge, set diagonally.
      collets.push([p, new THREE.Quaternion().setFromUnitVectors(Z, out), one]);
      for (const [s, t] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const side = along.clone().multiplyScalar(s).addScaledVector(Y, t).normalize();
        claws.push([p.clone().addScaledVector(side, STONE * 0.98).addScaledVector(out, 0.012), new THREE.Quaternion(), one]);
      }
      // The hinge to the next stone, behind the gap between them.
      const b = a + Math.PI / N;
      const mid = new THREE.Vector3(Math.cos(b), 0, Math.sin(b));
      const basis = new THREE.Matrix4().makeBasis(new THREE.Vector3(-Math.sin(b), 0, Math.cos(b)), Y, mid);
      links.push([mid.multiplyScalar(R - 0.058), new THREE.Quaternion().setFromRotationMatrix(basis), one]);
    }
    group.add(place(new THREE.InstancedMesh(new THREE.TorusGeometry(STONE + 0.006, 0.009, 8, 24), platinum, N), collets));
    group.add(place(new THREE.InstancedMesh(new THREE.SphereGeometry(0.013, 8, 6), platinum, claws.length), claws));
    group.add(place(new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 0.022, 0.016), platinum, N), links));
    return { group, stones, small: roundBrilliant() };
  }, [env]);
}

function BraceletModel({ stone }: { stone: string }) {
  const env = useStudioEnv();
  const { group, stones, small } = useBracelet();
  const melee = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => void (melee.current && place(melee.current, stones)), [stones]);
  return (
    <group>
      <primitive object={group} />
      <instancedMesh ref={melee} args={[small, undefined, stones.length]}>
        <MeshRefractionMaterial envMap={env} color={stone} bounces={2} ior={2.42} fresnel={1} aberrationStrength={0.02} fastChroma toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/** The bracelet, tipped toward the viewer so it shows as an oval of diamonds, turning like the stones; drag to turn it. */
export default function Bracelet3D({ stone = "#ffffff", className, active, size = 1 }: { stone?: string; className?: string; active?: boolean; size?: number }) {
  return <Diamond3D model={<BraceletModel stone={stone} />} tilt={0.85} size={size * 1.4} active={active} className={className} />;
}
