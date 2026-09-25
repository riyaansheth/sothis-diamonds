"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/dictionaries/en";
import { languageNames, locales, localePath, type Locale } from "@/lib/i18n";
import { site, telHref } from "@/lib/site";
import { CurrencySwitch, useStore } from "./Store";

const icon = "size-5 stroke-current fill-none [stroke-width:1.5]";

export function Header({ lang, t }: { lang: Locale; t: Dictionary["nav"] }) {
  const [solid, setSolid] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);
  const { cart, wishlist } = useStore();
  const href = (path: string) => localePath(lang, path);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = () => menu.current?.close();

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${solid ? "border-b border-line bg-ivory/92 backdrop-blur" : "bg-transparent"}`}
    >
      <div className="wrap grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex items-center gap-4 sm:gap-6">
          <button type="button" onClick={() => menu.current?.showModal()} className="flex items-center gap-2 py-2 text-sm tracking-[0.04em] hover:text-burgundy">
            <svg viewBox="0 0 24 24" className={icon} aria-hidden><path d="M4 8h16M4 16h16" /></svg>
            <span className="sr-only sm:not-sr-only">{t.menu}</span>
          </button>
          <Link href={href("/shop/")} className="hidden text-sm tracking-[0.04em] hover:text-burgundy md:block">
            {t.shop}
          </Link>
        </div>

        <Link href={href("/")} className="shrink-0" aria-label={site.name}>
          <Logo className="h-8 w-auto sm:h-11" />
        </Link>

        <div className="flex items-center justify-end gap-2 sm:gap-5">
          <Link href={href("/sell-diamond/")} className="hidden border-b border-champagne pb-0.5 text-sm tracking-[0.04em] text-burgundy hover:border-burgundy lg:block">
            {t.sell}
          </Link>
          <nav aria-label={t.account} className="flex items-center">
            <IconLink href={href("/my-account/")} label={t.account} className="hidden sm:grid">
              <svg viewBox="0 0 24 24" className={icon}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
            </IconLink>
            <IconLink href={href("/wishlist/")} label={t.wishlist} count={wishlist.length}>
              <svg viewBox="0 0 24 24" className={icon}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" /></svg>
            </IconLink>
            <IconLink href={href("/cart/")} label={t.cart} count={cart.length}>
              <svg viewBox="0 0 24 24" className={icon}><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>
            </IconLink>
          </nav>
        </div>
      </div>

      <dialog
        ref={menu}
        aria-label={t.menu}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-ivory text-ink backdrop:bg-ivory"
      >
        <div className="wrap flex min-h-full flex-col py-6">
          <div className="flex h-14 items-center justify-between">
            <Logo className="h-9 w-auto sm:h-11" alt={site.name} />
            <button type="button" onClick={close} className="px-2 py-2 text-sm font-semibold hover:text-burgundy">
              {t.close}
            </button>
          </div>

          <div className="grid flex-1 gap-10 py-12 md:grid-cols-3" onClick={(e) => (e.target as HTMLElement).closest("a") && close()}>
            <MenuGroup title={t.sellToUs} links={t.sellLinks} href={href} large />
            <MenuGroup title={t.buyFromUs} links={t.buyLinks} href={href} large />
            <div className="space-y-10">
              <MenuGroup title={t.resources} links={t.resourceLinks} href={href} />
              <ul className="space-y-2 font-display text-2xl">
                <li><Link href={href("/about-sothis-diamonds/")} className="hover:text-burgundy">{t.about}</Link></li>
                <li><Link href={href("/contact-us/")} className="hover:text-burgundy">{t.contact}</Link></li>
                <li><Link href={href("/blog/")} className="hover:text-burgundy">{t.blog}</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-x-12 gap-y-6 border-t border-line pt-6 text-sm text-platinum-2">
            <address className="not-italic">
              <a href={`mailto:${site.email}`} className="block hover:text-ink">{site.email}</a>
              {site.phones.map((p) => (
                <a key={p} href={telHref(p)} className="block hover:text-ink">{p}</a>
              ))}
            </address>
            <LanguageLinks lang={lang} label={t.language} />
            <CurrencySwitch label={t.currency} />
          </div>
        </div>
      </dialog>
    </header>
  );
}

function IconLink({ href, label, count, className = "grid", children }: { href: string; label: string; count?: number; className?: string; children: React.ReactNode }) {
  return (
    <Link href={href} aria-label={count ? `${label} (${count})` : label} className={`relative size-10 place-items-center rounded-full hover:text-burgundy ${className}`}>
      {children}
      {count ? (
        <span className="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-wine text-[0.625rem] font-bold text-on-accent">{count}</span>
      ) : null}
    </Link>
  );
}

function MenuGroup({ title, links, href, large }: { title: string; links: string[][]; href: (p: string) => string; large?: boolean }) {
  return (
    <div>
      <h2 className="mb-4 font-sans text-sm font-semibold text-platinum-2">{title}</h2>
      <ul className={large ? "space-y-2 font-display text-3xl" : "space-y-1.5"}>
        {links.map(([label, path]) => (
          <li key={path}>
            <Link href={href(path)} className="hover:text-burgundy">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LanguageLinks({ lang, label }: { lang: Locale; label: string }) {
  return (
    <nav aria-label={label} className="flex flex-wrap gap-1">
      {locales.map((l) => (
        <Link
          key={l}
          href={localePath(l, "/")}
          hrefLang={l}
          lang={l}
          aria-current={l === lang ? "true" : undefined}
          title={languageNames[l]}
          className="rounded-full border border-transparent px-2.5 py-1 text-sm uppercase text-platinum-2 hover:text-ink aria-[current]:border-burgundy aria-[current]:text-ink"
        >
          {l}
        </Link>
      ))}
    </nav>
  );
}

/** The Sothis logo (burgundy lettering, gold mark). */
export function Logo({ className, alt = "" }: { className: string; alt?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- vector logo from the old site
  return <img src="/brand/logo-burgundy.svg" alt={alt} width={170} height={45} className={className} />;
}
