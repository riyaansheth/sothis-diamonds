import "server-only";
import { FRONT_PAGE_SLUG, pages, posts, terms, type Slugs } from "./content";
import { defaultLocale, locales, type Locale } from "./i18n";
import { allProducts } from "./products";

// One route map for every old URL, in every language, built from the export's slugs.
// Keys are "lang:/path/" (path without the language prefix, with a trailing slash).

export type Route =
  | { kind: "page"; slug: string }
  | { kind: "post"; slug: string }
  | { kind: "product"; slug: string }
  | { kind: "product_cat"; slug: string }
  | { kind: "product_tag"; slug: string }
  | { kind: "category"; slug: string };

type Entry = Route & { canonical: boolean };

// The blog-category base was translated on the old site; the shop bases were not.
const CATEGORY_BASE: Record<Locale, string> = { en: "category", fr: "categorie", nl: "categorie", de: "kategorie", it: "categoria", es: "categoria" };

const slugFor = (slugs: Slugs, fallback: string, lang: Locale) => slugs[lang] || fallback;

/** Localised path for a content item, without the language prefix. */
function itemPath(route: Route, slugs: Slugs, lang: Locale) {
  const s = slugFor(slugs, route.slug, lang);
  switch (route.kind) {
    case "page":
    case "post":
      return `/${s}/`;
    case "product":
      return `/product/${s}/`;
    case "product_cat":
      return `/product-category/${s}/`;
    case "product_tag":
      return `/product-tag/${s}/`;
    case "category":
      return `/${CATEGORY_BASE[lang]}/${s}/`;
  }
}

const map = new Map<string, Entry>();
const paths = new Map<string, Record<Locale, string>>(); // "kind:slug" -> localised path per language

function register(route: Route, slugs: Slugs) {
  const perLang = Object.fromEntries(locales.map((l) => [l, itemPath(route, slugs, l)])) as Record<Locale, string>;
  paths.set(`${route.kind}:${route.slug}`, perLang);
  for (const lang of locales) {
    const key = `${lang}:${perLang[lang]}`;
    const existing = map.get(key);
    if (existing?.canonical && (existing.kind !== route.kind || existing.slug !== route.slug)) {
      throw new Error(`Route collision at ${key}: ${existing.kind}:${existing.slug} vs ${route.kind}:${route.slug}`);
    }
    map.set(key, { ...route, canonical: true });
  }
  // English slug typed under another language: redirect to that language's real URL.
  const en = perLang[defaultLocale];
  for (const lang of locales) {
    if (perLang[lang] !== en && !map.has(`${lang}:${en}`)) map.set(`${lang}:${en}`, { ...route, canonical: false });
  }
}

for (const p of pages) if (p.slug !== FRONT_PAGE_SLUG) register({ kind: "page", slug: p.slug }, p.slugs);
for (const p of posts) register({ kind: "post", slug: p.slug }, p.slugs);
for (const p of allProducts) register({ kind: "product", slug: p.slug }, p.slugs ?? {});
for (const t of terms) {
  if (t.taxonomy === "product_cat") register({ kind: "product_cat", slug: t.slug }, t.slugs);
  if (t.taxonomy === "product_tag") register({ kind: "product_tag", slug: t.slug }, t.slugs);
  if (t.taxonomy === "category") register({ kind: "category", slug: t.slug }, t.slugs);
}

const normalise = (segments: string[]) => `/${segments.map(decodeURIComponent).join("/")}/`;

/** What a URL shows. `redirect` is set when the URL is an alias of the real (translated) one. */
export function resolve(lang: Locale, segments: string[]): { route: Route; redirect?: string } | null {
  const entry = map.get(`${lang}:${normalise(segments)}`);
  if (!entry) return null;
  const { canonical, ...route } = entry;
  return canonical ? { route } : { route, redirect: href(lang, route) };
}

/** Full localised URL (with language prefix) for a content item. */
export function href(lang: Locale, route: Route) {
  const p = paths.get(`${route.kind}:${route.slug}`)?.[lang];
  if (!p) throw new Error(`No route for ${route.kind}:${route.slug}`);
  return lang === defaultLocale ? p : `/${lang}${p}`;
}

/**
 * Every URL in every language. Canonical ones render content (and go in the sitemap); with
 * `withAliases`, English-slug aliases are included too so they can be pre-built as redirects.
 */
export function allRoutes({ withAliases = false } = {}) {
  return [...map.entries()]
    .filter(([, e]) => withAliases || e.canonical)
    .map(([key, e]) => {
      const lang = key.slice(0, key.indexOf(":")) as Locale;
      const path = key.slice(key.indexOf(":") + 1);
      return { lang, path, route: { kind: e.kind, slug: e.slug } as Route };
    });
}

/** The same item in every language, for hreflang alternates. */
export const alternates = (route: Route) => Object.fromEntries(locales.map((l) => [l, href(l, route)])) as Record<Locale, string>;
