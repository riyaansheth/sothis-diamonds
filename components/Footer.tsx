import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/lib/dictionaries/en";
import { localePath, type Locale } from "@/lib/i18n";
import { displayName, mediaUrl, newestProducts } from "@/lib/products";
import { site, telHref } from "@/lib/site";
import { LanguageLinks, Logo } from "./Header";
import { CurrencySwitch, Price } from "./Store";

// Approved design, locked: same footer on every page. Rendered once in app/[lang]/layout.tsx — don't add per-page footers.
export function Footer({ lang, t }: { lang: Locale; t: Dictionary }) {
  const href = (path: string) => localePath(lang, path);
  const f = t.footer;
  const columns: [string, string[][]][] = [
    [f.sell, t.nav.sellLinks],
    [f.shop, t.nav.buyLinks],
    [f.resources, f.resourceLinks],
    [f.company, f.companyLinks],
  ];

  return (
    <footer className="border-t border-line bg-ivory-deep text-sm">
      <div className="wrap grid gap-12 py-16 lg:grid-cols-[1.2fr_2fr]">
        <div className="space-y-6">
          <Logo className="h-11 w-auto" alt={site.name} />
          <p className="max-w-xs text-platinum-2">{f.tagline}</p>
          <address className="space-y-1 not-italic text-platinum-2">
            <a href={site.mapUrl} className="block hover:text-burgundy">
              {site.address.street}, {site.address.postcode} {site.address.city}, {site.address.country}
            </a>
            {site.phones.map((p) => (
              <a key={p} href={telHref(p)} className="block hover:text-burgundy">{p}</a>
            ))}
            <a href={`mailto:${site.email}`} className="block hover:text-burgundy">{site.email}</a>
          </address>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {columns.map(([title, links]) => (
            <nav key={title} aria-label={title}>
              <h2 className="mb-4 font-sans text-sm font-semibold">{title}</h2>
              <ul className="space-y-2 text-platinum-2">
                {links.map(([label, path]) => (
                  <li key={path}><Link href={href(path)} className="hover:text-burgundy">{label}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="wrap border-t border-line py-10">
        <h2 className="mb-5 font-sans text-sm font-semibold">{f.recent}</h2>
        <ul className="grid gap-6 sm:grid-cols-3">
          {newestProducts(3).map((p) => (
            <li key={p.id}>
              <Link href={href(`/product/${p.slug}/`)} className="flex items-center gap-4 hover:text-burgundy">
                {p.image && <Image src={mediaUrl(p.image)} alt="" width={64} height={64} className="size-16 rounded-sm bg-ivory-deep object-cover" />}
                <span>
                  <span className="block">{displayName(p)}</span>
                  <span className="text-platinum-2">{p.price ? <Price usd={p.price} /> : null}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="wrap flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-champagne py-6 text-platinum-2">
        <LanguageLinks lang={lang} label={t.nav.language} />
        <CurrencySwitch label={t.nav.currency} />
        <p className="lg:ml-auto">{f.payments}</p>
        <p className="w-full">© {new Date().getFullYear()} {site.name}. {f.rights}</p>
      </div>
    </footer>
  );
}
