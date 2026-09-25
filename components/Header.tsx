"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/dictionaries/en";
import { languageNames, locales, localePath, type Locale } from "@/lib/i18n";
import { site, telHref } from "@/lib/site";
import { CurrencySwitch, useStore } from "./Store";

const icon = "size-5 stroke-current fill-none [stroke-width:1.5]";

export function Header({ lang, t }: { lang: Locale; t: Dictionary["nav"] }) {
  const menu = useRef<HTMLDialogElement>(null);
  const { cart, wishlist } = useStore();
  const href = (path: string) => localePath(lang, path);
  const pathname = usePathname();
  // Pages can ask for a fully transparent header ([data-header="clear"]); while an element marked
  // [data-header-dark] is behind it, its text and logo turn ivory.
  const [mode, setMode] = useState<"glass" | "clear" | "clear-dark">("glass");

  useEffect(() => {
    const clear = document.querySelector("[data-header='clear']");
    const dark = document.querySelector<HTMLElement>("[data-header-dark]");
    const update = () => setMode(!clear ? "glass" : dark && dark.getBoundingClientRect().bottom > 40 ? "clear-dark" : "clear");
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [pathname]);

  const close = () => menu.current?.close();

  return (
    <header
      // Frosted ivory glass on every page, so each page's colours show through it; fully clear where asked.
      data-mode={mode}
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${mode === "glass" ? "border-b border-ivory/40 bg-ivory/55 backdrop-blur-xl backdrop-saturate-150" : "border-b border-transparent bg-transparent"} ${mode === "clear-dark" ? "text-on-accent [&_.nav-cta]:text-on-accent" : ""}`}
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

        <Link href={href("/")} className="shrink-0" aria-label={site.name}>
          <Logo className="h-8 w-auto sm:h-11" light={mode === "clear-dark"} />
        </Link>

        <div className="flex items-center justify-end gap-2 sm:gap-5">
          <Link href={href("/sell-diamond/")} className="nav-cta hidden border-b border-champagne pb-0.5 text-sm tracking-[0.04em] text-burgundy hover:border-burgundy lg:block">
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

/** The Sothis logo (burgundy lettering, gold mark). */
export function Logo({ className, alt = "", light = false }: { className: string; alt?: string; light?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element -- vector logo from the old site; `light` = white lettering for dark backgrounds
  return <img src={light ? "/brand/logo.svg" : "/brand/logo-burgundy.svg"} alt={alt} width={170} height={45} className={className} />;
}
