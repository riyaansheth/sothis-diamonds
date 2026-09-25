import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { pageBySlug, postBySlug, posts, seoForUrl, termBySlug, type Doc } from "@/lib/content";
import { getDictionary, hasLocale, localePath, type Locale } from "@/lib/i18n";
import { ProductPage } from "@/components/templates/ProductPage";
import { AboutPage } from "@/components/templates/AboutPage";
import { ContactPage } from "@/components/templates/ContactPage";
import { LEGAL, LegalPage } from "@/components/templates/LegalPage";
import { ArticlePage, GUIDES } from "@/components/templates/ArticlePage";
import { BlogPage } from "@/components/templates/BlogPage";
import { CalculatorPage } from "@/components/templates/CalculatorPage";
import { SellPage } from "@/components/templates/SellPage";
import { STORE_PAGES, StorePage } from "@/components/templates/StorePage";
import { ShopPage } from "@/components/templates/ShopPage";
import { allProducts, displayName } from "@/lib/products";
import { allRoutes, alternates, href, resolve, type Route } from "@/lib/routes";

// Every old URL (pages, posts, products, categories, tags) in every language, resolved from the export.

// Known URLs are pre-built; unknown ones reach the page and call notFound(), so the styled 404
// renders inside the site layout (a router-level 404 would skip the layout).

// Old sell URLs -> the item type their page and form are for.
const SELL_PAGES: Record<string, "diamond" | "coloured" | "watch" | "antique" | "other" | "general"> = {
  "sell-diamond": "diamond",
  "sell-colored-stones": "coloured",
  "sell-watches": "watch",
  "antique-jewellery": "antique",
  "sell-other-jewellery": "other",
  "sell-your-diamond": "general",
};

export function generateStaticParams() {
  return allRoutes({ withAliases: true }).map(({ lang, path }) => ({ lang, slug: path.split("/").filter(Boolean) }));
}

function load(lang: string, slug: string[]) {
  if (!hasLocale(lang)) return null;
  const found = resolve(lang, slug);
  if (!found) return null;
  return { lang, ...found };
}

