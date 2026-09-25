import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { RevealHeading } from "@/components/Motion";
import { ShopBrowser, type ShopItem } from "@/components/ShopBrowser";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { allProducts, productPath, type Product } from "@/lib/products";

/** The shop, a product category or a product tag: same browser, different starting set. */
export function ShopPage({ lang, title, filter, crumbs }: { lang: Locale; title: string; filter: (p: Product) => boolean; crumbs: Crumb[] }) {
  const t = getDictionary(lang);
  const items: ShopItem[] = allProducts.filter(filter).map((p) => ({ ...p, href: productPath(p, lang) }));

  return (
    <section className="wrap pb-28 pt-32">
      <Breadcrumbs items={crumbs} />
      <header className="mt-8 max-w-2xl">
        <RevealHeading lines={[title]} as="h1" className="text-5xl sm:text-6xl" />
        <p className="mt-4 text-platinum-2">{t.shop.intro}</p>
      </header>

      <div className="mt-14">
        {items.length ? (
          <Suspense>
            <ShopBrowser items={items} t={t.shop} card={t.stones} />
          </Suspense>
        ) : (
          <div className="border-t border-line py-24 text-center">
            <p className="mx-auto max-w-md font-display text-2xl">{t.shop.emptyCategory}</p>
            <Link href={localePath(lang, "/contact-us/")} className="btn btn-primary mt-8">{t.shop.enquire}</Link>
          </div>
        )}
      </div>
    </section>
  );
}
