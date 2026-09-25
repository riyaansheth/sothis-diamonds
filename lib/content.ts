import "server-only";
import pagesData from "@/export/data/pages.json";
import postsData from "@/export/data/posts.json";
import seoData from "@/export/data/seo_by_url.json";
import taxData from "@/export/data/taxonomies.json";
import type { Locale } from "./i18n";

// Server-only access to the exported site content (pages, posts, taxonomies, SEO).

export type Slugs = Partial<Record<Locale, string>>;
export type Seo = { title?: string; description?: string; noindex?: boolean | number; og_image?: string; canonical?: string };

export type Doc = {
  id: number;
  slug: string;
  title: string;
  status: string;
  date: string;
  modified: string;
  excerpt: string;
  content_html: string;
  elementor_text: { widget: string; field: string; text: string }[];
  featured_image: string | null;
  categories: string[];
  tags: string[];
  slugs: Slugs;
  seo: Seo;
};

export type Term = {
  taxonomy: string;
  slug: string;
  name: string;
  description: string;
  parent: number | null;
  count: number;
  slugs: Slugs;
};

const published = (d: Doc) => d.status === "publish" && d.slug !== "";

export const pages = (pagesData as unknown as Doc[]).filter(published);
export const posts = (postsData as unknown as Doc[])
  .filter(published)
  .sort((a, b) => b.date.localeCompare(a.date));
export const terms = taxData as unknown as Term[];

/** The old front page lives at "/" and is replaced by the new homepage. */
export const FRONT_PAGE_SLUG = "home-jewellery";

export const pageBySlug = (slug: string) => pages.find((p) => p.slug === slug);
export const postBySlug = (slug: string) => posts.find((p) => p.slug === slug);
export const termBySlug = (taxonomy: string, slug: string) => terms.find((t) => t.taxonomy === taxonomy && t.slug === slug);

/** Yoast title/description for an old URL, if the old site had one. */
export const seoForUrl = (path: string) => (seoData as Record<string, Seo>)[`https://sothisdiamonds.com${path}`];
