"use client";

import Link from "next/link";
import type { RefObject } from "react";
import type { Dictionary } from "@/lib/dictionaries/en";
import { localePath, type Locale } from "@/lib/i18n";
import { site, telHref } from "@/lib/site";
import { LanguageLinks, Logo } from "./Header";
import { CurrencySwitch } from "./Store";

/** The full-screen menu: four plain columns of links, then contact, language and currency. */
export function SiteMenu({ dialog, lang, t }: { dialog: RefObject<HTMLDialogElement | null>; lang: Locale; t: Dictionary["nav"] }) {
  const href = (p: string) => localePath(lang, p);
  const close = () => dialog.current?.close();

  const column = (title: string, links: string[][]) => (
    <div>
      <h2 className="font-sans text-sm text-platinum-2">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map(([label, path]) => (
          <li key={path}>
            <Link href={href(path)} className="text-lg hover:underline hover:underline-offset-4">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <dialog ref={dialog} aria-label={t.menu} className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-ink backdrop:bg-black/60">
      <div className="burgundy-tint flex min-h-full flex-col overflow-y-auto">
        <div className="wrap flex min-h-dvh flex-col py-6">
          <div className="flex h-14 items-center justify-between">
            <Logo className="h-9 w-auto sm:h-11" alt={site.name} />
            <button type="button" onClick={close} aria-label={t.close} className="grid size-11 place-items-center">
              <svg viewBox="0 0 24 24" className="size-6 fill-none stroke-current [stroke-width:1.2]" aria-hidden><path d="M5 5l14 14M19 5L5 19" /></svg>
            </button>
          </div>

          <div className="grid flex-1 content-start gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4" onClick={(e) => (e.target as HTMLElement).closest("a") && close()}>
            {column(t.sellToUs, t.sellLinks)}
            {column(t.buyFromUs, t.buyLinks)}
            {column(t.resources, t.resourceLinks)}
            {column(site.name, [[t.about, "/about-sothis-diamonds/"], [t.contact, "/contact-us/"], [t.blog, "/blog/"]])}
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
      </div>
    </dialog>
  );
}
