"use client";

import Image from "next/image";
import { useRef } from "react";
import { seg, setVars, useScrub } from "./useScrub";

/**
 * Chapter 06. The same ring, first on the inspection surface, then worn: a soft light opens from
 * the centre and the camera pulls back. Both are the shop's own photographs of one piece; nothing
 * claims to document a restoration.
 */
export function NewChapter({ inspected, worn, t }: { inspected: string; worn: string; t: { title: string; body: string; inspection: string } }) {
  const root = useRef<HTMLElement>(null);

  useScrub(root, (p, pinned) => {
    setVars(root.current, {
      "--light": pinned ? seg(p, 0.12, 0.62) : 1,
      "--pull": pinned ? seg(p, 0.12, 0.9) : 1,
      "--copy": pinned ? seg(p, 0.55, 0.8) : 1,
    });
  });

  return (
    <section ref={root} className="burgundy-tint-strong relative motion-safe:lg:h-[240vh]" aria-labelledby="chapter-title">
      <div className="relative overflow-hidden motion-safe:lg:sticky motion-safe:lg:top-20 lg:h-[calc(100vh-5rem)]">
        {/* Inspection: the ring on a measured surface. */}
        <div aria-hidden className="relative aspect-square lg:absolute lg:inset-0 lg:aspect-auto">
          <span className="anatomy-grid anatomy-grid-light absolute inset-0" />
          {/* The product photo has a white ground, so it sits on a pale inspection plate. */}
          <div className="absolute left-1/2 top-1/2 aspect-square w-[64%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#efe9df] lg:opacity-[calc(1-var(--light,0))] shadow-[0_0_120px_rgb(120_30_50/0.45)] lg:w-[min(34vw,70vh)]">
            <div className="absolute inset-[16%]">
              <Image src={inspected} alt="" fill sizes="40vw" className="object-contain mix-blend-multiply" />
            </div>
          </div>
          <span className="absolute left-1/2 top-[14%] h-[72%] w-px bg-white/10" />
          <span className="absolute left-[14%] top-1/2 h-px w-[72%] bg-white/10" />
          <p className="absolute left-6 top-6 text-xs font-semibold uppercase tracking-[0.14em] text-platinum-2">{t.inspection}</p>
        </div>

        {/* Presentation: the same ring, worn, revealed by the light and settling as the camera pulls back. */}
        <div
          className="new-chapter-reveal relative aspect-[4/5] overflow-hidden sm:aspect-[16/10] lg:absolute lg:inset-y-0 lg:left-0 lg:right-[40%] lg:aspect-auto"
        >
          <div className="absolute inset-0" style={{ transform: "scale(calc(1.3 - 0.3 * var(--pull, 1)))" }}>
            <Image src={worn} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover object-[45%_40%]" />
          </div>
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
