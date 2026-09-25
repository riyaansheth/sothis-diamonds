import type { MetadataRoute } from "next";
import { posts, termBySlug } from "@/lib/content";
import { locales } from "@/lib/i18n";
import { allRoutes, alternates } from "@/lib/routes";
import { site } from "@/lib/site";

const hasPosts = (slug: string) => {
  const name = termBySlug("category", slug)?.name;
  return posts.some((p) => name && p.categories.includes(name));
};

// Every page in every language, each with its hreflang alternates.
export default function sitemap(): MetadataRoute.Sitemap {
  const home = Object.fromEntries(locales.map((l) => [l, `${site.url}${l === "en" ? "/" : `/${l}/`}`]));
  const entries: MetadataRoute.Sitemap = locales.map((l) => ({ url: home[l], alternates: { languages: home } }));
  for (const { lang, route } of allRoutes()) {
    if (route.kind === "category" && !hasPosts(route.slug)) continue; // redirects to the blog
    const alt = alternates(route);
    entries.push({
      url: `${site.url}${alt[lang]}`,
      alternates: { languages: Object.fromEntries(Object.entries(alt).map(([l, p]) => [l, `${site.url}${p}`])) },
    });
  }
  return entries;
}