function titleFor(route: Route) {
  switch (route.kind) {
    case "page":
      return pageBySlug(route.slug)?.title;
    case "post":
      return postBySlug(route.slug)?.title;
    case "product": {
      const p = allProducts.find((x) => x.slug === route.slug);
      return p && displayName(p);
    }
    case "product_cat":
      return termBySlug("product_cat", route.slug)?.name.replace("Jewelery", "Jewellery");
    case "product_tag":
      return termBySlug("product_tag", route.slug)?.name;
    case "category":
      return termBySlug("category", route.slug)?.name;
  }
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[...slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const found = load(lang, slug);
  if (!found) return {};
  const { route } = found;
  const seo = seoForUrl(href("en", route)) ?? {};
  const title = seo.title || `${titleFor(route) ?? ""} | Sothis Diamonds`;
  return {
    title,
    description: seo.description,
    alternates: { canonical: href(found.lang, route), languages: { ...alternates(route), "x-default": href("en", route) } },
    robots: seo.noindex ? { index: false } : undefined,
  };
}

export default async function CatchAll({ params }: PageProps<"/[lang]/[...slug]">) {
  const { lang, slug } = await params;
  const found = load(lang, slug);
  if (!found) notFound();
  if (found.redirect) permanentRedirect(found.redirect);
  const { route } = found;

  const t = getDictionary(found.lang);
  const home = { label: t.product.breadcrumbHome, href: localePath(found.lang, "/") };
  const shop = { label: t.product.breadcrumbShop, href: localePath(found.lang, "/shop/") };

  if (route.kind === "product") {
    const product = allProducts.find((p) => p.slug === route.slug);
    if (!product) notFound();
    return <ProductPage product={product} lang={found.lang} />;
  }
  if (route.kind === "product_cat" || route.kind === "product_tag") {
    const term = termBySlug(route.kind, route.slug);
    if (!term) notFound();
    const title = titleFor(route) ?? term.name;
    const inTerm = route.kind === "product_cat" ? (p: (typeof allProducts)[number]) => p.categories.includes(term.name) : (p: (typeof allProducts)[number]) => (p.tags ?? []).includes(term.name);
    return <ShopPage lang={found.lang} title={title} filter={inTerm} crumbs={[home, shop, { label: title, href: href(found.lang, route) }]} />;
  }
  if (route.kind === "page" && SELL_PAGES[route.slug]) {
    const kind = SELL_PAGES[route.slug];
    return <SellPage lang={found.lang} kind={kind} crumbs={[home, { label: t.sellPage.pages[kind].title, href: href(found.lang, route) }]} />;
  }
  if (route.kind === "page" && route.slug === "diamond-valuation-calculator") {
    return <CalculatorPage lang={found.lang} crumbs={[home, { label: t.calculator.title, href: href(found.lang, route) }]} />;
  }
  if (route.kind === "page" && route.slug === "shop") {
    return <ShopPage lang={found.lang} title={t.shop.title} filter={() => true} crumbs={[home, { label: t.shop.title, href: href(found.lang, route) }]} />;
  }

  const blog = { label: t.blog.title, href: localePath(found.lang, "/blog/") };
  if (route.kind === "page" && Object.hasOwn(STORE_PAGES, route.slug)) {
    return <StorePage lang={found.lang} kind={STORE_PAGES[route.slug as keyof typeof STORE_PAGES]} path={href(found.lang, route)} />;
  }
  if (route.kind === "page" && route.slug === "blog") return <BlogPage lang={found.lang} crumbs={[home, blog]} />;
  if (route.kind === "category") {
    const name = titleFor(route);
    // Categories without posts are leftovers from the old site's spam; send them to the blog.
    if (!name || !posts.some((p) => p.categories.includes(name))) permanentRedirect(localePath(found.lang, "/blog/"));
    return <BlogPage lang={found.lang} category={name} crumbs={[home, blog, { label: name, href: href(found.lang, route) }]} />;
  }
  if (route.kind === "post") {
    const doc = postBySlug(route.slug);
    if (!doc) notFound();
    return <ArticlePage doc={doc} lang={found.lang} kind="post" crumbs={[home, blog, { label: doc.title, href: href(found.lang, route) }]} />;
  }
  if (route.kind === "page" && GUIDES.includes(route.slug)) {
    const doc = pageBySlug(route.slug)!;
    return <ArticlePage doc={doc} lang={found.lang} kind="guide" crumbs={[home, { label: doc.title, href: href(found.lang, route) }]} />;
  }

  if (route.kind === "page" && route.slug === "about-sothis-diamonds") {
    return <AboutPage lang={found.lang} crumbs={[home, { label: t.nav.about, href: href(found.lang, route) }]} />;
  }
  if (route.kind === "page" && route.slug === "contact-us") {
    return <ContactPage lang={found.lang} crumbs={[home, { label: t.contact.title, href: href(found.lang, route) }]} />;
  }

  if (route.kind === "page") {
    const doc = pageBySlug(route.slug);
    if (!doc) notFound();
    if (LEGAL.includes(route.slug)) return <LegalPage doc={doc} lang={found.lang} crumbs={[home, { label: doc.title, href: href(found.lang, route) }]} />;
    return <ContentPage doc={doc} />;
  }
  return <Interim title={titleFor(route) ?? ""} lang={found.lang} />;
}

/** Long-form pages (legal and the rest) until each page type gets its own template. */
function ContentPage({ doc }: { doc: Doc }) {
  return (
    <article className="wrap pb-28 pt-36">
      <header className="mx-auto max-w-3xl">
        <h1 className="mt-3 text-4xl sm:text-5xl">{doc.title}</h1>
      </header>
      <div className="prose mx-auto mt-12 max-w-3xl" dangerouslySetInnerHTML={{ __html: doc.content_html }} />
    </article>
  );
}

/** Product, shop and account pages are built in the next phases; until then the URL resolves honestly. */
function Interim({ title, lang }: { title: string; lang: Locale }) {
  const t = getDictionary(lang);
  return (
    <section className="wrap flex min-h-[70vh] flex-col items-center justify-center pt-24 text-center">
      <h1 className="text-4xl sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-md text-platinum-2">{t.notFound.building}</p>
      <Link href={localePath(lang, "/")} className="btn btn-secondary mt-8">{t.notFound.home}</Link>
    </section>
  );
}
