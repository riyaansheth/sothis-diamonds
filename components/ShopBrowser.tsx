"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useRef, type ReactNode } from "react";
import type { Dictionary } from "@/lib/dictionaries/en";
import type { Product } from "@/lib/products";
import { site } from "@/lib/site";
import { ProductCard } from "./ProductCard";
import { useStore } from "./Store";

type T = Dictionary["shop"];
export type ShopItem = Product & { href: string };

const SORTS = ["default", "popularity", "newest", "price-asc", "price-desc", "carat"] as const;
const PER_PAGE = [12, 24, 48] as const;
const WHITE = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O-P", "Q-R", "S-T", "U-V", "W-X", "Y-Z", "Y"];
const CLARITY = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"];

const carat = (p: Product) => Number.parseFloat(p.attributes.carat ?? "") || 0;
const isFancy = (p: Product) => (p.attributes.color ?? "").toLowerCase().startsWith("fancy");
const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

/**
 * Filters, sort and pagination for the shop, categories and tags. All state lives in the URL
 * (?shape=Round,Pear&carat=1-3&sort=price-asc&page=2), so results can be shared and survive "back".
 */
export function ShopBrowser({ items, t, card }: { items: ShopItem[]; t: T; card: Dictionary["stones"] }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const { currency } = useStore();
  const drawer = useRef<HTMLDialogElement>(null);

  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (!("page" in patch)) next.delete("page");
    const q = next.toString();
    // Native history update: Next keeps useSearchParams in sync, with no server round trip per change.
    window.history.replaceState(null, "", q ? `${pathname}?${q}` : pathname);
  };
  const toggle = (key: string, value: string) => {
    const cur = list(params.get(key));
    set({ [key]: (cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value]).join(",") || null });
  };

  // Options offered = only values that exist in this listing.
  const options = useMemo(() => {
    const uniq = (f: (p: Product) => string | undefined, order?: string[]) => {
      const vals = [...new Set(items.map(f).filter((v): v is string => Boolean(v)))];
      return order ? vals.sort((a, b) => order.indexOf(a) - order.indexOf(b)) : vals.sort();
    };
    const carats = items.map(carat).filter(Boolean);
    const prices = items.map((p) => p.price ?? 0).filter(Boolean);
    return {
      shape: uniq((p) => p.attributes.shape),
      color: [...uniq((p) => (isFancy(p) ? undefined : p.attributes.color), WHITE), ...(items.some(isFancy) ? ["fancy"] : [])],
      clarity: uniq((p) => p.attributes.clarity, CLARITY),
      cut: uniq((p) => p.attributes.cut),
      lab: uniq((p) => p.attributes.lab),
      carat: carats.length ? [Math.floor(Math.min(...carats) * 10) / 10, Math.ceil(Math.max(...carats) * 10) / 10] : null,
      price: prices.length ? [Math.floor(Math.min(...prices) / 100) * 100, Math.ceil(Math.max(...prices) / 100) * 100] : null,
    };
  }, [items]);

  const filters = {
    shape: list(params.get("shape")),
    color: list(params.get("color")),
    clarity: list(params.get("clarity")),
    cut: list(params.get("cut")),
    lab: list(params.get("lab")),
    carat: params.get("carat")?.split("-").map(Number) ?? null,
    price: params.get("price")?.split("-").map(Number) ?? null,
    stock: params.get("stock") === "1",
  };
  const sort = (SORTS as readonly string[]).includes(params.get("sort") ?? "") ? (params.get("sort") as (typeof SORTS)[number]) : "default";
  const perPage = PER_PAGE.find((n) => String(n) === params.get("per")) ?? 12;
  const page = Math.max(1, Number(params.get("page")) || 1);

  const results = useMemo(() => {
    const out = items.filter((p) => {
      const a = p.attributes;
      if (filters.shape.length && !filters.shape.includes(a.shape ?? "")) return false;
      if (filters.color.length && !filters.color.some((c) => (c === "fancy" ? isFancy(p) : a.color === c))) return false;
      if (filters.clarity.length && !filters.clarity.includes(a.clarity ?? "")) return false;
      if (filters.cut.length && !filters.cut.includes(a.cut ?? "")) return false;
      if (filters.lab.length && !filters.lab.includes(a.lab ?? "")) return false;
      if (filters.carat && (carat(p) < filters.carat[0] || carat(p) > filters.carat[1])) return false;
      if (filters.price && ((p.price ?? 0) < filters.price[0] || (p.price ?? 0) > filters.price[1])) return false;
      if (filters.stock && !p.in_stock) return false;
      return true;
    });
    const by: Record<(typeof SORTS)[number], (a: Product, b: Product) => number> = {
      // Jewellery first, then diamonds (the order of the Shop menu).
      default: (a, b) => Number(a.categories.includes("Diamonds")) - Number(b.categories.includes("Diamonds")),
      popularity: (a, b) => (b.sales ?? 0) - (a.sales ?? 0),
      newest: (a, b) => b.created.localeCompare(a.created),
      "price-asc": (a, b) => (a.price ?? 0) - (b.price ?? 0),
      "price-desc": (a, b) => (b.price ?? 0) - (a.price ?? 0),
      carat: (a, b) => carat(b) - carat(a),
    };
    return out.sort(by[sort]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- filters are derived from params
  }, [items, params, sort]);

  const pages = Math.max(1, Math.ceil(results.length / perPage));
  const shown = results.slice((Math.min(page, pages) - 1) * perPage, Math.min(page, pages) * perPage);
  const active = ["shape", "color", "clarity", "cut", "lab", "carat", "price", "stock"].filter((k) => params.get(k)).length;
  const rate = currency === "EUR" ? site.eurPerUsd : 1;

  const panel = (
    <div className="space-y-8">
      <Group title={t.filters.shape}>
        {options.shape.map((v) => <Chip key={v} on={filters.shape.includes(v)} onClick={() => toggle("shape", v)}>{v}</Chip>)}
      </Group>
      {options.carat && (
        <Group title={t.filters.carat}>
          <Range min={options.carat[0]} max={options.carat[1]} step={0.01} value={filters.carat ?? options.carat} format={(v) => `${v.toFixed(2)} ct`} onChange={(v) => set({ carat: `${v[0]}-${v[1]}` })} />
        </Group>
      )}
      {options.price && (
        <Group title={t.filters.price}>
          <Range
            min={options.price[0]}
            max={options.price[1]}
            step={100}
            value={filters.price ?? options.price}
            format={(v) => new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-IE", { style: "currency", currency, maximumFractionDigits: 0 }).format(v * rate)}
            onChange={(v) => set({ price: `${v[0]}-${v[1]}` })}
          />
        </Group>
      )}
      <Group title={t.filters.color}>
        {options.color.map((v) => <Chip key={v} on={filters.color.includes(v)} onClick={() => toggle("color", v)}>{v === "fancy" ? t.filters.fancy : v}</Chip>)}
      </Group>
      <Group title={t.filters.clarity}>
        {options.clarity.map((v) => <Chip key={v} on={filters.clarity.includes(v)} onClick={() => toggle("clarity", v)}>{v}</Chip>)}
      </Group>
      {options.cut.length > 0 && (
        <Group title={t.filters.cut}>
          {options.cut.map((v) => <Chip key={v} on={filters.cut.includes(v)} onClick={() => toggle("cut", v)}>{v}</Chip>)}
        </Group>
      )}
      <Group title={t.filters.lab}>
        {options.lab.map((v) => <Chip key={v} on={filters.lab.includes(v)} onClick={() => toggle("lab", v)}>{v}</Chip>)}
      </Group>
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" checked={filters.stock} onChange={() => set({ stock: filters.stock ? null : "1" })} className="size-4 accent-burgundy" />
        {t.filters.inStock}
      </label>
      {active > 0 && (
        <button type="button" onClick={() => window.history.replaceState(null, "", pathname)} className="text-sm text-burgundy underline underline-offset-4">
          {t.clear}
        </button>
      )}
    </div>
  );

  return (
    <div className="grid gap-12 lg:grid-cols-[16rem_1fr]">
      <aside aria-label={t.filtersTitle} className="hidden lg:block">{panel}</aside>

      <dialog ref={drawer} aria-label={t.filtersTitle} className="ml-auto mr-0 h-dvh max-h-none w-[min(24rem,90vw)] bg-ivory p-6 text-ink backdrop:bg-ink/30">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl">{t.filtersTitle}</h2>
          <button type="button" onClick={() => drawer.current?.close()} className="text-sm">{t.close}</button>
        </div>
        {panel}
        <button type="button" onClick={() => drawer.current?.close()} className="btn btn-primary mt-10 w-full">
          {t.showResults.replace("{n}", String(results.length))}
        </button>
      </dialog>

      <div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line pb-4 text-sm">
          <p aria-live="polite" className="mr-auto text-platinum-2">{t.count.replace("{n}", String(results.length))}</p>
          <button type="button" onClick={() => drawer.current?.showModal()} className="btn btn-secondary min-h-10 lg:hidden">
            {t.filtersTitle}{active ? ` (${active})` : ""}
          </button>
          <label className="flex items-center gap-2">
            <span className="text-platinum-2">{t.sortLabel}</span>
            <select value={sort} onChange={(e) => set({ sort: e.target.value === "default" ? null : e.target.value })} className="field min-h-10 w-auto py-0">
              {SORTS.map((s) => <option key={s} value={s}>{t.sort[s]}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-platinum-2">{t.perPage}</span>
            <select value={perPage} onChange={(e) => set({ per: e.target.value === "12" ? null : e.target.value })} className="field min-h-10 w-auto py-0">
              {PER_PAGE.map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
        </div>

        {shown.length ? (
          <ul className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} href={p.href} t={card} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-24 text-center">
            <p className="font-display text-2xl">{t.empty}</p>
            <button type="button" onClick={() => window.history.replaceState(null, "", pathname)} className="btn btn-secondary mt-8">{t.clear}</button>
          </div>
        )}

        {pages > 1 && (
          <nav aria-label={t.pagination} className="mt-16 flex flex-wrap justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                aria-current={n === Math.min(page, pages) ? "page" : undefined}
                onClick={() => {
                  set({ page: n === 1 ? null : String(n) });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="grid size-11 place-items-center border border-line text-sm hover:border-burgundy aria-[current=page]:border-burgundy aria-[current=page]:bg-wine aria-[current=page]:text-on-accent"
              >
                {n}
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold">{title}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className="border border-line px-3 py-1.5 text-sm transition-colors hover:border-burgundy aria-pressed:border-wine aria-pressed:bg-wine aria-pressed:text-on-accent">
      {children}
    </button>
  );
}

/** Two-handle range: two native sliders on one track (keyboard and screen-reader friendly). */
function Range({ min, max, step, value, format, onChange }: { min: number; max: number; step: number; value: number[]; format: (v: number) => string; onChange: (v: [number, number]) => void }) {
  const [lo, hi] = [Math.max(min, value[0]), Math.min(max, value[1])];
  const pct = (v: number) => ((v - min) / (max - min || 1)) * 100;
  return (
    <div className="w-full">
      <div className="relative h-6">
        <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
        <div className="absolute top-1/2 h-px bg-burgundy" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} />
        <input type="range" aria-label="minimum" min={min} max={max} step={step} value={lo} onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])} className="range-thumb absolute inset-0 w-full" />
        <input type="range" aria-label="maximum" min={min} max={max} step={step} value={hi} onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo)])} className="range-thumb absolute inset-0 w-full" />
      </div>
      <p className="mt-1 flex justify-between text-xs text-platinum-2">
        <span>{format(lo)}</span>
        <span>{format(hi)}</span>
      </p>
    </div>
  );
}
