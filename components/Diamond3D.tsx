"use client";

import { MeshRefractionMaterial } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type Cut = "round" | "asscher";

/** Ring of `n` points at height y; `shape(angle)` gives the radius at that angle. */
function ring(n: number, y: number, radius: number | ((a: number) => number), offset = 0) {
  return Array.from({ length: n }, (_, i) => {
    const a = offset + (i / n) * Math.PI * 2;
    const r = typeof radius === "number" ? radius : radius(a);
    return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
  });
}

/** Proportions from a grading report, as % of the girdle diameter. */
export type Proportions = { table: number; crown: number; pavilion: number };
const DEFAULT_PROPORTIONS: Proportions = { table: 56, crown: 17, pavilion: 43 };

/** Round brilliant, girdle radius 1: table, crown, girdle, pavilion, culet, built from real proportions. */
export function roundBrilliant({ table, crown, pavilion }: Proportions = DEFAULT_PROPORTIONS) {
  const step = Math.PI / 8;
  const crownY = (crown / 100) * 2 + 0.03; // % of the 2-unit diameter, above the girdle
  const culetY = -((pavilion / 100) * 2) - 0.03;
  return new ConvexGeometry([
    ...ring(8, crownY, table / 100, step / 2), // table
    ...ring(8, 0.03 + (crownY - 0.03) * 0.5, 0.84), // bezel / star points
    ...ring(16, 0.03, 1, step / 2), // upper girdle
    ...ring(16, -0.03, 1, step / 2), // lower girdle
    ...ring(16, culetY * 0.26, 0.8), // lower girdle facets
    ...ring(8, culetY * 0.52, 0.52, step / 2), // pavilion mains
    new THREE.Vector3(0, culetY, 0), // culet
  ]);
}

/** Asscher: square step cut with clipped corners, stepped crown and pavilion. */
function asscher() {
  const cut = 0.28; // corner clip, fraction of the half side
  // Octagon outline of a clipped square with half-side `s`, sampled at its 8 corners.
  const octagon = (s: number, y: number) =>
    [
      [s, s * (1 - cut)], [s * (1 - cut), s], [-s * (1 - cut), s], [-s, s * (1 - cut)],
      [-s, -s * (1 - cut)], [-s * (1 - cut), -s], [s * (1 - cut), -s], [s, -s * (1 - cut)],
    ].map(([x, z]) => new THREE.Vector3(x, y, z));
  return new ConvexGeometry([
    ...octagon(0.58, 0.3), // table
    ...octagon(0.8, 0.19), // crown steps
    ...octagon(0.93, 0.08),
    ...octagon(1, 0.02), // girdle
    ...octagon(1, -0.02),
    ...octagon(0.8, -0.22), // pavilion steps
    ...octagon(0.56, -0.42),
    ...octagon(0.3, -0.6),
    ...octagon(0.06, -0.74), // culet
  ]);
}

/** Studio reflections for the stone to refract, rendered once from three's built-in room. */
export function useStudioEnv() {
  const gl = useThree((s) => s.gl);
  return useMemo(() => {
    const target = new THREE.WebGLCubeRenderTarget(256);
    const room = new RoomEnvironment();
    new THREE.CubeCamera(0.1, 100, target).update(gl, room);
    room.dispose();
    return target.texture;
  }, [gl]);
}

/** Tells the loader a 3D stone has drawn its first frame (it waits for these on the homepage). */
export const STONE_READY = "sothis:stone-ready";

function Stone({ cut, color, spin }: { cut: Cut; color: string; spin: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const announced = useRef(false);
  const env = useStudioEnv();
  const geometry = useMemo(() => (cut === "round" ? roundBrilliant() : asscher()), [cut]);

  useFrame((_, dt) => {
    if (spin && mesh.current) mesh.current.rotation.y += dt * 0.35;
    if (!announced.current) {
      announced.current = true;
      window.dispatchEvent(new Event(STONE_READY));
    }
  });

  return (
    <mesh ref={mesh} geometry={geometry} rotation={[0.62, 0.3, 0.08]}>
      <MeshRefractionMaterial envMap={env} color={color} bounces={3} ior={2.42} fresnel={1} aberrationStrength={0.012} fastChroma toneMapped={false} />
    </mesh>
  );
}

/**
 * A real-time rendered diamond that turns slowly. Only renders while on screen,
 * and stays still for visitors who prefer reduced motion.
 */
export default function Diamond3D({ cut, color = "#ffffff", className }: { cut: Cut; color?: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [spin] = useState(() => typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    if (box.current) io.observe(box.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={box} className={className}>
      <Canvas
        frameloop={visible && spin ? "always" : "demand"}
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5.6], fov: 32 }}
        gl={{ antialias: true, alpha: true }}
        aria-hidden
      >
        <Stone cut={cut} color={color} spin={spin} />
      </Canvas>
    </div>
  );
}
