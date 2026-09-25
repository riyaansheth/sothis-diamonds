import type { NextConfig } from "next";

const DAY = 60 * 60 * 24;

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
