import { termBySlug, type Doc } from "./content";
import { allProducts, mediaUrl, type Product } from "./products";
import type { Route } from "./routes";

// Search titles and descriptions. English copy for now: the other languages reuse it until their
// dictionaries are translated.

const BRAND = "Sothis Diamonds";

/** Money pages: the query each one should own, in its title and description. */
export const PAGE_META: Record<string, { title: string; description: string }> = {
  "sell-diamond": {
    title: "Sell Your Diamond in Antwerp: Free Valuation | Sothis",
    description: "Sell your diamond to Antwerp specialists at Hoveniersstraat 2. Free valuation by certified gemmologists, a clear offer, no commission and fully insured pickup.",
  },
  "sell-your-diamond": {
    title: "Request a Free Diamond Valuation | Sothis Diamonds",
    description: "Tell us about your diamond, ring, watch or jewellery and get a free, no-obligation valuation from our Antwerp specialists, usually within one working day.",
  },
  "sell-watches": {
    title: "Sell Your Rolex or Luxury Watch in Antwerp | Sothis",
    description: "Sell your Rolex or luxury watch in Antwerp, with or without papers. Free valuation, a clear offer, no commission and fully insured pickup.",
  },
  "sell-colored-stones": {
    title: "Sell Sapphires, Rubies & Emeralds in Antwerp | Sothis",
    description: "Sell sapphires, rubies, emeralds and fancy colour diamonds to Antwerp specialists. Free valuation, a clear offer and no commission.",
  },
  "sell-other-jewellery": {
    title: "Sell Gold & Diamond Jewellery in Antwerp | Sothis",
    description: "Sell rings, necklaces, bracelets, earrings and designer jewellery in Antwerp. Free valuation, a clear offer, no commission and insured pickup.",
  },
  "antique-jewellery": {
    title: "Sell Antique & Vintage Jewellery in Antwerp | Sothis",
    description: "Sell antique and vintage jewellery, old mine and old European cut diamonds and period pieces to Antwerp specialists. Free valuation, no commission.",
  },
  shop: {
    title: "Buy GIA Certified Diamonds Online | Antwerp | Sothis",
    description: "Certified diamonds and fine jewellery from our Antwerp inventory: GIA, HRD and IGI graded stones with insured shipping and 14-day returns.",
  },
  "about-sothis-diamonds": {
    title: "About Sothis Diamonds: Antwerp Diamond Dealer",
    description: "Sothis Diamonds buys and sells diamonds and fine jewellery from Hoveniersstraat 2, in the heart of Antwerp's diamond district.",
  },
  "contact-us": {
    title: "Contact Sothis Diamonds, Hoveniersstraat 2 Antwerp",
    description: "Contact Sothis Diamonds at Hoveniersstraat 2, 2018 Antwerp: call, email or send a message about selling or buying diamonds and jewellery.",
  },
  blog: {
    title: "Diamond Guides: Selling, Value & Grading | Sothis",
    description: "Guides from our Antwerp team on selling diamonds, what your diamond is worth, grading reports and how to compare offers.",
  },
  "diamond-valuation-calculator": {
    title: "Diamond Value Calculator: Estimate Your Diamond | Sothis",
    description: "Estimate what your diamond is worth from its carat, colour, clarity and cut, then get a free expert valuation from our Antwerp specialists.",
  },
};

const clip = (s: string, n = 155) => {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length <= n ? t : `${t.slice(0, t.lastIndexOf(" ", n - 1))}…`;
};
const plain = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&");

const isDiamond = (p: Product) => Boolean(p.attributes.shape && p.attributes.carat);

/** "Round 7.06 ct F SI2 GIA Diamond": the grades are what people search for. */
export function productSeoName(p: Product) {
  if (!isDiamond(p)) return p.title.replace(/\s*\([^)]*\)\s*$/, "");
  const a = p.attributes;
  return [a.shape, `${a.carat} ct`, a.color, a.clarity, a.lab, "Diamond"].filter(Boolean).join(" ");
}

// Two listings with the same grades (e.g. a matched pair) get their SKU in the title to stay distinct.
const nameCounts = new Map<string, number>();
for (const p of allProducts) nameCounts.set(productSeoName(p), (nameCounts.get(productSeoName(p)) ?? 0) + 1);
const uniqueName = (p: Product) => (nameCounts.get(productSeoName(p))! > 1 ? `${productSeoName(p)} (${p.sku})` : productSeoName(p));

export function productMeta(p: Product) {
  const price = p.price ? `$${Math.round(p.price).toLocaleString("en-US")}` : null;
  if (isDiamond(p)) {
    const a = p.attributes;
    const facts = [a.cut && `${a.cut} cut`, p.specs.Measurements && `${p.specs.Measurements} mm`].filter(Boolean).join(", ");
    const stock = p.in_stock ? "In stock in Antwerp" : "Sold";
    return {
      title: `${uniqueName(p)} | ${BRAND}`,
      description: clip(`${productSeoName(p)}${facts ? `: ${facts}` : ""}. ${[price, stock].filter(Boolean).join(", ")}. Certified, insured shipping and 14-day returns.`),
    };
  }
  const about = p.short_description ? plain(p.short_description) : "";
  return {
    title: `${productSeoName(p)} | ${BRAND}`,
    description: clip(`${productSeoName(p)}${price ? `, ${price}` : ""}. ${about}`),
  };
}

export const productImage = (p: Product) => (p.image ? mediaUrl(p.image) : undefined);

export function docMeta(doc: Doc) {
  const text = doc.seo?.description || plain(doc.excerpt || doc.content_html);
  return { description: clip(text) };
}

// Pages kept out of search: the browser-side store views, listings with too little in them to be
// worth a result, and old WordPress tags with one stone each.
const PRIVATE_PAGES = new Set(["cart", "checkout", "wishlist", "compare", "my-account"]);
const MIN_LISTING = 3;
// Tags worth a search result: shapes, grading labs and fancy colours. Carat, colour-grade and
// clarity tags hold a stone or two each and only duplicate the shop.
const HUB_TAGS = /^(rd|round|pear|cushion|heart|emerald|oval|radiant|asscher|princess|marquise)$|-certified$|^fancy-/;

export function listingCount(route: Route) {
  if (route.kind !== "product_cat" && route.kind !== "product_tag") return Infinity;
  const term = termBySlug(route.kind, route.slug);
  if (!term) return 0;
  return allProducts.filter((p) => (route.kind === "product_cat" ? p.categories : p.tags ?? []).includes(term.name)).length;
}

export function indexable(route: Route) {
  if (route.kind === "page") return !PRIVATE_PAGES.has(route.slug);
  if (route.kind === "category") return route.slug !== "diamonds"; // 301s to the diamonds shop category
  if (route.kind === "product_cat") return listingCount(route) > 0;
  if (route.kind === "product_tag") return HUB_TAGS.test(route.slug) && listingCount(route) >= MIN_LISTING;
  return true;
}
