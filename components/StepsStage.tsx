"use client";

import { MeshRefractionMaterial, PresentationControls, RoundedBox, useFBO } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type MutableRefObject, type RefObject } from "react";
import * as THREE from "three";
import { roundBrilliant, useStudioEnv, type Proportions } from "./Diamond3D";

// "How selling works": one stone acts out the six steps, scrubbed by scroll position (0..6).

export type StageData = {
  image: string; // the stone's photo, shown as the "captured" shot and as the no-WebGL fallback
  proportions: Proportions;
  readouts: [string, string][]; // [label, value] from the grading report
  text: {
    photo: string;
    offer: string;
    offerAmount: string;
    noObligation: string;
    courier: string;
    arrived: string;
    verified: string;
    paid: string;
    hint: string;
  };
};

type Overlays = Record<"brackets" | "flash" | "photo" | "readouts" | "offer" | "courier" | "arrived" | "scan" | "verified" | "paid" | "shadow", HTMLElement | null>;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
/** Eased 0..1 for the window [a, b] inside step i (step i spans progress i..i+1). */
const seg = (p: number, i: number, a: number, b: number) => ease(clamp01((p - i - a) / (b - a)));

// Reduced motion: each step shows its most telling moment instead of being scrubbed.
const STILL = [0.9, 0.85, 0.75, 0.72, 0.9, 0.8];

const INK = "#241519";
const LENS_R = 0.67; // glass radius inside the rim
const ZOOM = 2.2; // how much the loupe magnifies
// Scratch objects for the lens pass (there's only ever one stage on a page).
const lensCam = new THREE.PerspectiveCamera(10, 1, 0.1, 50);
const lensAt = new THREE.Vector3();
const IVORY = "#f7f2ea";
const BURGUNDY = "#511f2a";

