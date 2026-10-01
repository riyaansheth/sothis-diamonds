import { pageBySlug, posts } from "@/lib/content";
import { inStockDiamonds } from "@/lib/products";
import { href } from "@/lib/routes";
import { PAGE_META, docMeta } from "@/lib/seo";
import { site } from "@/lib/site";

// llms.txt (llmstxt.org): a plain map of the site for AI assistants, built from the same data as the pages.
export const dynamic = "force-static";

const url = (path: string) => `${site.url}${path}`;
const page = (slug: string) => {
  const meta = PAGE_META[slug];
  const title = meta?.title.replace(/\s*\|.*$/, "") ?? pageBySlug(slug)?.title ?? slug;
  return `- [${title}](${url(href("en", { kind: "page", slug }))})${meta ? `: ${meta.description}` : ""}`;
};

export function GET() {
  const stones = inStockDiamonds();
  const labs = ["GIA", "HRD", "IGI"].map((l) => `${stones.filter((p) => p.attributes.lab === l).length} ${l}`).join(", ");
  const guides = [...posts]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((p) => `- [${p.title}](${url(href("en", { kind: "post", slug: p.slug }))}): ${docMeta(p).description}`);

  const body = `# ${site.name}

> Diamond and jewellery buyer and seller at ${site.address.street}, ${site.address.postcode} ${site.address.city}, Belgium, in the Antwerp diamond district. Sothis buys diamonds, coloured stones, watches, antique and designer jewellery (free valuation, no commission) and sells certified diamonds and fine jewellery online.

Key facts:
- Address: ${site.address.street}, ${site.address.postcode} ${site.address.city}, Belgium
- Contact: ${site.email}, ${site.phones.join(", ")}
- Selling to Sothis: free, no-obligation valuation by gemmologists; clear offer; no commission
- Buying from Sothis: ${stones.length} certified diamonds in stock (${labs} grading reports) plus fine jewellery
- Payment methods: Bancontact, iDEAL, Visa, Mastercard, bank transfer
- Delivery: insured and tracked (DHL Express, FedEx, UPS) to Europe (3–7 business days), the US and Canada (5–10), Australia (7–12)
- Returns: 14 days from delivery, unworn and with certificates; refunds within 7–10 business days
- Languages: English, French, Dutch, German, Italian, Spanish

## Sell to Sothis
${["sell-diamond", "sell-your-diamond", "sell-colored-stones", "sell-watches", "antique-jewellery", "sell-other-jewellery", "diamond-valuation-calculator"].map(page).join("\n")}

## Buy from Sothis
${page("shop")}

## About
${["about-sothis-diamonds", "contact-us"].map(page).join("\n")}

## Guides
${guides.join("\n")}

## Policies
${["shipping-policy", "refund_returns", "terms-conditions", "privacy-policy"].map(page).join("\n")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
