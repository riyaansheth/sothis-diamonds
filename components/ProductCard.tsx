"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { Dictionary } from "@/lib/dictionaries/en";
import { displayName, keySpecs, mediaUrl, type Product } from "@/lib/products";
import { Price, useStore } from "./Store";
import { StoneVideo } from "./StoneVideo";

type T = Dictionary["stones"];

export function ProductCard({ product: p, href, t }: { product: Product; href: string; t: T }) {
  const quick = useRef<HTMLDialogElement>(null);
  const name = displayName(p);

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-sm bg-ivory-deep ring-1 ring-line">
        {p.image && (
          <Image src={mediaUrl(p.image)} alt={name} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        )}
        {p.video && (
          <StoneVideo src={mediaUrl(p.video)} playOnHover className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        )}
        <WishlistButton id={p.id} t={t} />
      </div>

      <h3 className="mt-5 text-xl">
        <Link href={href} className="hover:text-burgundy">{name}</Link>
      </h3>
      <Specs product={p} t={t} />
      <p className="mt-auto pt-4 text-lg font-semibold">{p.price ? <Price usd={p.price} /> : null}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <CartButton product={p} t={t} />
        <button type="button" onClick={() => quick.current?.showModal()} className="text-platinum-2 underline-offset-4 hover:text-ink hover:underline">
          {t.quickView}
        </button>
        <CompareButton id={p.id} t={t} />
      </div>

      <dialog
        ref={quick}
        aria-label={name}
        onClick={(e) => e.target === quick.current && quick.current.close()}
        className="m-auto w-[min(56rem,calc(100vw-2rem))] rounded-sm bg-ivory-deep p-0 text-ink ring-1 ring-line backdrop:bg-ivory/80"
      >
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-square bg-ivory-deep">
            {p.video ? (
              <StoneVideo src={mediaUrl(p.video)} poster={p.image ? mediaUrl(p.image) : undefined} className="size-full object-cover" />
            ) : (
              p.image && <Image src={mediaUrl(p.image)} alt={name} fill sizes="28rem" className="object-cover" />
            )}
          </div>
          <div className="flex flex-col p-8">
            <button type="button" onClick={() => quick.current?.close()} className="self-end text-sm text-platinum-2 hover:text-ink">
              {t.close}
            </button>
            <h3 className="mt-2 text-3xl">{name}</h3>
            <Specs product={p} t={t} />
            <p className="mt-4 text-xl font-semibold">{p.price ? <Price usd={p.price} /> : null}</p>
            <div className="mt-auto flex flex-wrap gap-3 pt-8">
              <CartButton product={p} t={t} solid />
              <Link href={href} className="btn btn-secondary">{t.viewStone}</Link>
            </div>
          </div>
        </div>
      </dialog>
    </article>
  );
}

function Specs({ product, t }: { product: Product; t: T }) {
  return (
    <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
      {keySpecs(product).map(([key, value]) => (
        <div key={key} className="contents">
          <dt className="text-platinum-2">{t.specs[key]}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function CartButton({ product, t, solid }: { product: Product; t: T; solid?: boolean }) {
  const { cart, toggle } = useStore();
  if (!product.in_stock) return <span className="text-platinum-2">{t.outOfStock}</span>;
  const inCart = cart.includes(product.id);
  return (
    <button
      type="button"
      aria-pressed={inCart}
      onClick={() => toggle("cart", product.id)}
      className={solid ? "btn btn-primary" : "font-semibold text-burgundy underline-offset-4 hover:underline"}
    >
      {inCart ? t.added : t.addToCart}
    </button>
  );
}

export function CompareButton({ id, t }: { id: number; t: T }) {
  const { compare, toggle } = useStore();
  const on = compare.includes(id);
  return (
    <button type="button" aria-pressed={on} onClick={() => toggle("compare", id)} className="text-platinum-2 underline-offset-4 hover:text-ink hover:underline aria-pressed:text-ink">
      {on ? t.comparing : t.compare}
    </button>
  );
}

export function WishlistButton({ id, t }: { id: number; t: T }) {
  const { wishlist, toggle } = useStore();
  const on = wishlist.includes(id);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? t.wishlisted : t.wishlist}
      onClick={() => toggle("wishlist", id)}
      className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-ivory/70 text-ink backdrop-blur hover:text-burgundy aria-pressed:text-burgundy"
    >
      <svg viewBox="0 0 24 24" className="size-5 stroke-current [stroke-width:1.5]" fill={on ? "currentColor" : "none"} aria-hidden>
        <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
      </svg>
    </button>
  );
}
