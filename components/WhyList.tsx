"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type WhyStone = { src: string; name: string; href: string };

/**
 * Why Sothis: a pinned stone on the left, the reasons on the right. The row at the reading line
 * (or the hovered/focused one) is active; its stone opens in a circle and its gold rule draws in.
 */
export function WhyList({ items, stones, view }: { items: string[][]; stones: WhyStone[]; view: string }) {
  const [active, setActive] = useState(0);
  const rows = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    rows.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, []);

  return (
    <div className="grid lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <div className="sticky top-20 h-[calc(100dvh-5rem)] overflow-hidden bg-ivory-deep">
          {stones.map((s, i) => (
            <div key={s.src} data-on={i === active ? "" : undefined} aria-hidden={i !== active} className="why-stone absolute inset-0">
              {/* Cropped inward: the old product photos carry filename marks in their corners. */}
              <div className="absolute -inset-[9%]">
                <Image src={s.src} alt="" fill sizes="60vw" className="object-cover" />
              </div>
              <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-6 bg-gradient-to-b from-ink/50 to-transparent p-8 pb-24 text-on-accent">
                <p className="font-display text-2xl">{s.name}</p>
                <Link href={s.href} tabIndex={i === active ? 0 : -1} className="border-b border-champagne pb-0.5 text-sm">{view}</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ol className="wrap py-10 lg:py-[20vh] lg:pl-16 lg:pr-[max(1rem,calc((100vw-80rem)/2))]">
        {items.map(([title, body], i) => (
          <li
            key={title}
            ref={(el) => {
              rows.current[i] = el;
            }}
            data-i={i}
            data-on={i === active ? "" : undefined}
            tabIndex={0}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            className="why-item relative grid grid-cols-[3.5rem_1fr] gap-x-4 py-10 outline-none sm:grid-cols-[5.5rem_1fr] sm:gap-x-6"
          >
            <span aria-hidden className="why-n font-display text-3xl leading-none sm:text-6xl">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3 className="text-2xl sm:text-3xl">{title}</h3>
              <p className="mt-3 max-w-md text-platinum-2">{body}</p>
            </div>
            <span aria-hidden className="why-rule absolute inset-x-0 bottom-0 h-px" />
          </li>
        ))}
      </ol>
    </div>
  );
}
