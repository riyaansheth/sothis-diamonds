"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Diamond3DLazy, Ring3DLazy } from "./Diamond3DLazy";
import type { Side } from "./HomeChoice";

// The 3D pieces of the homepage choice and the Diamonds / Jewellery pages live in one layer in the
// site layout, so they survive the change of page: a page only marks where its piece belongs
// (PieceSlot), and the same live stone moves there instead of being rebuilt (which blinked).

type Piece = Side["piece"];
const keyOf = (p: Piece) => ("ring" in p ? `ring:${p.ring}` : `${p.cut}:${p.color}`);

const slots = new Map<string, HTMLElement>();
const pieces = new Map<string, Piece>();
let changed = () => {};

/** Where a piece sits on this page. Its box (size, position, opacity, clipping) is followed exactly. */
export function PieceSlot({ piece, className }: { piece: Piece; className: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const key = keyOf(piece);
  useLayoutEffect(() => {
    const el = ref.current!;
    slots.set(key, el);
    pieces.set(key, piece);
    changed();
    return () => {
      if (slots.get(key) === el) slots.delete(key);
      changed();
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps -- the piece is identified by its key
  return <div ref={ref} aria-hidden className={className} />;
}

// The box keeps one size and is scaled onto its slot: the 3D canvas never resizes (a resize clears it
// for a frame, which showed as a blink when the piece changed page or grew). About the size it shows at.
const BASE = 420;

// Per slot, found once: the ancestors whose opacity it takes, and the ones that clip it.
const chains = new WeakMap<HTMLElement, { all: HTMLElement[]; clips: HTMLElement[] }>();
function chainOf(slot: HTMLElement) {
  let c = chains.get(slot);
  if (!c) {
    const all: HTMLElement[] = [];
    for (let el: HTMLElement | null = slot; el && el !== document.body; el = el.parentElement) all.push(el);
    c = { all, clips: all.slice(1).filter((el) => getComputedStyle(el).overflow !== "visible") };
    chains.set(slot, c);
  }
  return c;
}

/** Where a box should be: over its slot, at the slot's opacity, clipped as the slot is. Reads only. */
function measure(slot: HTMLElement | undefined) {
  const r = slot?.getBoundingClientRect();
  if (!slot || !r?.width || !r.height) return null;
  const { all, clips } = chainOf(slot);
  let opacity = 1;
  for (const el of all) opacity *= Number(getComputedStyle(el).opacity);
  let [top, left, bottom, right] = [r.top, r.left, r.bottom, r.right];
  for (const el of clips) {
    const c = el.getBoundingClientRect();
    [top, left, bottom, right] = [Math.max(top, c.top), Math.max(left, c.left), Math.min(bottom, c.bottom), Math.min(right, c.right)];
  }
  const h = BASE * (r.height / r.width);
  const s = r.width / BASE;
  const px = (n: number) => `${(n / s).toFixed(1)}px`;
  return {
    visible: opacity > 0.01 && right > left && bottom > top,
    height: `${h}px`,
    transform: `translate(${(r.left + r.width / 2 - BASE / 2).toFixed(1)}px, ${(r.top + r.height / 2 - h / 2).toFixed(1)}px) scale(${s.toFixed(4)})`,
    opacity: opacity.toFixed(3),
    clip: `inset(${px(top - r.top)} ${px(r.right - right)} ${px(r.bottom - bottom)} ${px(left - r.left)})`, // in the box's unscaled pixels
  };
}

/** Applies a placement, touching only what changed. */
function place(box: HTMLElement, p: ReturnType<typeof measure>) {
  const st = box.style;
  const set = (k: "visibility" | "height" | "transform" | "opacity" | "clipPath", v: string) => void (st[k] !== v && (st[k] = v));
  if (!p) return set("visibility", "hidden");
  set("visibility", p.visible ? "visible" : "hidden");
  set("height", p.height);
  set("transform", p.transform);
  set("opacity", p.opacity);
  set("clipPath", p.clip);
}

export function PieceLayer() {
  const [keys, setKeys] = useState<string[]>([]);
  const [live, setLive] = useState<string[]>([]);
  const boxes = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    let raf = 0;
    const frame = () => {
      const entries = [...boxes.current];
      const placements = entries.map(([key]) => measure(slots.get(key))); // all reads, then all writes
      entries.forEach(([, box], i) => place(box, placements[i]));
      // Pages without a piece: the loop sleeps until a slot appears.
      raf = slots.size ? requestAnimationFrame(frame) : 0;
    };
    changed = () => {
      setKeys((k) => (pieces.size > k.length ? [...pieces.keys()] : k)); // once made, a piece is kept
      setLive([...slots.keys()]);
      if (!raf) raf = requestAnimationFrame(frame);
    };
    changed();
    return () => {
      cancelAnimationFrame(raf);
      changed = () => {};
    };
  }, []);

  return keys.map((key) => {
    const piece = pieces.get(key)!;
    const active = live.includes(key);
    // The half the slot sits in: a click on the piece opens it (after the stone's spin starts),
    // and hovering the piece keeps the half's hover state.
    const half = () => slots.get(key)?.closest<HTMLElement>("a");
    return (
      <div
        key={key}
        ref={(el) => void (el ? boxes.current.set(key, el) : boxes.current.delete(key))}
        className="fixed left-0 top-0 z-20 origin-center will-change-transform"
        style={{ visibility: "hidden", width: BASE }}
        onClick={() => half()?.click()}
        onPointerEnter={() => half()?.setAttribute("data-hover", "")}
        onPointerLeave={() => half()?.removeAttribute("data-hover")}
      >
        {"ring" in piece ? (
          <Ring3DLazy stone={piece.ring} active={active} className="absolute inset-0" />
        ) : (
          <Diamond3DLazy cut={piece.cut} color={piece.color} active={active} className="absolute inset-0" />
        )}
      </div>
    );
  });
}
