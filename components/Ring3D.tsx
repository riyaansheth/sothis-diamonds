"use client";

import { MeshRefractionMaterial } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import Diamond3D, { useStudioEnv } from "./Diamond3D";
import { build } from "./Stone3D";

// The Promise ring (SCP01): a cushion-cut yellow diamond in four yellow-gold claws, two heart-shaped
// white diamonds on the shoulders, a polished platinum band. Band radius 1, the centre stone on top.

const SHOULDER = 0.6; // angle of the side stones from the top of the band (radians)
const CLAWS = [1, 3, 5, 7].map((k) => (k * Math.PI) / 4); // on the cushion's corners

function Gem({ geometry, color, ...props }: { geometry: THREE.BufferGeometry; color: string } & React.ComponentProps<"mesh">) {
  const env = useStudioEnv();
  return (
    <mesh geometry={geometry} {...props}>
      <MeshRefractionMaterial envMap={env} color={color} bounces={3} ior={2.42} fresnel={1} aberrationStrength={0.012} fastChroma toneMapped={false} />
    </mesh>
  );
}

function RingModel({ stone }: { stone: string }) {
  const env = useStudioEnv();
  const parts = useMemo(
    () => ({
      cushion: build("Cushion"),
      heart: build("Heart"),
      band: new THREE.TorusGeometry(1, 0.075, 24, 160),
      platinum: new THREE.MeshStandardMaterial({ color: "#ececef", metalness: 1, roughness: 0.14, envMap: env }),
      gold: new THREE.MeshStandardMaterial({ color: "#e3b450", metalness: 1, roughness: 0.2, envMap: env }),
    }),
    [env],
  );
  return (
    <group position={[0, -0.32, 0]}>
      {/* The band faces the camera; widened front to back so it reads as a flat, comfortable band. */}
      <mesh geometry={parts.band} material={parts.platinum} scale={[1, 1, 2.2]} />
      <group position={[0, 1.5, 0]}>
        <Gem geometry={parts.cushion} color={stone} scale={0.6} />
        {CLAWS.map((a) => (
          <group key={a} position={[Math.cos(a) * 0.58, -0.12, Math.sin(a) * 0.58]}>
            <mesh material={parts.gold}>
              <cylinderGeometry args={[0.04, 0.05, 0.56, 12]} />
            </mesh>
            <mesh material={parts.gold} position={[0, 0.28, 0]}>
              <sphereGeometry args={[0.055, 16, 12]} />
            </mesh>
          </group>
        ))}
        {/* The gallery under the stone, joining the claws. */}
        <mesh material={parts.gold} position={[0, -0.32, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.035, 10, 48]} />
        </mesh>
      </group>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * Math.sin(SHOULDER) * 1.1, Math.cos(SHOULDER) * 1.1, 0]} rotation={[0, 0, -side * SHOULDER]}>
          <Gem geometry={parts.heart} color="#ffffff" scale={0.24} rotation={[0, side * (Math.PI / 2), 0]} />
        </group>
      ))}
    </group>
  );
}

/** The ring, turning and leaning toward the light like the diamonds; drag to turn it. */
export default function Ring3D({ stone = "#ffd23f", className }: { stone?: string; className?: string }) {
  return <Diamond3D model={<RingModel stone={stone} />} tilt={0.18} size={0.86} className={className} />;
}
