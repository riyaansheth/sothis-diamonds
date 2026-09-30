"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Crop } from "../CroppedImage";
import { ProductCard } from "../ProductCard";
import type { Dictionary } from "@/lib/dictionaries/en";
import type { Product } from "@/lib/products";

type Item = { product: Product; href: string; crop?: Crop };
type Filter = "all" | "diamonds" | "jewellery" | string; // or a shape name

/**
 * The collection on a burgundy stage: filter chips and a centred carousel. The card in the middle is
 * the focus (larger, fully bright); Next/Previous move exactly one card, and swiping or scrolling
 * snaps a card to the centre, which then becomes the focus. Cards rise in on first view and after
 * each filter change.
 */
export function CollectionStage({ items, total, shopHref, line, t, card }: {
  items: Item[];
  total: number;
  shopHref: string;
  line: string;
  t: Dictionary["buy"];
  card: Dictionary["stones"];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [dealt, setDealt] = useState(0); // bumps on each filter change, so the cards re-deal
  const [shown, setShown] = useState(false);
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLUListElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  const shapes = useMemo(() => [...new Set(items.map((i) => i.product.attributes.shape).filter((s): s is string => !!s))], [items]);
  const visible = items.filter(({ product: p }) =>
    filter === "all" ? true
    : filter === "diamonds" ? p.categories.includes("Diamonds")
    : filter === "jewellery" ? !p.categories.includes("Diamonds")
    : p.attributes.shape === filter,
  );

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setShown(true);
        io.disconnect();
      }
    }, { threshold: 0.2 });
    if (root.current) io.observe(root.current);
    return () => io.disconnect();
  }, []);

  // The focus is whichever card's centre is nearest the rail's centre (after a click, a swipe or a scroll).
  useEffect(() => {
    const ul = rail.current;
    if (!ul) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = ul.getBoundingClientRect().left + ul.clientWidth / 2;
      let best = 0;
      let dist = Infinity;
      [...ul.children].forEach((li, i) => {
        const r = li.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - mid);
        if (d < dist) [dist, best] = [d, i];
      });
      setActive(best);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    ul.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      ul.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [dealt]);

  const count = visible.length;
  useEffect(() => {
    bar.current?.style.setProperty("transform", `scaleX(${count > 1 ? Math.max(0.04, active / (count - 1)) : 1})`);
  }, [active, count]);

  const go = (i: number) => {
    const ul = rail.current;
    const li = ul?.children[i] as HTMLElement | undefined;
    if (!ul || !li) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ul.scrollTo({ left: li.offsetLeft + li.offsetWidth / 2 - ul.clientWidth / 2, behavior: reduce ? "auto" : "smooth" });
    setActive(i);
  };
  const pick = (f: Filter) => {
    setFilter(f);
    setDealt((n) => n + 1);
  };

  // Start on the third piece, so there are cards either side of the focus (or the last, if fewer).
  // The journey is hidden until Buy is chosen, so wait until the rail has a real width.
  useEffect(() => {
    const ul = rail.current;
    if (!ul) return;
    let done = false;
    const centre = () => {
      if (done || !ul.clientWidth) return;
      done = true;
      const start = Math.min(2, ul.children.length - 1);
      const li = ul.children[start] as HTMLElement | undefined;
      if (!li) return;
      ul.scrollLeft = li.offsetLeft + li.offsetWidth / 2 - ul.clientWidth / 2;
      setActive(start);
    };
    const ro = new ResizeObserver(centre);
    ro.observe(ul);
    return () => ro.disconnect();
  }, [dealt]);
  const pad = (n: number) => String(n).padStart(2, "0");

  const chips: [Filter, string][] = [["all", t.all], ["diamonds", t.diamonds], ["jewellery", t.jewellery], ...shapes.map((s): [Filter, string] => [s, s])];

  return (
    <section ref={root} data-shown={shown ? "" : undefined} className="buy-collection relative overflow-hidden py-28 lg:py-36" aria-labelledby="buy-collection-title">
      <span aria-hidden className="buy-collection-bg absolute inset-0 -z-10" />
      <div className="wrap">
        <h2 id="buy-collection-title" className="text-4xl sm:text-6xl">{t.collectionTitle}</h2>
        <p className="mt-5 max-w-xl text-platinum-2">{line}</p>

        <div role="radiogroup" aria-label={t.filterLabel} className="mt-10 flex flex-wrap gap-2">
          {chips.map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={filter === value}
              onClick={() => pick(value)}
              className="border border-line px-4 py-2 text-sm transition-colors hover:border-ink aria-checked:border-ink aria-checked:bg-ink aria-checked:text-ivory"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <ul
        ref={rail}
        key={dealt}
        tabIndex={0}
        aria-label={t.collectionTitle}
        onKeyDown={(e) => {
          const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (!step) return;
          e.preventDefault();
          go(Math.min(count - 1, Math.max(0, active + step)));
        }}
        className="rail buy-rail mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto py-8 outline-none sm:gap-10"
      >
        {visible.map(({ product, href, crop }, i) => (
          <li
            key={product.id}
            data-on={i === active ? "" : undefined}
            // A side card comes to the centre on the first click; a click on the focused card opens it.
            onClickCapture={(e) => {
              if (i !== active && !(e.target as HTMLElement).closest("button")) {
                e.preventDefault();
                e.stopPropagation();
                go(i);
              }
            }}
            className="buy-card w-[78vw] shrink-0 snap-center sm:w-[22rem]"
            style={{ ["--i" as string]: Math.min(i, 5) }}
          >
            <div className="buy-card-inner">
              <ProductCard product={product} href={href} t={card} crop={crop} />
            </div>
          </li>
        ))}
      </ul>

      <div className="wrap mt-6 flex flex-wrap items-center gap-6">
        <div aria-hidden className="relative h-px flex-1 bg-line">
          <span ref={bar} className="absolute inset-0 origin-left bg-ink transition-transform duration-300" />
        </div>
        <p className="font-display text-lg tabular-nums" aria-live="polite">{pad(Math.min(active + 1, count))} / {pad(count)}</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => go(active - 1)} disabled={active <= 0} className="btn btn-secondary disabled:opacity-30" aria-label={t.prev}>
            <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current [stroke-width:1.5]" aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <button type="button" onClick={() => go(active + 1)} disabled={active >= count - 1} className="btn btn-secondary disabled:opacity-30" aria-label={t.next}>
            <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current [stroke-width:1.5]" aria-hidden><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        <Link href={shopHref} className="btn btn-primary">{t.browseAll.replace("{n}", String(total))}</Link>
      </div>
    </section>
  );
}
