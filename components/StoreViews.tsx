"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { Dictionary } from "@/lib/dictionaries/en";
import { Price, useStore } from "./Store";

/** What the store pages need from a product; built on the server from the export. */
export type Item = { id: number; name: string; href: string; image?: string; price: number; inStock: boolean; specs: [string, string][] };
type T = Dictionary["store"];

const byIds = (items: Item[], ids: number[]) => ids.map((id) => items.find((i) => i.id === id)).filter((i): i is Item => Boolean(i));

function Empty({ text, cta, href }: { text: string; cta: string; href: string }) {
  return (
    <div className="mt-12 border-y border-line py-20 text-center">
      <p className="mx-auto max-w-md text-lg text-platinum-2">{text}</p>
      <Link href={href} className="btn btn-primary mt-8">{cta}</Link>
    </div>
  );
}

function Thumb({ item, size = "size-24" }: { item: Item; size?: string }) {
  return (
    <Link href={item.href} className={`relative block shrink-0 overflow-hidden bg-ivory-deep ${size}`}>
      {item.image && <Image src={item.image} alt="" fill sizes="96px" className="object-cover" />}
    </Link>
  );
}

function Lines({ items, t, onRemove }: { items: Item[]; t: T; onRemove?: (id: number) => void }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((i) => (
        <li key={i.id} className="flex gap-5 py-5">
          <Thumb item={i} size={onRemove ? "size-24" : "size-16"} />
          <div className="min-w-0 flex-1">
            <Link href={i.href} className="font-display text-lg hover:text-burgundy">{i.name}</Link>
            <p className="mt-1 text-sm text-platinum-2">{i.specs.slice(2, 5).map(([, v]) => v).join(", ")}</p>
            {!i.inStock && <p className="mt-1 text-sm text-burgundy">{t.unavailable}</p>}
            {onRemove && (
              <button type="button" onClick={() => onRemove(i.id)} className="mt-2 text-sm text-platinum-2 underline-offset-4 hover:text-ink hover:underline">{t.remove}</button>
            )}
          </div>
          <p className={`font-semibold ${i.inStock ? "" : "text-platinum-2 line-through"}`}><Price usd={i.price} /></p>
        </li>
      ))}
    </ul>
  );
}

const subtotal = (items: Item[]) => items.filter((i) => i.inStock).reduce((sum, i) => sum + i.price, 0);

export function CartView({ items, t, links }: { items: Item[]; t: T; links: { shop: string; checkout: string } }) {
  const { cart, toggle } = useStore();
  const lines = byIds(items, cart);
  if (!lines.length) return <Empty text={t.cartEmpty} cta={t.browse} href={links.shop} />;
  const buyable = lines.some((i) => i.inStock);
  return (
    <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_22rem]">
      <Lines items={lines} t={t} onRemove={(id) => toggle("cart", id)} />
      <aside className="h-fit bg-ivory-deep p-6">
        <div className="flex justify-between text-lg">
          <span>{t.subtotal}</span>
          <span className="font-semibold"><Price usd={subtotal(lines)} /></span>
        </div>
        <p className="mt-4 text-sm text-platinum-2">{t.insured}</p>
        {buyable && <Link href={links.checkout} className="btn btn-primary mt-6 w-full">{t.toCheckout}</Link>}
      </aside>
    </div>
  );
}

function Field({ label, name, type = "text", auto, half }: { label: string; name: string; type?: string; auto?: string; half?: boolean }) {
  return (
    <label className={`block ${half ? "" : "sm:col-span-2"}`}>
      <span className="mb-1.5 block text-sm text-platinum-2">{label}</span>
      <input className="field" name={name} type={type} autoComplete={auto} required maxLength={200} />
    </label>
  );
}

function Address({ t, prefix, auto }: { t: T; prefix: string; auto: string }) {
  const f = t.fields;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label={f.firstName} name={`${prefix}firstName`} auto={`${auto} given-name`} half />
      <Field label={f.lastName} name={`${prefix}lastName`} auto={`${auto} family-name`} half />
      <Field label={f.address} name={`${prefix}address`} auto={`${auto} street-address`} />
      <Field label={f.postcode} name={`${prefix}postcode`} auto={`${auto} postal-code`} half />
      <Field label={f.city} name={`${prefix}city`} auto={`${auto} address-level2`} half />
      <Field label={f.country} name={`${prefix}country`} auto={`${auto} country-name`} />
    </div>
  );
}

