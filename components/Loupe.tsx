"use client";

import { useEffect, useRef } from "react";

const SIZE = 168; // lens diameter, CSS px
const ZOOM = 2.5;

type Media = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;

/** Source size and how the element lays it out (object-fit), so the lens samples the right pixels. */
function layout(el: Media, box: DOMRect) {
  const nw = el instanceof HTMLImageElement ? el.naturalWidth : el instanceof HTMLVideoElement ? el.videoWidth : el.width;
  const nh = el instanceof HTMLImageElement ? el.naturalHeight : el instanceof HTMLVideoElement ? el.videoHeight : el.height;
  if (!nw || !nh) return null;
  const fit = el instanceof HTMLCanvasElement ? "fill" : getComputedStyle(el).objectFit;
  if (fit === "cover" || fit === "contain") {
    const s = fit === "cover" ? Math.max(box.width / nw, box.height / nh) : Math.min(box.width / nw, box.height / nh);
    return { sx: s, sy: s, ox: box.left + (box.width - nw * s) / 2, oy: box.top + (box.height - nh * s) / 2 };
  }
  return { sx: box.width / nw, sy: box.height / nh, ox: box.left, oy: box.top };
}

/** The media actually showing under the pointer inside a [data-loupe] area (a playing video wins over its poster image). */
function sourceAt(x: number, y: number): Media | null {
  for (const area of document.querySelectorAll<HTMLElement>("[data-loupe]")) {
    const r = area.getBoundingClientRect();
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
    const media = [...area.querySelectorAll<Media>("video, canvas, img")].filter((m) => {
      const b = m.getBoundingClientRect();
      if (x < b.left || x > b.right || y < b.top || y > b.bottom) return false;
      if (m instanceof HTMLVideoElement) return m.readyState >= 2 && Number(getComputedStyle(m).opacity) > 0.5;
      return true;
    });
    return media.find((m) => m instanceof HTMLVideoElement) ?? media.find((m) => m instanceof HTMLCanvasElement) ?? media[0] ?? null;
  }
  return null;
}

/**
 * A jeweller's loupe that replaces the cursor over stones ([data-loupe] areas) and magnifies whatever
 * is under it: photos, stone videos and the live 3D diamonds. Fine pointers only; decorative.
 */
export function Loupe() {
  const lens = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = lens.current!;
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = cv.height = SIZE * dpr;

    const pointer = { x: -999, y: -999 };
    const pos = { x: -999, y: -999 };
    let shown = false;
    let raf = 0;

    const frame = () => {
      const src = sourceAt(pointer.x, pointer.y);
      const want = !!src;
      if (want !== shown) {
        shown = want;
        if (want) el.dataset.on = "";
        else delete el.dataset.on;
        if (want && pos.x < -900) Object.assign(pos, pointer);
      }
      const k = reduce ? 1 : 0.35;
      pos.x += (pointer.x - pos.x) * k;
      pos.y += (pointer.y - pos.y) * k;
      el.style.transform = `translate3d(${pos.x - SIZE / 2}px, ${pos.y - SIZE / 2}px, 0)`;

      if (src) {
        const map = layout(src, src.getBoundingClientRect());
        ctx.fillStyle = "#f4f0e8";
        ctx.fillRect(0, 0, cv.width, cv.height);
        if (map) {
          // Source pixels under the lens centre, and how many of them fit in the lens at this zoom.
          const cx = (pos.x - map.ox) / map.sx;
          const cy = (pos.y - map.oy) / map.sy;
          const w = SIZE / ZOOM / map.sx;
          const h = SIZE / ZOOM / map.sy;
          try {
            ctx.drawImage(src, cx - w / 2, cy - h / 2, w, h, 0, 0, cv.width, cv.height);
          } catch {}
        }
      }
      raf = shown || Math.abs(pointer.x - pos.x) > 0.5 ? requestAnimationFrame(frame) : 0;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.dataset.loupe = ""; // enables cursor: none over [data-loupe] areas
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      delete document.documentElement.dataset.loupe;
    };
  }, []);

  return (
    <div ref={lens} aria-hidden className="loupe pointer-events-none fixed left-0 top-0 z-[60]" style={{ width: SIZE, height: SIZE }}>
      <div className="loupe-glass relative size-full overflow-hidden rounded-full">
        <canvas ref={canvas} className="size-full" />
        {/* glass: a soft highlight and a faint inner shadow at the rim */}
        <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgb(255_255_255/0.35),transparent_38%)] shadow-[inset_0_0_18px_4px_rgb(36_21_25/0.25)]" />
      </div>
    </div>
  );
}
