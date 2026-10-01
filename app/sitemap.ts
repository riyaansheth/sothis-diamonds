import type { MetadataRoute } from "next";
import { pageBySlug, postBySlug, posts, termBySlug } from "@/lib/content";
import { locales } from "@/lib/i18n";
import { allProducts } from "@/lib/products";
import { allRoutes, alternates, type Route } from "@/lib/routes";
import { indexable } from "@/lib/seo";
import { site } from "@/lib/site";

const hasPosts = (slug: string) => {
  const name = termBySlug("category", slug)?.name;
  return posts.some((p) => name && p.categories.includes(name));
};

const modified = (route: Route) => {
  const date =
    route.kind === "post" ? postBySlug(route.slug)?.modified
    : route.kind === "page" ? pageBySlug(route.slug)?.modified
    : route.kind === "product" ? allProducts.find((p) => p.slug === route.slug)?.created
    : undefined;
  return date ? new Date(date.replace(" ", "T")) : undefined;
};

// Every indexable page in every language, each with its hreflang alternates (and x-default).
export default function sitemap(): MetadataRoute.Sitemap {
  const home = Object.fromEntries(locales.map((l) => [l, `${site.url}${l === "en" ? "/" : `/${l}/`}`]));
  const homeAlt = { ...home, "x-default": home.en };
  const entries: MetadataRoute.Sitemap = locales.map((l) => ({ url: home[l], alternates: { languages: homeAlt } }));
  for (const { lang, route } of allRoutes()) {
    if (route.kind === "category" && !hasPosts(route.slug)) continue; // redirects to the blog
    if (!indexable(route)) continue;
    const alt = Object.fromEntries(Object.entries(alternates(route)).map(([l, p]) => [l, `${site.url}${p}`]));
    entries.push({
      url: alt[lang],
      lastModified: modified(route),
      alternates: { languages: { ...alt, "x-default": alt.en } },
    });
  }
  return entries;
}
