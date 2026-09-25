import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Rail } from "@/components/Motion";
import { CartButton, CompareButton, ProductCard, WishlistButton } from "@/components/ProductCard";
import { ProductGallery, type Slide } from "@/components/ProductGallery";
import { Price } from "@/components/Store";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { allProducts, displayName, mediaUrl, productPath, type Product } from "@/lib/products";
import { site } from "@/lib/site";

const num = (v?: string) => Number.parseFloat(v ?? "");
const carat = (p: Product) => num(p.attributes.carat) || 0;

/** Report fields in reading order, grouped. Internal fields (cash/RapNet prices) are never shown. */
function specGroups(p: Product, t: ReturnType<typeof getDictionary>["product"]) {
  const s = p.specs;
  const a = p.attributes;
  const girdle = [s["Girdle Thin"], s["Girdle Thick"]].filter(Boolean).join(" – ");
  const rows = (pairs: [string, string | undefined][]) => pairs.filter((r): r is [string, string] => Boolean(r[1]));
  return [
    [t.groups.grading, rows([["Carat", a.carat && `${a.carat} ct`], ["Shape", a.shape], ["Colour", a.color], ["Clarity", a.clarity], ["Cut", a.cut], ["Polish", a.polish], ["Symmetry", a.symmetry], ["Fluorescence", a.fluorescence]])],
    [t.groups.report, rows([["Lab", a.lab], ["Comment", s["Cert comment"]], ["Key to symbols", s["Key to symbols"]], ["Laser inscription", s["Laser Inscription"]]])],
    [t.groups.measurements, rows([["Measurements", s.Measurements && `${s.Measurements.replace(/\s*X\s*/g, " × ")} mm`], ["Depth", s["Depth %"] && `${s["Depth %"]}%`], ["Table", s["Table %"] && `${s["Table %"]}%`], ["Crown", [s["Crown Height"] && `${s["Crown Height"]}%`, s["Crown Angle"] && `${s["Crown Angle"]}°`].filter(Boolean).join(", ")], ["Pavilion", [s["Pavilion Depth"] && `${s["Pavilion Depth"]}%`, s["Pavilion Angle"] && `${s["Pavilion Angle"]}°`].filter(Boolean).join(", ")], ["Girdle", girdle], ["Culet", s["Culet Size"]]])],
    [t.groups.appearance, rows([["Eye clean", s["Eye Clean"]], ["Shade", s.Shade], ["Milky", s.Milky], ["Black inclusions", s["Black Inclusion"]]])],
  ].filter(([, r]) => r.length) as [string, [string, string][]][];
}

/** Side profile drawn from the report: table %, crown height, pavilion depth. */
function Proportions({ p, t }: { p: Product; t: ReturnType<typeof getDictionary>["product"] }) {
  const table = num(p.specs["Table %"]);
  const crown = num(p.specs["Crown Height"]);
  const depth = num(p.specs["Depth %"]);
  const pavilion = num(p.specs["Pavilion Depth"]) || (depth && crown ? depth - crown - 2 : NaN);
  if (!table || !crown || !pavilion) return null;
  const w = 100, girdle = 2;
  return (
    <figure>
      <figcaption className="text-sm font-semibold">{t.proportions}</figcaption>
      <svg viewBox={`-62 ${-crown - 16} 175 ${crown + pavilion + girdle + 26}`} className="mt-4 w-full max-w-sm" role="img" aria-label={`${t.table} ${table}%, ${t.depth} ${depth}%`}>
        <g fill="none" stroke="var(--color-ink)" strokeWidth="0.6" strokeLinejoin="round">
          <polygon points={`${-w / 2},0 ${-table / 2},${-crown} ${table / 2},${-crown} ${w / 2},0 ${w / 2},${girdle} 0,${girdle + pavilion} ${-w / 2},${girdle}`} />
          <path d={`M${-table / 2},${-crown}L-20,${girdle}M${table / 2},${-crown}L20,${girdle}`} strokeWidth="0.3" />
          <path d={`M${-table / 2},${-crown - 6}H${table / 2}M58,${-crown}V${girdle + pavilion}`} stroke="var(--color-champagne)" />
        </g>
        <g fill="var(--color-platinum-2)" fontSize="6" fontFamily="var(--font-sans)">
          <text x="0" y={-crown - 9} textAnchor="middle">{t.table} {table}%</text>
          {depth > 0 && <text x="61" y={(girdle + pavilion - crown) / 2} dominantBaseline="middle">{t.depth} {depth}%</text>}
        </g>
      </svg>
    </figure>
  );
}

