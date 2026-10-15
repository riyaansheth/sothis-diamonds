// The two journeys from the homepage choice, each on its own page: Buy from us (/new/) and Sell to us (/pre-owned/).

import Image from "next/image";
import Link from "next/link";
import { Newsletter, QuickValuation } from "@/components/Forms";
import { Quotes, RevealHeading, StepsScroller } from "@/components/Motion";
import type { Crop } from "@/components/CroppedImage";
import { Faq } from "@/components/Faq";
import { NewChapter } from "@/components/about/NewChapter";
import { WhyList } from "@/components/WhyList";
import { CollectionStage } from "@/components/buy/CollectionStage";
import { CountUp } from "@/components/buy/CountUp";
import { ShapeTiles } from "@/components/buy/ShapeTiles";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { allProducts, mediaUrl, productBySku, productPath, type Product } from "@/lib/products";

// Collection crops: the studio images on silk get a centred square around the stone; real photos a
// tighter square that stops above their certificate card. Product pages show the full photo.
const STUDIO_CROP: Crop = { cx: 0.5, cy: 0.5, d: 0.62 };
const PHOTO_CROP: Crop = { cx: 0.5, cy: 0.46, d: 0.5 };
const cropFor = (p: Product) => (/Gemini_Generated_Image/.test(p.image ?? "") ? STUDIO_CROP : PHOTO_CROP);

// Why Sothis: hands at work with a stone, one photo per reason (gemmologists, transparent
// valuations, top offers, insured pickup, fast, certified stones for sale).
const WHY_PHOTOS = [3, 1, 5, 6, 2, 4];
const STEPS_STONE = "S-1976"; // RD 1.09ct F IF (IGI): the stone that acts out "How selling works"
const STORY_PIECE = "SCP01"; // Cushion yellow diamond ring, photographed on burgundy silk

