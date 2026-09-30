"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type RefObject } from "react";
import type { Dictionary } from "@/lib/dictionaries/en";
import { localePath, type Locale } from "@/lib/i18n";
import { OUTLINES } from "@/lib/shapes";
import { site, telHref } from "@/lib/site";
import { Diamond3DLazy } from "./Diamond3DLazy";
import { LanguageLinks, Logo } from "./Header";
import { CurrencySwitch } from "./Store";

type Tab = "sell" | "buy";
type Item = { label: string; path: string; line: string; image: string };

// Previews use existing site media only.
const SELL_IMAGES = ["/brand/why/why-3.webp", "/brand/why/why-4.webp", "/brand/why/why-5.webp", "/brand/why/why-6.webp", "/brand/why/why-1.webp"];
const BUY_IMAGES = ["/brand/why/why-2.webp", "/media/2025/10/17-1.jpg", "/brand/why/why-3.webp"];
const SHAPES = ["Round", "Pear", "Radiant", "Cushion", "Heart", "Oval", "Emerald", "Asscher"];
const TOP_GUIDES = 3;

/**
 * The full-screen menu: Sell / Buy tabs with a numbered list, a preview that follows the hovered
 * link (a turning stone at rest), guide pills, and a footer strip with contact, language and currency.
 */