export function ProductPage({ product: p, lang }: { product: Product; lang: Locale }) {
  const t = getDictionary(lang);
  const tp = t.product;
  const name = displayName(p);
  const isDiamond = p.categories.includes("Diamonds");
  const catPath = localePath(lang, isDiamond ? "/product-category/diamonds/" : "/product-category/jewelery/");

  const slides: Slide[] = [
    ...(p.video ? [{ kind: "video" as const, src: mediaUrl(p.video), poster: p.image ? `/_next/image/?url=${encodeURIComponent(mediaUrl(p.image))}&w=1080&q=75` : undefined }] : []),
    ...[p.image, ...p.gallery].filter((x): x is string => Boolean(x)).map((src) => ({ kind: "image" as const, src: mediaUrl(src) })),
  ];

  const related = allProducts
    .filter((x) => x.id !== p.id && x.in_stock && x.categories.some((c) => p.categories.includes(c)))
    .map((x) => ({ x, score: (x.attributes.shape === p.attributes.shape ? 0 : 5) + Math.abs(carat(x) - carat(p)) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 8)
    .map(({ x }) => x);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    sku: p.sku,
    image: p.image ? `${site.url}/${p.image}` : undefined,
    brand: { "@type": "Brand", name: site.name },
    offers: p.price && {
      "@type": "Offer",
      price: p.price,
      priceCurrency: "USD",
      availability: p.in_stock ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
      url: `${site.url}${productPath(p, lang)}`,
    },
  };

  return (
    <article className="wrap pb-28 pt-32">
      <Breadcrumbs
        items={[
          { label: tp.breadcrumbHome, href: localePath(lang, "/") },
          { label: tp.breadcrumbShop, href: localePath(lang, "/shop/") },
          { label: isDiamond ? t.nav.buyLinks[0][0] : t.nav.buyLinks[1][0], href: catPath },
          { label: name, href: productPath(p, lang) },
        ]}
      />

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <ProductGallery slides={slides} name={name} t={tp} />

        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-sm text-platinum-2">{tp.reference} {p.sku}</p>
          <h1 className="mt-2 text-4xl sm:text-5xl">{name}</h1>
          {isDiamond && <p className="mt-3 text-platinum-2">{[p.attributes.color, p.attributes.clarity, p.attributes.lab].filter(Boolean).join(", ")}</p>}
          <p className="mt-6 text-3xl font-semibold">{p.price ? <Price usd={p.price} /> : null}</p>
          <p className={`mt-1 text-sm ${p.in_stock ? "text-platinum-2" : "text-burgundy"}`}>{p.in_stock ? tp.inStock : tp.sold}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <CartButton product={p} t={t.stones} solid />
            <Link href={`${localePath(lang, "/contact-us/")}?stone=${encodeURIComponent(p.sku)}`} className="btn btn-secondary">{tp.enquire}</Link>
          </div>
          <div className="mt-5 flex items-center gap-5 text-sm">
            <div className="relative size-10"><WishlistButton id={p.id} t={t.stones} /></div>
            <CompareButton id={p.id} t={t.stones} />
          </div>

          {p.short_description && !isDiamond && (
            <div className="prose mt-10 text-base" dangerouslySetInnerHTML={{ __html: p.short_description }} />
          )}
        </div>
      </div>

      {isDiamond && (
        <section className="mt-24 grid gap-12 border-t border-line pt-16 lg:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="text-3xl">{tp.specsTitle}</h2>
            <div className="mt-8 grid gap-10 sm:grid-cols-2">
              {specGroups(p, tp).map(([title, rows]) => (
                <div key={title}>
                  <h3 className="font-sans text-sm font-semibold">{title}</h3>
                  <dl className="mt-3 divide-y divide-line border-y border-line text-sm">
                    {rows.map(([k, v]) => (
                      <div key={k} className="grid grid-cols-[9rem_1fr] gap-4 py-2.5">
                        <dt className="text-platinum-2">{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </div>
          <Proportions p={p} t={tp} />
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-24 border-t border-line pt-16">
          <h2 className="text-3xl">{tp.related}</h2>
          <div className="mt-10">
            <Rail prev={t.stones.prev} next={t.stones.next}>
              {related.map((x) => (
                <li key={x.id} className="w-[78vw] shrink-0 snap-start sm:w-[20rem]">
                  <ProductCard product={x} href={productPath(x, lang)} t={t.stones} />
                </li>
              ))}
            </Rail>
          </div>
        </section>
      )}

      <section className="mt-24 bg-ivory-deep px-8 py-14 text-center sm:px-16">
        <h2 className="text-3xl">{tp.sellTitle}</h2>
        <p className="mx-auto mt-4 max-w-lg text-platinum-2">{tp.sellBody}</p>
        <Link href={localePath(lang, "/sell-diamond/")} className="btn btn-primary mt-8">{tp.sellCta}</Link>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  );
}
