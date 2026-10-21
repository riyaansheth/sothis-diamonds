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

/** Puts a box over its slot: same place and scale, the slot's opacity, clipped as the slot is. */
function follow(box: HTMLElement, slot: HTMLElement | undefined) {
  const w = slot?.offsetWidth ?? 0;
  const h = slot?.offsetHeight ?? 0;
  if (!slot || !w || !h) {
    box.style.visibility = "hidden";
    return;
  }
  const r = slot.getBoundingClientRect();
  const s = r.width / w;
  let opacity = 1;
  let clip = { top: r.top, left: r.left, bottom: r.bottom, right: r.right };
  for (let el: HTMLElement | null = slot; el && el !== document.body; el = el.parentElement) {
    const cs = getComputedStyle(el);
    opacity *= Number(cs.opacity);
    if (el !== slot && cs.overflow !== "visible") {
      const a = el.getBoundingClientRect();
      clip = { top: Math.max(clip.top, a.top), left: Math.max(clip.left, a.left), bottom: Math.min(clip.bottom, a.bottom), right: Math.min(clip.right, a.right) };
    }
  }
  const st = box.style;
  st.visibility = opacity > 0.01 && clip.right > clip.left && clip.bottom > clip.top ? "visible" : "hidden";
  if (st.width !== `${w}px`) st.width = `${w}px`;
  if (st.height !== `${h}px`) st.height = `${h}px`;
  st.transform = `translate(${r.left + r.width / 2 - w / 2}px, ${r.top + r.height / 2 - h / 2}px) scale(${s})`;
  st.opacity = String(opacity);
  // clip-path is in the box's own (unscaled) pixels.
  st.clipPath = `inset(${(clip.top - r.top) / s}px ${(r.right - clip.right) / s}px ${(r.bottom - clip.bottom) / s}px ${(clip.left - r.left) / s}px)`;
}

export function PieceLayer() {
  const [keys, setKeys] = useState<string[]>([]);
  const [live, setLive] = useState<string[]>([]);
  const boxes = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    changed = () => {
      setKeys((k) => (pieces.size > k.length ? [...pieces.keys()] : k)); // once made, a piece is kept
      setLive([...slots.keys()]);
    };
    changed();
    let raf = 0;
    const frame = () => {
      for (const [key, box] of boxes.current) follow(box, slots.get(key));
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
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
        className="fixed left-0 top-0 z-20 origin-center"
        style={{ visibility: "hidden" }}
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
