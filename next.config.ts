import type { NextConfig } from "next";

const DAY = 60 * 60 * 24;

// Old WordPress attribute archive bases in every language, and each language's shop.
const OTHER_ATTRS = "carat|polish|symmetry|fluorescence";
const ALL_ATTRS = [
  "shape|forme|vorm|form|forma",
  "carat|karaat|karat|carato|quilates",
  "color|couleur|kleur|farbe|colore",
  "clarity|clarte|duidelijkheid|ubersichtlichkeit|chiarezza|claridad",
  "cut|couper|gesneden|schneiden|taglio|corte",
  "lab|laboratoire|labor|laboratorio",
  "polish|polonais|polnisch|lucidatura|polaco",
  "symmetry|symetrie|symmetrie|simmetria|simetria",
  "fluorescence|fluorescentie|fluoreszenz|fluorescenza|fluorescencia",
].join("|");
const SHOP = { fr: "boutique", nl: "winkelen", de: "shop", it: "negozio", es: "tienda" };

const nextConfig: NextConfig = {
  // Keep the old site's URLs exactly: every path ends in a slash (/sell-diamond/), as Google has them indexed.
  trailingSlash: true,
  images: {
    qualities: [75],
    // Smaller files for the same quality; each size is encoded once, then served from cache.
    formats: ["image/avif", "image/webp"],
    // Optimised images are cached for 31 days (default is 4 hours). Product media from the old site
    // doesn't change under the same name; if one ever does, rename it or clear .next/cache/images.
    minimumCacheTTL: 31 * DAY,
  },
  async redirects() {
    // Leftovers from the old theme (demo portfolio, internal slider/CMS blocks): gone for good.
    const junk = ["portfolio", "woodmart_slider", "cms_block_cat"];
    return [
      ...junk.flatMap((base) => [
        { source: `/${base}/:path*`, destination: "/", permanent: true },
        { source: `/:lang(fr|nl|de|it|es)/${base}/:path*`, destination: "/:lang/", permanent: true },
      ]),
      // Linked from the old guides but never existed; the text means the calculator.
      { source: "/diamond-valuation/", destination: "/diamond-valuation-calculator/", permanent: true },
      // Old guide links to posts that were renamed or never published.
      { source: "/diamond-selling-scams-red-flags/", destination: "/diamond-selling-scams-red-flags-fake-payments-and-pressure-tactics/", permanent: true },
      { source: "/best-place-to-sell-a-diamond/", destination: "/where-to-sell-diamond-belgium/", permanent: true },
      { source: "/diamond-fluorescence-polish-symmetry-value/", destination: "/how-to-read-verify-diamond-grading-report/", permanent: true },
      { source: "/category/diamonds/", destination: "/product-category/diamonds/", permanent: true },
      { source: "/precio-de-venta-de-un-diamante-cuanto-puede-obtener-por-su-diamante/", destination: "/es/vender-diamante/", permanent: true },

      // WordPress product-attribute archives (/shape/heart/, /de/farbe/d/ ...): English shape, colour,
      // clarity, cut and lab land on the matching shop filter; the rest (and other languages, whose
      // values were translated) land on that language's shop.
      ...(["shape", "color", "clarity", "cut", "lab"] as const).map((a) => ({ source: `/${a}/:v/`, destination: `/shop/?${a}=:v`, permanent: true })),
      { source: `/:a(${OTHER_ATTRS})/:v*`, destination: "/shop/", permanent: true },
      ...Object.entries(SHOP).map(([l, shop]) => ({ source: `/${l}/:a(${ALL_ATTRS})/:v*`, destination: `/${l}/${shop}/`, permanent: true })),
      // Demo portfolio categories and author archives from the old theme.
      { source: "/:a(project-cat|author|auteur|autor)/:p*", destination: "/", permanent: true },
      { source: "/:lang(fr|nl|de|it|es)/:a(project-cat|author|auteur|autor)/:p*", destination: "/:lang/", permanent: true },
      // Pre-WordPress .php pages that still have links.
      { source: "/:file([a-z0-9-]+).php", destination: "/sell-diamond/", permanent: true },
      { source: "/:lang(fr|nl|de|it|es)/:file([a-z0-9-]+).php", destination: "/:lang/", permanent: true },
      // WordPress feeds and sitemaps (Search Console still has the old sitemap addresses).
      { source: "/:lang(fr|nl|de|it|es)?/feed/:p*", destination: "/blog/", permanent: true },
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/:name([a-z_]+-sitemap\\d*).xml", destination: "/sitemap.xml", permanent: true },
      // Uploads moved from /wp-content/uploads to /media (WordPress resized copies -> the original).
      { source: "/wp-content/uploads/:dir*/:name([^/]+)-:w(\\d+)x:h(\\d+).:ext(jpg|jpeg|png|webp|gif)", destination: "/media/:dir*/:name.:ext", permanent: true },
      { source: "/wp-content/uploads/:p*", destination: "/media/:p*", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        // Product photos, stone videos and backgrounds (served as-is, e.g. CSS backgrounds and <video>).
        source: "/media/:path*",
        headers: [{ key: "Cache-Control", value: `public, max-age=${30 * DAY}, stale-while-revalidate=${DAY}` }],
      },
      {
        // Logo and mark: cached a week, since brand files are likelier to be edited.
        source: "/brand/:path*",
        headers: [{ key: "Cache-Control", value: `public, max-age=${7 * DAY}, stale-while-revalidate=${DAY}` }],
      },
    ];
  },
};

export default nextConfig;
