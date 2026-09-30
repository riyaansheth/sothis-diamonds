"use client";

import Image from "next/image";
import { useRef } from "react";
import { seg, setVars, useScrub } from "./useScrub";

// Where things sit in the two photographs (both 2000px squares), as fractions of the image.
const CUT = { x: 0.485, y: 0.385, w: 0.29 }; // the centre stone in the product photo
const WORN = { x: 0.4875, y: 0.4, w: 0.0825, posX: 0.45, posY: 0.4 }; // the stone on the hand; object-position
const INSET = 0.16; // the product photo's inset inside the plate

/**
 * Chapter 06. The same ring, first on the inspection surface, then worn. As the visitor scrolls, the
 * plate carries the ring left onto the hand in the worn photograph, which opens around it, and the
 * plate dissolves so the ring is simply being worn. Both are the shop's own photographs of one piece;
 * nothing claims to document a restoration.
 */
export function NewChapter({ inspected, worn, t }: { inspected: string; worn: string; t: { title: string; body: string; inspection: string } }) {
  const root = useRef<HTMLElement>(null);

  useScrub(root, (p, pinned) => {
    const el = root.current;
    const plate = el?.querySelector<HTMLElement>("[data-plate]");
    const stage = plate?.closest<HTMLElement>("[data-stage]");
    if (!el || !plate || !stage) return;
    if (!pinned) {
      setVars(el, { "--light": 1, "--plate": 1, "--copy": 1, "--fly-x": "0px", "--fly-y": "0px", "--fly-s": 1 });
      return;
    }
    // The stone in the plate, and the stone on the hand, in the stage's pixels.
    const W = stage.offsetWidth;
    const H = stage.offsetHeight;
    const P = plate.offsetWidth;
    const inner = P * (1 - 2 * INSET);
    const from = { x: W / 2 - P / 2 + P * INSET + CUT.x * inner, y: H / 2 - P / 2 + P * INSET + CUT.y * inner, w: CUT.w * inner };
    const box = W * 0.6; // the worn photo's width; it is cover-fitted
    const side = Math.max(box, H);
    const to = { x: (box - side) * WORN.posX + WORN.x * side, y: (H - side) * WORN.posY + WORN.y * side, w: WORN.w * side };
    const f = seg(p, 0.05, 0.42);
    setVars(el, {
      "--fly-x": `${((to.x - from.x) * f).toFixed(1)}px`,
      "--fly-y": `${((to.y - from.y) * f).toFixed(1)}px`,
      "--fly-s": 1 + (to.w / from.w - 1) * f,
      "--ring-x": `${to.x.toFixed(1)}px`,
      "--ring-y": `${to.y.toFixed(1)}px`,
      "--light": seg(p, 0.25, 0.65),
      "--plate": 1 - seg(p, 0.4, 0.52),
      "--copy": seg(p, 0.6, 0.85),
    });
  });

  return (
    <section ref={root} className="burgundy-tint-strong relative motion-safe:lg:h-[240vh]" aria-labelledby="chapter-title">
      <div data-stage className="relative overflow-hidden motion-safe:lg:sticky motion-safe:lg:top-0 lg:h-screen">
        {/* Inspection: the ring on a measured surface. */}
        <div aria-hidden className="relative aspect-square bg-[#3a0a17] bg-[url(/brand/bg-inspection.webp)] bg-cover bg-center lg:absolute lg:inset-0 lg:aspect-auto">
          {/* The ring, cut out of its studio photo, on the measured surface. */}
          <div
            data-plate
            className="absolute left-1/2 top-1/2 z-10 aspect-square w-[64%] -translate-x-1/2 -translate-y-1/2 lg:w-[min(34vw,70vh)]"
            style={{
              opacity: "var(--plate, 1)",
              transformOrigin: `${(INSET + CUT.x * (1 - 2 * INSET)) * 100}% ${(INSET + CUT.y * (1 - 2 * INSET)) * 100}%`,
              transform: "translate(var(--fly-x, 0px), var(--fly-y, 0px)) scale(var(--fly-s, 1))",
            }}
          >
            <div className="absolute inset-[16%]">
              <Image src={inspected} alt="" fill unoptimized className="object-contain drop-shadow-[0_20px_30px_rgb(0_0_0/0.45)]" />
            </div>
          </div>
          <p className="absolute left-6 top-24 text-xs font-semibold uppercase tracking-[0.14em] text-platinum-2">{t.inspection}</p>
        </div>

        {/* Presentation: the same ring, worn, opening around the stone as the plate arrives on it. */}
        <div className="new-chapter-reveal relative aspect-[4/5] overflow-hidden sm:aspect-[16/10] lg:absolute lg:inset-y-0 lg:left-0 lg:right-[40%] lg:aspect-auto">
          <Image src={worn} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" style={{ objectPosition: `${WORN.posX * 100}% ${WORN.posY * 100}%` }} />
          {/* Keeps the header legible where it sits over the photograph. */}
          <span aria-hidden className="absolute inset-x-0 top-0 hidden h-32 bg-gradient-to-b from-black/45 to-transparent lg:block" />
        </div>

        <div className="wrap relative flex py-16 lg:absolute lg:inset-y-0 lg:left-[60%] lg:right-0 lg:mx-0 lg:max-w-none lg:items-center lg:px-12 lg:py-0 xl:px-16" style={{ opacity: "var(--copy, 1)" }}>
          <div className="min-w-0 max-w-md" style={{ transform: "translateY(calc((1 - var(--copy, 1)) * 2rem))" }}>
            <h2 id="chapter-title" className="font-display text-[2.75rem] leading-[1.05] sm:text-6xl lg:text-[2.4rem] xl:text-[2.9rem]">{t.title}</h2>
            <p className="mt-6 text-lg text-platinum-2">{t.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
