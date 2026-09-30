"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import type { Dictionary } from "@/lib/dictionaries/en";
import { languageNames, locales, localePath, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { SiteMenu } from "./SiteMenu";
import { useStore } from "./Store";

const icon = "size-5 stroke-current fill-none [stroke-width:1.5]";

export function Header({ lang, t, sellLines, buyLine }: { lang: Locale; t: Dictionary["nav"]; sellLines: string[]; buyLine: string }) {
  const menu = useRef<HTMLDialogElement>(null);
  const { cart, wishlist } = useStore();
  const href = (path: string) => localePath(lang, path);

  return (
    <header
      // One header for every page: fully transparent, white text over the dark site. Same width as the page (wrap).
      className="fixed inset-x-0 top-0 z-40 bg-transparent"
    >
      <div className="wrap grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex items-center gap-4 sm:gap-6">
          <button type="button" onClick={() => menu.current?.showModal()} className="flex items-center gap-2 py-2 text-sm tracking-[0.04em] hover:text-burgundy">
            <svg viewBox="0 0 24 24" className={icon} aria-hidden><path d="M4 8h16M4 16h16" /></svg>
            <span className="sr-only sm:not-sr-only">{t.menu}</span>
          </button>
          {/* Shop opens a small menu on hover or keyboard focus; clicking still goes to the whole shop. */}
          <div className="group/shop relative hidden md:block">
            <Link href={href("/shop/")} className="block py-2 text-sm tracking-[0.04em] hover:text-burgundy">
              {t.shop}
            </Link>
            <ul className="invisible absolute left-0 top-full min-w-44 translate-y-1 border border-line bg-ivory py-2 opacity-0 shadow-[0_12px_30px_-18px_rgb(36_21_25/0.35)] transition-all duration-200 group-focus-within/shop:visible group-focus-within/shop:translate-y-0 group-focus-within/shop:opacity-100 group-hover/shop:visible group-hover/shop:translate-y-0 group-hover/shop:opacity-100">
              {[t.buyLinks[1], t.buyLinks[0]].map(([label, path]) => (
                <li key={path}>
                  <Link href={href(path)} className="block px-4 py-2 text-sm hover:bg-ivory-deep hover:text-burgundy">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <Link href={href("/about-sothis-diamonds/")} className="hidden py-2 text-sm tracking-[0.04em] hover:text-burgundy md:block">
            {t.about}
          </Link>
        </div>

        {/* A plain link: a full page load, so the homepage always starts fresh (loader, opening, choice). */}
        <a href={href("/")} className="shrink-0" aria-label={site.name}>
          <Logo className="h-8 w-auto sm:h-11" />
        </a>

        <div className="flex items-center justify-end gap-2 sm:gap-5">
          <Link href={href("/sell-diamond/")} className="hidden border-b border-white/70 pb-0.5 text-sm tracking-[0.04em] text-burgundy hover:border-burgundy lg:block">
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

      <SiteMenu dialog={menu} lang={lang} t={t} sellLines={sellLines} buyLine={buyLine} />
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

export function LanguageLinks({ lang, label }: { lang: Locale; label: string }) {
  const router = useRouter();
  return (
    <nav aria-label={label} className="flex flex-wrap gap-1">
      {locales.map((l) => (
        <Link
          key={l}
          href={localePath(l, "/")}
          onClick={(e) => {
            // Same page in the other language, from the page's hreflang alternates; home is the fallback.
            const alt = document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${l}"]`);
            if (!alt || e.metaKey || e.ctrlKey) return;
            e.preventDefault();
            router.push(new URL(alt.href).pathname);
          }}
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

/** The Sothis logo (gold mark; white lettering by default, burgundy with onLight). */
export function Logo({ className, alt = "", onLight = false }: { className: string; alt?: string; onLight?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element -- vector logo from the old site: white lettering on the obsidian site, burgundy on light surfaces
  return <img src={onLight ? "/brand/logo-burgundy.svg" : "/brand/logo.svg"} alt={alt} width={170} height={45} className={className} />;
}
