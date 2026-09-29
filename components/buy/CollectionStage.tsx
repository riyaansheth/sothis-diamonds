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
 * The collection on a burgundy stage: filter chips, a rail of pieces, and a progress line under it.
 * Cards rise in once when the section first comes into view; filtering re-deals them the same way.
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

  // Progress line: how far along the rail the visitor has scrolled (transform only).
  useEffect(() => {
    const ul = rail.current;
    if (!ul) return;
    const update = () => {
      const max = ul.scrollWidth - ul.clientWidth;
      const p = max > 0 ? ul.scrollLeft / max : 1;
      bar.current?.style.setProperty("transform", `scaleX(${Math.max(0.04, p)})`);
    };
    update();
    ul.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      ul.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [filter]);

  const pick = (f: Filter) => {
    setFilter(f);
    setDealt((n) => n + 1);
    rail.current?.scrollTo({ left: 0 });
  };
  const move = (dir: 1 | -1) => rail.current?.scrollBy({ left: dir * rail.current.clientWidth * 0.8, behavior: "smooth" });

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

      <ul ref={rail} key={dealt} className="rail mt-12 flex snap-x snap-mandatory scroll-px-4 gap-8 overflow-x-auto px-4 pb-6 sm:scroll-px-8 sm:px-8">
        {visible.map(({ product, href, crop }, i) => (
          <li key={product.id} className="buy-card w-[78vw] shrink-0 snap-start sm:w-[22rem]" style={{ ["--i" as string]: Math.min(i, 5) }}>
            <ProductCard product={product} href={href} t={card} crop={crop} />
          </li>
        ))}
      </ul>

      <div className="wrap mt-6 flex flex-wrap items-center gap-6">
        <div aria-hidden className="relative h-px flex-1 bg-line">
          <span ref={bar} className="absolute inset-0 origin-left bg-ink transition-transform duration-300" />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => move(-1)} className="btn btn-secondary" aria-label={t.prev}>
            <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current [stroke-width:1.5]" aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <button type="button" onClick={() => move(1)} className="btn btn-secondary" aria-label={t.next}>
            <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current [stroke-width:1.5]" aria-hidden><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        <Link href={shopHref} className="btn btn-primary">{t.browseAll.replace("{n}", String(total))}</Link>
      </div>
    </section>
  );
}