export function CheckoutView({ items, t, links }: { items: Item[]; t: T; links: { shop: string; contact: string } }) {
  const { cart, currency } = useStore();
  const [same, setSame] = useState(true);
  const [status, setStatus] = useState<"idle" | "sending" | "not-connected" | "failed">("idle");
  const lines = byIds(items, cart).filter((i) => i.inStock);
  if (!lines.length) return <Empty text={t.cartEmpty} cta={t.browse} href={links.shop} />;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch("/api/checkout/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, sameBilling: same, currency, items: lines.map((i) => i.id) }),
      });
      const data = await res.json();
      setStatus(data.connected === false ? "not-connected" : "failed");
    } catch {
      setStatus("failed");
    }
  }

  const section = (title: string, children: ReactNode) => (
    <section className="border-t border-line pt-6">
      <h2 className="mb-5 text-2xl">{title}</h2>
      {children}
    </section>
  );

  return (
    <form onSubmit={submit} className="mt-12 grid gap-12 lg:grid-cols-[1fr_24rem]">
      <div className="space-y-10">
        {section(
          t.contact,
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.fields.email} name="email" type="email" auto="email" half />
            <Field label={t.fields.phone} name="phone" type="tel" auto="tel" half />
          </div>,
        )}
        {section(t.shipping, <Address t={t} prefix="ship_" auto="shipping" />)}
        {section(
          t.billing,
          <>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={same} onChange={(e) => setSame(e.target.checked)} className="size-4 accent-wine" />
              {t.sameBilling}
            </label>
            {!same && <div className="mt-5"><Address t={t} prefix="bill_" auto="billing" /></div>}
          </>,
        )}
      </div>

      <aside className="h-fit bg-ivory-deep p-6 lg:sticky lg:top-28">
        <h2 className="text-2xl">{t.summary}</h2>
        <div className="mt-4"><Lines items={lines} t={t} /></div>
        <div className="mt-5 flex justify-between text-lg">
          <span>{t.subtotal}</span>
          <span className="font-semibold"><Price usd={subtotal(lines)} /></span>
        </div>
        <p className="mt-4 text-sm text-platinum-2">{t.insured}</p>
        <button type="submit" disabled={status === "sending"} className="btn btn-primary mt-6 w-full">{status === "sending" ? t.checking : t.pay}</button>
        {(status === "not-connected" || status === "failed") && (
          <div role="status" className="mt-5 border-l-2 border-burgundy pl-4 text-sm">
            <p>{status === "not-connected" ? t.notConnected : t.failed}</p>
            <Link href={links.contact} className="mt-2 inline-block font-semibold text-burgundy underline-offset-4 hover:underline">{t.contactUs}</Link>
          </div>
        )}
      </aside>
    </form>
  );
}

export function WishlistView({ items, t, links }: { items: Item[]; t: T; links: { shop: string } }) {
  const { wishlist, toggle } = useStore();
  const saved = byIds(items, wishlist);
  if (!saved.length) return <Empty text={t.wishlistEmpty} cta={t.browse} href={links.shop} />;
  return <div className="mt-12"><Lines items={saved} t={t} onRemove={(id) => toggle("wishlist", id)} /></div>;
}

export function CompareView({ items, t, links }: { items: Item[]; t: T; links: { shop: string } }) {
  const { compare, toggle } = useStore();
  const stones = byIds(items, compare);
  if (!stones.length) return <Empty text={t.compareEmpty} cta={t.browse} href={links.shop} />;
  const labels = [...new Set(stones.flatMap((s) => s.specs.map(([k]) => k)))];
  const value = (s: Item, k: string) => s.specs.find(([l]) => l === k)?.[1] ?? "—";

  return (
    <div className="mt-12">
      {stones.length > 1 && <p className="mb-6 text-sm text-platinum-2">{t.compareNote}</p>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-36" />
              {stones.map((s) => (
                <th key={s.id} scope="col" className="px-3 pb-5 text-left align-top font-normal">
                  <Thumb item={s} size="aspect-square w-full max-w-40" />
                  <Link href={s.href} className="mt-3 block font-display text-lg hover:text-burgundy">{s.name}</Link>
                  <p className="mt-1 font-semibold"><Price usd={s.price} /></p>
                  <button type="button" onClick={() => toggle("compare", s.id)} className="mt-2 text-platinum-2 underline-offset-4 hover:text-ink hover:underline">{t.remove}</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.map((k) => {
              const differs = stones.length > 1 && new Set(stones.map((s) => value(s, k))).size > 1;
              return (
                <tr key={k} className={`border-t border-line ${differs ? "bg-ivory-deep" : ""}`}>
                  <th scope="row" className="py-3 pl-3 text-left font-normal text-platinum-2">{k}</th>
                  {stones.map((s) => <td key={s.id} className={`px-3 py-3 ${differs ? "font-semibold" : ""}`}>{value(s, k)}</td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AccountView({ t }: { t: Dictionary["account"] }) {
  const [said, setSaid] = useState(false);
  // TODO(auth): sign-in, registration and Google sign-in, once the provider is chosen with the client.
  const stop = (e: React.FormEvent) => {
    e.preventDefault();
    setSaid(true);
  };
  const input = (label: string, name: string, type: string, auto: string) => (
    <label className="block">
      <span className="mb-1.5 block text-sm text-platinum-2">{label}</span>
      <input className="field" name={name} type={type} autoComplete={auto} required />
    </label>
  );

  return (
    <div className="mt-12">
      <button type="button" onClick={() => setSaid(true)} className="btn btn-secondary w-full max-w-md gap-3">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
          <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.3-4.7 3.3-8z" />
          <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23z" />
          <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8l3.7-2.8z" />
          <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z" />
        </svg>
        {t.google}
      </button>
      {said && <p role="status" className="mt-5 max-w-md border-l-2 border-burgundy pl-4 text-sm">{t.notConnected}</p>}

      <div className="mt-12 grid gap-12 border-t border-line pt-12 lg:grid-cols-2">
        <form onSubmit={stop} className="space-y-4">
          <h2 className="text-2xl">{t.signIn}</h2>
          {input(t.email, "email", "email", "email")}
          {input(t.password, "password", "password", "current-password")}
          <button type="submit" className="btn btn-primary">{t.signIn}</button>
        </form>
        <form onSubmit={stop} className="space-y-4">
          <h2 className="text-2xl">{t.register}</h2>
          {input(t.name, "name", "text", "name")}
          {input(t.email, "email", "email", "email")}
          {input(t.password, "password", "password", "new-password")}
          <button type="submit" className="btn btn-secondary">{t.register}</button>
        </form>
      </div>

      <section className="mt-16 border-t border-line pt-12">
        <h2 className="text-2xl">{t.orders}</h2>
        <p className="mt-3 text-platinum-2">{t.ordersEmpty}</p>
      </section>
    </div>
  );
}