export function SiteMenu({ dialog, lang, t, sellLines, buyLine }: {
  dialog: RefObject<HTMLDialogElement | null>;
  lang: Locale;
  t: Dictionary["nav"];
  sellLines: string[]; // one line per sell category, in order
  buyLine: string;
}) {
  const href = (p: string) => localePath(lang, p);
  const pathname = usePathname();
  const inShop = /\/(shop|boutique|winkel|tienda|negozio|product|product-category|produit|produkt|prodotto|producto)/.test(pathname ?? "");
  const [tab, setTab] = useState<Tab>("sell");
  const [hovered, setHovered] = useState<number | null>(null);
  const [allGuides, setAllGuides] = useState(false);
  const [open, setOpen] = useState(false);

  // Open on the tab that matches where the visitor is.
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const onToggle = () => {
      const isOpen = d.open;
      setOpen(isOpen);
      if (isOpen) {
        setTab(inShop ? "buy" : "sell");
        setHovered(null);
        setAllGuides(false);
      }
    };
    const mo = new MutationObserver(onToggle);
    mo.observe(d, { attributes: true, attributeFilter: ["open"] });
    return () => mo.disconnect();
  }, [dialog, inShop]);

  const items: Record<Tab, Item[]> = {
    sell: t.sellLinks.map(([label, path], i) => ({ label, path, line: sellLines[i] ?? "", image: SELL_IMAGES[i % SELL_IMAGES.length] })),
    buy: t.buyLinks.map(([label, path], i) => ({ label, path, line: buyLine, image: BUY_IMAGES[i % BUY_IMAGES.length] })),
  };
  const list = items[tab];
  const preview = hovered !== null ? list[hovered] : null;
  const close = () => dialog.current?.close();
  const guides = allGuides ? t.resourceLinks : t.resourceLinks.slice(0, TOP_GUIDES);

  const onTabKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setTab((x) => (x === "sell" ? "buy" : "sell"));
      setHovered(null);
    }
  };

  return (
    <dialog ref={dialog} aria-label={t.menu} className="site-menu m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-ink backdrop:bg-black/60">
      <div className="site-menu-panel burgundy-tint relative flex min-h-full flex-col overflow-y-auto">
        <div className="wrap flex min-h-dvh flex-col py-6">
          <div className="flex h-14 items-center justify-between">
            <Logo className="h-9 w-auto sm:h-11" alt={site.name} />
            <button type="button" onClick={close} aria-label={t.close} className="menu-close grid size-11 place-items-center">
              <svg viewBox="0 0 24 24" className="size-6 fill-none stroke-current [stroke-width:1.2]" aria-hidden><path d="M5 5l14 14M19 5L5 19" /></svg>
            </button>
          </div>

          <div className="grid flex-1 gap-12 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-16" onClick={(e) => (e.target as HTMLElement).closest("a") && close()}>
            <div>
              {/* Sell / Buy */}
              <div role="tablist" aria-label={t.menu} onKeyDown={onTabKey} className="flex gap-8 border-b border-line">
                {(["sell", "buy"] as const).map((x) => (
                  <button
                    key={x}
                    type="button"
                    role="tab"
                    aria-selected={tab === x}
                    tabIndex={tab === x ? 0 : -1}
                    onClick={() => {
                      setTab(x);
                      setHovered(null);
                    }}
                    className="menu-tab relative -mb-px whitespace-nowrap pb-3 font-display text-3xl text-ink/45 transition-colors aria-selected:text-ink sm:text-4xl"
                  >
                    {x === "sell" ? t.sellTab : t.buyTab}
                  </button>
                ))}
              </div>

              <ol key={tab} role="tabpanel" data-open={open ? "" : undefined} className="menu-list mt-8" onMouseLeave={() => setHovered(null)}>
                {list.map((item, i) => (
                  <li key={item.path} style={{ ["--i" as string]: i }}>
                    <Link
                      href={href(item.path)}
                      onMouseEnter={() => setHovered(i)}
                      onFocus={() => setHovered(i)}
                      className="menu-link group grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 py-3 sm:grid-cols-[3rem_1fr]"
                    >
                      <span className="font-display text-lg tabular-nums text-platinum-2">{String(i + 1).padStart(2, "0")}</span>
                      <span className="menu-name relative w-fit font-display text-3xl sm:text-4xl">{item.label}</span>
                      <span className="relative size-12 overflow-hidden sm:hidden">
                        <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>

              {/* Buy: shop by shape */}
              {tab === "buy" && (
                <ul className="menu-shapes mt-8 flex flex-wrap gap-2">
                  {SHAPES.map((shape) => (
                    <li key={shape}>
                      <Link href={`${href("/shop/")}?shape=${shape}`} title={shape} className="flex items-center gap-2 border border-line px-3 py-2 text-sm hover:border-ink">
                        <svg viewBox="-50 -50 100 100" className="size-5 fill-none stroke-current [stroke-width:5]" aria-hidden><path d={OUTLINES[shape]} /></svg>
                        {shape}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {/* Guides */}
              <div className="mt-10">
                <p className="text-sm text-platinum-2">{t.resources}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {guides.map(([label, path]) => (
                    <li key={path}>
                      <Link href={href(path)} className="block rounded-full border border-line px-4 py-2 text-sm hover:border-ink">{label}</Link>
                    </li>
                  ))}
                  {!allGuides && t.resourceLinks.length > TOP_GUIDES && (
                    <li>
                      <button type="button" onClick={() => setAllGuides(true)} className="px-4 py-2 text-sm underline underline-offset-4">{t.allGuides}</button>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Preview: follows the hovered link; a turning stone at rest (desktop only). */}
            <div aria-hidden className="relative hidden overflow-hidden lg:block">
              <div className={`absolute inset-0 ${tab === "buy" ? "bg-[url(/brand/bg-buy-burgundy.webp)]" : "bg-[url(/brand/bg-sell-black.webp)]"} bg-cover bg-center`} />
              <div className={`menu-rest absolute inset-[12%] transition-opacity duration-500 ${preview ? "opacity-0" : "opacity-100"}`}>
                {open && <Diamond3DLazy cut={tab === "buy" ? "asscher" : "round"} color={tab === "buy" ? "#d4b9cb" : "#ffffff"} className="absolute inset-0" />}
              </div>
              {list.map((item, i) => (
                <div key={item.path} data-on={hovered === i ? "" : undefined} className="menu-preview absolute inset-0">
                  <Image src={item.image} alt="" fill sizes="40vw" className="object-cover" />
                  <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent" />
                  <p className="absolute inset-x-8 bottom-8 max-w-sm text-lg text-white">{item.line}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-x-12 gap-y-6 border-t border-line pt-6 text-sm text-platinum-2">
            <nav className="flex gap-6 text-base text-ink" onClick={(e) => (e.target as HTMLElement).closest("a") && close()}>
              <Link href={href("/about-sothis-diamonds/")} className="menu-foot">{t.about}</Link>
              <Link href={href("/contact-us/")} className="menu-foot">{t.contact}</Link>
              <Link href={href("/blog/")} className="menu-foot">{t.blog}</Link>
            </nav>
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
      </div>
    </dialog>
  );
}