function Scene({ data, progress, overlayRoot, reduce, onGrab }: {
  data: StageData;
  progress: MutableRefObject<number>;
  overlayRoot: RefObject<HTMLDivElement | null>;
  reduce: boolean;
  onGrab: () => void;
}) {
  const env = useStudioEnv();
  const hovered = useRef(false);
  const boost = useRef(0);
  const overlays = useRef<Overlays | null>(null);

  const geometry = useMemo(() => roundBrilliant(data.proportions), [data.proportions]);
  const stone = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const gem = useRef<THREE.Mesh>(null);
  const loupe = useRef<THREE.Group>(null);
  const box = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const turntable = useRef<THREE.Mesh>(null);
  const shown = useRef(progress.current);
  // The loupe's glass shows the scene re-rendered through a narrower camera aimed where the glass is.
  const lensView = useFBO(768, 768, { samples: 4 });

  useFrame((state, dt) => {
    // Ease towards the scroll position so fast scrolling still reads as motion, not jumps.
    const target = reduce ? Math.floor(progress.current) + STILL[Math.min(5, Math.floor(progress.current))] : progress.current;
    shown.current = reduce ? target : mix(shown.current, target, 1 - Math.pow(0.0001, dt));
    const p = shown.current;
    if (!overlays.current && overlayRoot.current) {
      overlays.current = Object.fromEntries(
        [...overlayRoot.current.querySelectorAll<HTMLElement>("[data-o]")].map((el) => [el.dataset.o, el]),
      ) as Overlays;
    }
    const o = overlays.current ?? ({} as Overlays);
    const show = (el: HTMLElement | null, v: number, transform = "") => {
      if (!el) return;
      el.style.opacity = String(v);
      if (transform) el.style.transform = transform;
    };

    // 1. Submit: the stone drops in, the viewfinder closes, a shutter flash, the captured photo.
    let y = mix(3.6, 0.15, seg(p, 0, 0, 0.3)); // starts fully above the stage, drops in once the section is pinned
    let x = 0;
    let scale = 1;
    let tilt = 0.5;
    show(o.brackets, seg(p, 0, 0.3, 0.45) * (1 - seg(p, 1, 0, 0.1)), `scale(${mix(1.25, 1, seg(p, 0, 0.3, 0.5))})`);
    const flashT = clamp01((p - 0.55) / 0.08);
    show(o.flash, p < 1 ? Math.sin(Math.PI * flashT) * 0.85 : 0);
    show(o.photo, seg(p, 0, 0.6, 0.75) * (1 - seg(p, 1, 0, 0.12)), `translateY(${mix(16, 0, seg(p, 0, 0.6, 0.75))}px)`);

    // 2. Expert review: a loupe glides across; readouts type in.
    const loupeOn = p > 0.95 && p < 2.05;
    if (loupe.current) {
      loupe.current.visible = loupeOn;
      // Keep the entire loupe inside the canvas so its edge never exposes the stage boundary.
      loupe.current.position.x = mix(-1.55, 1.55, clamp01((p - 1.02) / 0.9));
    }
    o.readouts?.querySelectorAll<HTMLElement>("[data-row]").forEach((row, i) => {
      const v = seg(p, 1, 0.25 + i * 0.12, 0.37 + i * 0.12) * (1 - seg(p, 2, 0, 0.15));
      row.style.opacity = String(v);
      row.style.clipPath = `inset(0 ${100 - v * 100}% 0 0)`;
    });

    // 3. Offer: the stone turns face-up; the offer card swings in.
    tilt = mix(tilt, 1.35, seg(p, 2, 0, 0.35));
    tilt = mix(tilt, 0.5, seg(p, 3, 0, 0.2));
    const offerV = seg(p, 2, 0.2, 0.55) * (1 - seg(p, 3, 0, 0.15));
    show(o.offer, offerV, `rotate(${mix(-14, 0, offerV)}deg)`);

    // 4. Accept and send: the box rises, the stone lowers in, the lid closes, labelled, collected.
    // 5. Inspection: the box returns, opens, the stone rises onto the turntable, scanned, verified.
    let boxX = 0;
    let boxY = -3.2;
    let lidOpen = 1; // 1 = open
    if (p >= 3 && p < 4) {
      boxY = mix(-3.2, -0.82, seg(p, 3, 0, 0.25));
      lidOpen = 1 - seg(p, 3, 0.5, 0.65);
      boxX = mix(0, 4.6, seg(p, 3, 0.8, 1));
    } else if (p >= 4 && p < 5) {
      boxX = mix(-4.6, 0, seg(p, 4, 0, 0.25));
      boxY = mix(-0.82, -3.2, seg(p, 4, 0.55, 0.78));
      lidOpen = seg(p, 4, 0.25, 0.4);
    }
    const intoBox = p >= 3 && p < 4 ? seg(p, 3, 0.25, 0.5) : p >= 4 && p < 5 ? 1 - seg(p, 4, 0.4, 0.62) : 0;
    if (intoBox > 0 || (p >= 3 && p < 4.62)) {
      x = boxX;
      y = mix(0.15, -0.6, intoBox);
      scale = mix(1, 0.38, intoBox);
    }
    if (box.current) {
      box.current.position.set(boxX, boxY, 0);
      box.current.visible = boxY > -3.1;
    }
    if (lid.current) lid.current.rotation.x = mix(0, -1.9, lidOpen);
    show(o.courier, seg(p, 3, 0.62, 0.74) * (1 - seg(p, 3, 0.8, 0.9)), `translateX(${mix(-24, 0, seg(p, 3, 0.62, 0.74))}px)`);
    show(o.arrived, seg(p, 4, 0.05, 0.2) * (1 - seg(p, 4, 0.45, 0.55)));
    const onTable = seg(p, 4, 0.5, 0.7);
    if (turntable.current) {
      turntable.current.position.y = mix(-3.2, -1.05, onTable);
      turntable.current.visible = onTable > 0.01;
      turntable.current.rotation.y += dt * 0.4;
    }
    if (p >= 4.6) y = mix(y, 0.05, onTable);
    const scan = clamp01((p - 4.62) / 0.23);
    show(o.scan, p > 4.6 && p < 4.9 ? 1 : 0, `translateY(${mix(-120, 120, scan)}%)`);
    show(o.verified, seg(p, 4, 0.85, 0.95) * (1 - seg(p, 5, 0, 0.15)));

    // 6. Payment: one bright sparkle, then the confirmation.
    const sparkle = seg(p, 5, 0.12, 0.28) * (1 - seg(p, 5, 0.3, 0.5));
    show(o.paid, seg(p, 5, 0.4, 0.62));

    // Shadow under the stone fades while it's inside the box.
    show(o.shadow, 1 - Math.max(intoBox, boxY > -3.1 ? 0.6 : 0) * 0.9);

    if (stone.current) {
      stone.current.position.set(x, y, 0);
      stone.current.scale.setScalar(scale);
      // Once it's in the box and the lid is (nearly) shut, the stone can't be seen, so don't draw it.
      stone.current.visible = !(intoBox > 0.9 && lidOpen < 0.35);
    }
    if (spin.current) {
      const spinning = !reduce;
      boost.current *= Math.pow(0.02, dt); // click spin decays
      spin.current.rotation.x = tilt + (spinning && hovered.current ? state.pointer.y * -0.12 : 0);
      spin.current.rotation.z = spinning && hovered.current ? state.pointer.x * -0.1 : 0;
      if (spinning) spin.current.rotation.y += dt * (0.28 + boost.current);
    }
    // drei keeps its own ref on the material, so reach it through the mesh rather than passing a ref.
    const mat = gem.current?.material as (THREE.Material & { aberrationStrength?: number }) | undefined;
    if (mat && "aberrationStrength" in mat) mat.aberrationStrength = 0.012 + sparkle * 0.05 + (hovered.current ? 0.01 : 0);

    // Magnify: from the main camera, aim through the lens centre at the stone's plane (z = 0) with a
    // field of view ZOOM times narrower than the lens covers on screen, and paint that onto the glass.
    if (loupeOn && loupe.current) {
      const cam = state.camera;
      loupe.current.getWorldPosition(lensAt);
      const dist = cam.position.distanceTo(lensAt);
      lensCam.position.copy(cam.position);
      lensCam.fov = THREE.MathUtils.radToDeg((2 * Math.atan(LENS_R / dist)) / ZOOM);
      lensCam.updateProjectionMatrix();
      lensAt.sub(cam.position).multiplyScalar(-cam.position.z / (lensAt.z - cam.position.z)).add(cam.position);
      lensCam.lookAt(lensAt);
      loupe.current.visible = false; // the loupe mustn't see itself
      state.gl.setRenderTarget(lensView);
      state.gl.clear();
      state.gl.render(state.scene, lensCam);
      state.gl.setRenderTarget(null);
      loupe.current.visible = true;
    }
  });

  const ivory = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: IVORY,
    roughness: 0.58,
    clearcoat: 0.16,
    clearcoatRoughness: 0.72,
  }), []);
  const lining = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: BURGUNDY,
    roughness: 0.92,
    sheen: 0.7,
    sheenColor: new THREE.Color("#8a4555"),
    sheenRoughness: 0.86,
  }), []);
  const liningDark = useMemo(() => new THREE.MeshStandardMaterial({ color: "#351018", roughness: 1 }), []);
  const hardware = useMemo(() => new THREE.MeshStandardMaterial({ color: "#aa8a50", metalness: 0.82, roughness: 0.3 }), []);

  return (
    <>
      <primitive object={env} attach="environment" />
      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 4, 3]} intensity={1.8} />

      <PresentationControls snap global={false} cursor speed={1.4} polar={[-0.5, 0.5]} azimuth={[-Infinity, Infinity]}>
        <group ref={stone}>
          <group ref={spin}>
            <mesh
              ref={gem}
              geometry={geometry}
              onPointerOver={() => (hovered.current = true)}
              onPointerOut={() => (hovered.current = false)}
              onPointerDown={onGrab}
              onClick={() => !reduce && (boost.current = 9)}
            >
              <MeshRefractionMaterial envMap={env} bounces={3} ior={2.42} fresnel={1} aberrationStrength={0.012} fastChroma toneMapped={false} />
            </mesh>
          </group>
        </group>
      </PresentationControls>

      {/* Loupe: transparent glass keeps the page ground continuous through the WebGL canvas. */}
      <group ref={loupe} position={[-1.55, 0.15, 1.6]} visible={false}>
        <mesh>
          <torusGeometry args={[0.72, 0.06, 16, 64]} />
          <meshStandardMaterial color={INK} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, -0.01]}>
          <circleGeometry args={[LENS_R, 64]} />
          <meshBasicMaterial map={lensView.texture} transparent toneMapped={false} depthWrite={false} />
        </mesh>
        {/* Faint glass tint and a soft reflection over the magnified view. */}
        <mesh position={[0, 0, -0.005]}>
          <circleGeometry args={[LENS_R, 64]} />
          <meshBasicMaterial color="#f4f0e8" transparent opacity={0.06} depthWrite={false} />
        </mesh>
        <mesh position={[-0.2, 0.24, 0]} rotation={[0, 0, 0.7]} scale={[1, 0.35, 1]}>
          <circleGeometry args={[0.3, 48]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.12} depthWrite={false} />
        </mesh>
        <mesh position={[0.62, -0.62, 0]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.05, 0.05, 0.7, 12]} />
          <meshStandardMaterial color={INK} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* Presentation box: softly rounded leather shell, velvet bed and visible brass hinges. */}
      <group ref={box} visible={false} scale={0.72}>
        <RoundedBox args={[2.54, 0.14, 2.14]} radius={0.07} smoothness={5} position={[0, -0.07, 0]} material={ivory} />
        {[
          [0, 0.18, 1.02, 2.54, 0.42, 0.12],
          [0, 0.28, -1.02, 2.54, 0.62, 0.12],
          [1.21, 0.28, 0, 0.12, 0.62, 2.02],
          [-1.21, 0.28, 0, 0.12, 0.62, 2.02],
        ].map(([px, py, pz, w, h, d], i) => (
          <RoundedBox key={i} args={[w, h, d]} radius={0.045} smoothness={4} position={[px, py, pz]} material={ivory} />
        ))}
        <RoundedBox args={[2.3, 0.11, 1.9]} radius={0.12} smoothness={5} position={[0, 0.035, 0]} material={lining} />
        <mesh position={[0, 0.098, 0.04]} rotation={[Math.PI / 2, 0, 0]} material={liningDark}>
          <torusGeometry args={[0.42, 0.028, 12, 64]} />
        </mesh>
        <group ref={lid} position={[0, 0.61, -1.02]}>
          <RoundedBox args={[2.58, 0.15, 2.16]} radius={0.08} smoothness={5} position={[0, 0.04, 1.02]} material={ivory} />
          <RoundedBox args={[2.34, 0.055, 1.92]} radius={0.08} smoothness={5} position={[0, -0.055, 1.02]} material={lining} />
          {[-0.76, 0.76].map((hx) => (
            <mesh key={hx} position={[hx, 0, 0.02]} rotation={[0, 0, Math.PI / 2]} material={hardware}>
              <cylinderGeometry args={[0.055, 0.055, 0.42, 20]} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Turntable for the inspection and the final pose. */}
      <mesh ref={turntable} position={[0, -3.2, 0]} visible={false}>
        <cylinderGeometry args={[1.15, 1.18, 0.06, 96]} />
        <meshStandardMaterial color="#d9cdb6" metalness={0.85} roughness={0.32} />
      </mesh>
    </>
  );
}