/** Testimonials, shared by both journeys. */
function Testimonials({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  return (
    <section className="burgundy-tint border-y border-line">
      <div className="wrap py-28 lg:py-40">
        <h2 className="sr-only">{t.reviews.title}</h2>
        <Quotes items={t.reviews.items} label={t.reviews.choose} />
      </div>
    </section>
  );
}

/** Sell to us: how selling works, what we buy, quick valuation, story, why Sothis, newsletter. */
export function SellJourney({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const href = (path: string) => localePath(lang, path);
  const story = productBySku(STORY_PIECE);
  const stepsStone = productBySku(STEPS_STONE);
  const pct = (k: string) => Number.parseFloat(stepsStone.specs[k] ?? "");
  const sc = t.steps.scene;
  const stage = {
    image: `/_next/image/?url=${encodeURIComponent(mediaUrl(stepsStone.image!))}&w=640&q=75`,
    proportions: { table: pct("Table %"), crown: pct("Crown Height"), pavilion: pct("Pavilion Depth") },
    readouts: [
      [sc.carat, `${stepsStone.attributes.carat} ct`],
      [sc.colour, stepsStone.attributes.color],
      [sc.clarity, stepsStone.attributes.clarity],
      [sc.report, stepsStone.attributes.lab],
    ] as [string, string][],
    text: { photo: sc.photo, offer: sc.offer, offerAmount: sc.offerAmount, noObligation: sc.noObligation, courier: sc.courier, arrived: sc.arrived, verified: sc.verified, paid: sc.paid, hint: sc.hint },
  };

  return (
    <>
    {/* 4. How selling works: pinned numeral, steps scroll past */}
    <section className="steps-section border-y border-line">
      <div className="wrap">
        <StepsScroller
          steps={t.steps.items}
          stage={stage}
          stepLabel={t.steps.stepOf}
          heading={<RevealHeading lines={[t.steps.title]} className="text-4xl sm:text-5xl" />}
          action={<Link href={href("/sell-diamond/")} className="btn btn-inverse">{t.steps.cta}</Link>}
        />
      </div>
    </section>

    {/* 3. Sell with confidence: what we buy. Heading and intro, then the categories in a plain row of links. */}
    <section className="wrap py-24 lg:py-32">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div>
          <RevealHeading lines={[t.sell.title]} className="text-4xl sm:text-5xl" />
          <p className="mt-5 max-w-xl text-platinum-2">{t.sell.body}</p>
        </div>
        <Link href={href("/sell-your-diamond/")} className="btn btn-primary">{t.hero.primary}</Link>
      </div>
      <ul className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
        {t.sell.categories.map(([name, desc, path]) => (
          <li key={path} className="border-t border-line">
            <Link href={href(path)} className="group block pt-6">
              <span className="flex items-start justify-between gap-3 font-display text-2xl lg:text-xl xl:text-2xl">
                {name}
                <svg viewBox="0 0 24 24" aria-hidden className="mt-2 size-5 shrink-0 fill-none stroke-current transition-transform [stroke-width:1.2] group-hover:translate-x-1">
                  <path d="M4 12h15M13 6l6 6-6 6" />
                </svg>
              </span>
              <span className="mt-2 block max-w-sm text-sm text-platinum-2">{desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>

    {/* 5. Quick valuation */}
    <section className="wrap py-28 text-center lg:py-36">
      <RevealHeading lines={[t.quick.title]} className="text-4xl sm:text-5xl" />
      <p className="mx-auto mt-5 max-w-xl text-platinum-2">{t.quick.body}</p>
      <div className="mx-auto mt-12 max-w-5xl text-left">
        <QuickValuation t={t.quick} action={href("/sell-your-diamond/")} />
      </div>
    </section>

    {/* 7. Our story */}
    <section className="burgundy-tint">
    <div className="wrap grid items-center gap-14 py-28 lg:grid-cols-2 lg:gap-24 lg:py-40">
      {story.image && (
        <div className="relative aspect-square overflow-hidden rounded-sm">
          <Image src={mediaUrl(story.image)} alt={story.title} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
        </div>
      )}
      <div className="max-w-xl">
        <RevealHeading lines={[t.story.title]} className="text-4xl sm:text-5xl" />
        {t.story.body.map((p) => (
          <p key={p} className="mt-6 text-lg text-platinum-2">{p}</p>
        ))}
        <Link href={href("/about-sothis-diamonds/")} className="btn btn-secondary mt-10">{t.story.cta}</Link>
      </div>
    </div>
    </section>

    {/* 8. Why Sothis: pinned stone, reasons scroll past (see WhyList). */}
    <section className="why-section border-t border-line">
      <div className="wrap pt-28 lg:pt-36">
        <RevealHeading lines={[t.why.title]} className="text-4xl sm:text-6xl" />
      </div>
      <div className="mt-12 lg:mt-16">
        <WhyList
          items={t.why.items}
          view={t.stones.viewStone}
          stones={WHY_PHOTOS.map((n) => ({ src: `/brand/why/why-${n}.webp` }))}
        />
      </div>
    </section>

    <Testimonials lang={lang} />

    {/* 11. Newsletter */}
    <section className="wrap grid gap-10 border-t border-line py-24 lg:grid-cols-2 lg:py-28">
      <div>
        <h2 className="text-3xl sm:text-4xl">{t.newsletter.title}</h2>
        <p className="mt-4 text-platinum-2">{t.newsletter.body}</p>
      </div>
      <Newsletter t={t.newsletter} />
    </section>

    {/* 12. Closing call to action: the page's one burgundy block */}
    <section className="bg-wine bg-[url(/brand/bg-closing.webp)] bg-cover bg-center text-on-accent">
      <div className="wrap py-32 text-center lg:py-44">
        <div aria-hidden className="mx-auto mb-12 h-px w-24 bg-champagne" />
        <RevealHeading lines={[t.closing.title]} className="mx-auto max-w-4xl text-4xl sm:text-5xl lg:text-6xl" />
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link href={href("/sell-diamond/")} className="btn btn-inverse">{t.closing.primary}</Link>
          <Link href={href("/contact-us/")} className="btn border border-on-accent/60 text-on-accent hover:border-on-accent hover:bg-on-accent/10">{t.closing.secondary}</Link>
        </div>
      </div>
    </section>
    </>
  );
}

/** Buy from us: shapes, the ring, the collection, how buying works, why buy, FAQ. */
export function BuyJourney({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  const href = (path: string) => localePath(lang, path);
  const productHref = (p: Product) => productPath(p, lang);
  // The Buy journey: facts from the shipping and returns policies and the product data.
  const b = t.buy;
  const forSale = allProducts.filter((p) => p.in_stock && p.image);
  // All jewellery, then the three most valuable stones of each shape: enough for every filter, and
  // a page a third the weight of the full collection ("Browse all" links to the shop for the rest).
  const perShape = new Map<string, number>();
  const railItems = [
    ...forSale.filter((p) => !p.categories.includes("Diamonds")),
    ...forSale
      .filter((p) => p.categories.includes("Diamonds"))
      .sort((x, y) => (y.price ?? 0) - (x.price ?? 0))
      .filter((p) => {
        const shape = p.attributes.shape ?? "";
        perShape.set(shape, (perShape.get(shape) ?? 0) + 1);
        return perShape.get(shape)! <= 3;
      }),
  ].map((p) => ({ product: p, href: productHref(p), crop: p.categories.includes("Diamonds") ? cropFor(p) : undefined }));
  const count = (f: (p: Product) => boolean) => forSale.filter(f).length;
  const shapeCounts = Object.entries(
    forSale.reduce<Record<string, number>>((acc, p) => {
      const shape = p.attributes.shape;
      if (shape) acc[shape] = (acc[shape] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((x, y) => y[1] - x[1]);
  const labs = { gia: count((p) => p.attributes.lab === "GIA"), hrd: count((p) => p.attributes.lab === "HRD"), igi: count((p) => p.attributes.lab === "IGI") };
  const reportStone = forSale.find((p) => p.attributes.lab === "GIA" && p.attributes.carat && p.attributes.color && p.attributes.clarity)!;
  const ra = reportStone.attributes;

  return (
    <>
      <ShapeTiles shapes={shapeCounts} shopHref={href("/shop/")} t={{ title: b.shapesTitle, line: b.shapesLine, inStock: b.inStock }} />
      {/* The ring from inspection to worn: moved here from the About page. */}
      <NewChapter inspected="/brand/ring-cutout.webp" worn={mediaUrl(productBySku("SCP01").gallery[0])} t={{ title: t.about.chapterTitle, body: t.about.chapterBody, inspection: t.about.inspection }} />

      <CollectionStage items={railItems} total={forSale.length} shopHref={href("/shop/")} line={t.paths.buy[1]} t={b} card={t.stones} />

      {/* How buying works: the lilac asscher acts out each step, scrubbed by scroll. */}
      <section className="buy-steps border-y border-line">
        <div className="wrap">
          <StepsScroller
            steps={b.steps}
            buyStage={{
              report: [["Lab", ra.lab!], ["Carat", `${ra.carat} ct`], ["Colour", ra.color!], ["Clarity", ra.clarity!]],
              scene: b.scene,
            }}
            compact
            stepLabel={t.steps.stepOf}
            heading={<RevealHeading lines={[b.stepsTitle]} className="text-4xl sm:text-5xl" />}
            action={<Link href={href("/shop/")} className="btn btn-inverse">{b.stepsCta}</Link>}
          />
        </div>
      </section>

      {/* Why buy from Sothis: the heading, then the reasons in a plain grid. */}
      <section className="wrap pt-24 pb-16 lg:pt-32 lg:pb-20">
        <RevealHeading lines={[b.whyTitle]} className="text-4xl sm:text-5xl" />
        <ul className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
          {b.why.map(([title, body], i) => (
            <li key={title} className="border-t border-line pt-6">
              <h3 className="font-display text-2xl lg:text-xl xl:text-2xl">{title}</h3>
              <p className="mt-2 max-w-sm text-sm text-platinum-2">
                {i === 0 ? (
                  // The counts come from the data and count up as they come into view.
                  body.split(/(\{gia\}|\{hrd\}|\{igi\})/).map((part, k) => {
                    const key = part.slice(1, -1) as keyof typeof labs;
                    return part.startsWith("{") ? <CountUp key={k} value={labs[key]} /> : part;
                  })
                ) : i === 3 ? (
                  <>
                    {body}{" "}
                    <Link href={href("/refund_returns/")} className="underline underline-offset-4">{b.returnsLink}</Link>
                  </>
                ) : (
                  body
                )}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line"><Faq title={b.faqTitle} items={b.faq} more={{ text: b.faqMore, label: b.faqContact, href: href("/contact-us/") }} /></section>

      <Testimonials lang={lang} />

      {/* Closing call to action */}
      <section className="bg-wine bg-[url(/brand/bg-closing.webp)] bg-cover bg-center text-on-accent">
        <div className="wrap py-32 text-center lg:py-44">
          <div aria-hidden className="buy-rule mx-auto mb-12 h-px w-24 bg-champagne" />
          <RevealHeading lines={[b.closingTitle]} className="mx-auto max-w-4xl text-4xl sm:text-5xl lg:text-6xl" />
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <Link href={href("/shop/")} className="btn btn-inverse">{b.closingPrimary}</Link>
            <Link href={href("/contact-us/")} className="btn border border-on-accent/60 text-on-accent hover:border-on-accent hover:bg-on-accent/10">{b.closingSecondary}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
