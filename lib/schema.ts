import { mediaUrl, type Product } from "./products";
import { productSeoName, realPhoto } from "./seo";
import { site } from "./site";

// schema.org data. One business entity, referenced by @id from every page, so answer engines see one
// consistent "Sothis Diamonds" rather than a separate store on each page.

export const ORG_ID = `${site.url}/#org`;
export const WEBSITE_ID = `${site.url}/#website`;
const org = { "@id": ORG_ID };
/** Absolute URL (media may already be on a CDN). */
export const absolute = (u: string) => (/^https?:/.test(u) ? u : `${site.url}${u}`);

/** The business. Facts only from lib/site.ts and the public company register (KBO 0713.898.620). */
export function businessGraph(lang: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["JewelryStore", "Organization"],
        "@id": ORG_ID,
        name: site.name,
        url: site.url,
        logo: `${site.url}/brand/logo.webp`,
        image: `${site.url}/brand/og-default.jpg`,
        description: "Diamond and jewellery buyer and seller in the Antwerp diamond district: free valuations and certified diamonds.",
        email: site.email,
        telephone: site.phones,
        vatID: "BE0713898620",
        address: {
          "@type": "PostalAddress",
          streetAddress: site.address.street,
          postalCode: site.address.postcode,
          addressLocality: site.address.city,
          addressCountry: "BE",
        },
        // The Hoveniersstraat 2 building (OpenStreetMap).
        geo: { "@type": "GeoCoordinates", latitude: 51.2158, longitude: 4.4184 },
        hasMap: site.mapUrl,
        areaServed: ["BE", "NL", "LU", "FR", "DE", "IT", "ES", "AT", "US", "CA", "AU"].map((c) => ({ "@type": "Country", name: c })),
        knowsAbout: ["Diamond valuation", "Selling diamonds", "GIA, HRD and IGI diamond grading reports", "Antique jewellery", "Coloured gemstones", "Luxury watches"],
        currenciesAccepted: "EUR, USD",
        paymentAccepted: "Bancontact, iDEAL, Visa, Mastercard, bank transfer",
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: site.url,
        name: site.name,
        publisher: org,
        inLanguage: lang,
      },
    ],
  };
}

const returnPolicy = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: ["BE", "NL", "LU", "FR", "DE", "IT", "ES", "AT", "US", "CA", "AU"],
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 14,
  returnMethod: "https://schema.org/ReturnByMail",
};

const prop = (name: string, value?: string) => (value ? { "@type": "PropertyValue", name, value } : null);

export function productSchema(p: Product, url: string, description?: string) {
  const a = p.attributes;
  const s = p.specs;
  const carat = Number.parseFloat(a.carat ?? "");
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productSeoName(p),
    sku: p.sku,
    url,
    description,
    image: realPhoto(p) ? absolute(mediaUrl(realPhoto(p)!)) : undefined,
    category: p.categories.includes("Diamonds") ? "Loose diamonds" : "Jewellery",
    ...(carat ? { weight: { "@type": "QuantitativeValue", value: carat, unitCode: "CTM" } } : {}),
    additionalProperty: [
      prop("Shape", a.shape),
      prop("Colour", a.color),
      prop("Clarity", a.clarity),
      prop("Cut", a.cut),
      prop("Polish", a.polish),
      prop("Symmetry", a.symmetry),
      prop("Fluorescence", a.fluorescence),
      prop("Grading lab", a.lab),
      prop("Measurements", s.Measurements && `${s.Measurements} mm`),
    ].filter(Boolean),
    offers: p.price
      ? {
          "@type": "Offer",
          price: p.price,
          priceCurrency: "USD",
          availability: p.in_stock ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
          itemCondition: "https://schema.org/NewCondition",
          url,
          seller: org,
          hasMerchantReturnPolicy: returnPolicy,
        }
      : undefined,
  };
}

/** Article or blog post, linked to the business. The export's dates ("Y-m-d H:i:s") carry no time
 *  zone, so only the ISO date is given rather than a guessed offset. */
export function articleSchema(o: { headline: string; url: string; date: string; modified: string; image?: string; description?: string; lang: string; post: boolean }) {
  const iso = (d: string) => d.slice(0, 10);
  return {
    "@context": "https://schema.org",
    "@type": o.post ? "BlogPosting" : "Article",
    headline: o.headline,
    description: o.description,
    url: o.url,
    mainEntityOfPage: o.url,
    inLanguage: o.lang,
    datePublished: iso(o.date),
    dateModified: iso(o.modified || o.date),
    image: o.image,
    author: org,
    publisher: org,
  };
}

/** A page whose main subject is a list of things (shop, category, steps). */
export function itemList(name: string, urls: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: urls.length,
    itemListElement: urls.map((url, i) => ({ "@type": "ListItem", position: i + 1, url })),
  };
}