function hasWebGL() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

export default function StepsStage({ data, progress }: { data: StageData; progress: MutableRefObject<number> }) {
  const overlayRoot = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState(true);
  const [webgl] = useState(hasWebGL);
  const [reduce] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const box = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    if (box.current) io.observe(box.current);
    return () => io.disconnect();
  }, []);

  const t = data.text;

  return (
    <div ref={box} className="relative size-full select-none">

      {webgl ? (
        <Canvas
          frameloop={visible ? "always" : "never"}
          dpr={[1, 2]}
          camera={{ position: [0, 0.6, 6.2], fov: 32 }}
          gl={{ antialias: true, alpha: true }}
          className="!absolute inset-0 touch-pan-y"
          aria-hidden
        >
          <Scene data={data} progress={progress} overlayRoot={overlayRoot} reduce={reduce} onGrab={() => setHint(false)} />
        </Canvas>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- still of the stone when 3D isn't available
        <img src={data.image} alt="" className="absolute inset-[18%] size-[64%] rounded-full object-cover" />
      )}

      <div data-o="shadow" aria-hidden className="absolute inset-x-[26%] bottom-[14%] h-[8%] rounded-full bg-[radial-gradient(closest-side,rgb(81_31_42/0.2),transparent)] blur-md mix-blend-multiply" />
      {/* Overlays: crisp, translatable HTML over the canvas, driven every frame by the scene. */}
      <div ref={overlayRoot} aria-hidden className="pointer-events-none absolute inset-0 text-sm">
        <div data-o="brackets" className="absolute inset-[20%] opacity-0">
          {["left-0 top-0 border-l border-t", "right-0 top-0 border-r border-t", "bottom-0 left-0 border-b border-l", "bottom-0 right-0 border-b border-r"].map((c) => (
            <span key={c} className={`absolute size-8 border-champagne ${c}`} />
          ))}
        </div>
        <div data-o="flash" className="absolute inset-0 bg-white opacity-0 mix-blend-soft-light" />
        <div data-o="photo" className="absolute bottom-[4%] left-[2%] flex items-center gap-3 bg-ivory px-2 py-2 opacity-0 shadow-sm ring-1 ring-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.image} alt="" className="size-12 object-cover" />
          <span className="pr-2 text-platinum-2">{t.photo}</span>
        </div>

        <dl data-o="readouts" className="absolute right-[2%] top-[14%] grid gap-2 font-display text-lg italic">
          {data.readouts.map(([k, v]) => (
            <div key={k} data-row className="flex items-baseline gap-3 opacity-0">
              <span className="h-px w-10 bg-ink/50" />
              <dt className="not-italic font-sans text-xs text-platinum-2">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        <div data-o="offer" className="absolute right-[2%] top-[16%] w-48 origin-top bg-ivory p-4 opacity-0 shadow-md ring-1 ring-line">
          <span className="absolute -top-8 left-1/2 h-8 w-px bg-ink/30" />
          <p className="font-display text-lg">{t.offer}</p>
          <p className="mt-1 whitespace-nowrap text-xl tracking-wider blur-[3px]">{t.offerAmount}</p>
          <p className="mt-2 text-xs text-burgundy">{t.noObligation}</p>
        </div>

        <div data-o="courier" className="absolute bottom-[26%] left-1/2 -ml-24 w-48 bg-ivory px-3 py-2 text-center text-xs tracking-wide opacity-0 shadow-sm ring-1 ring-line">
          {t.courier}
        </div>
        <p data-o="arrived" className="absolute left-[4%] top-[8%] font-display text-lg italic opacity-0">{t.arrived}</p>
        <div className="absolute inset-x-[20%] inset-y-[22%] overflow-hidden">
          <div data-o="scan" className="absolute inset-x-0 top-1/2 h-px bg-champagne opacity-0 shadow-[0_0_12px_2px_rgb(184_162_122/0.7)]" />
        </div>
        <p data-o="verified" className="absolute bottom-[8%] left-1/2 flex -translate-x-1/2 items-center gap-2 font-display text-lg italic opacity-0">
          <svg viewBox="0 0 20 20" className="size-5 fill-none stroke-ink [stroke-width:1.4]"><path d="M4 10.5l4 4 8-9" /></svg>
          {t.verified}
        </p>
        <div data-o="paid" className="absolute right-[4%] top-[18%] flex items-center gap-3 bg-ivory px-4 py-3 opacity-0 shadow-md ring-1 ring-line">
          <span className="grid size-7 place-items-center rounded-full bg-wine">
            <svg viewBox="0 0 20 20" className="size-4 fill-none stroke-on-accent [stroke-width:1.8]"><path d="M4 10.5l4 4 8-9" /></svg>
          </span>
          <span className="font-display text-lg">{t.paid}</span>
        </div>
      </div>

      {webgl && !reduce && (
        <p className={`pointer-events-none absolute inset-x-0 -bottom-2 text-center text-xs text-platinum-2 transition-opacity duration-700 ${hint ? "" : "opacity-0"}`}>{t.hint}</p>
      )}
    </div>
  );
}
