import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Newsletter, QuickValuation } from "@/components/Forms";
import { Loader } from "@/components/Loader";
import { Quotes, RevealHeading, StepsScroller } from "@/components/Motion";
import type { Crop } from "@/components/CroppedImage";
import { HomeChoice } from "@/components/HomeChoice";
import { Opening } from "@/components/Opening";
import { NewChapter } from "@/components/about/NewChapter";
import { WhyList } from "@/components/WhyList";
import { CollectionStage } from "@/components/buy/CollectionStage";
import { CountUp } from "@/components/buy/CountUp";
import { ShapeTiles } from "@/components/buy/ShapeTiles";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { allProducts, mediaUrl, productBySku, productPath, type Product } from "@/lib/products";

// Homepage crops: a square around each stone that stops above its certificate card (and clear of the
// filename and sparkle marks). Measured by eye from the photos; product pages show the full photo.
// Stones without an entry use DEFAULT_CROP below.
const HOME_CROPS: Record<string, Crop> = {
  "S-1880": { cx: 0.5, cy: 0.45, d: 0.44 },
  "S-1695": { cx: 0.5, cy: 0.42, d: 0.72 },
  "E-400-VN-4": { cx: 0.5, cy: 0.45, d: 0.8 },
  "FCRA-PSTK-86": { cx: 0.5, cy: 0.45, d: 0.58 },
  "S-1870": { cx: 0.5, cy: 0.5, d: 0.52 },
  "S-2001": { cx: 0.5, cy: 0.47, d: 0.5 },
  "S-1888": { cx: 0.445, cy: 0.5, d: 0.3 },
  "S-1887": { cx: 0.45, cy: 0.46, d: 0.44 },
  "E-397-244A-3A": { cx: 0.5, cy: 0.47, d: 0.8 },
  "S-1865": { cx: 0.5, cy: 0.49, d: 0.6 },
  "E-398-248F-1B": { cx: 0.5, cy: 0.5, d: 0.34 }, // stops left of the IGI card (x 0.68)
  "S-1807": { cx: 0.25, cy: 0.5, d: 0.44 }, // card sits right beside the stone
  "S-1975": { cx: 0.5, cy: 0.46, d: 0.58 },
  "S-1976": { cx: 0.5, cy: 0.46, d: 0.6 },
  "S-1889": { cx: 0.5, cy: 0.46, d: 0.58 },
};
// Every other studio photo: stone centred, certificate card in the lower right. The middle half keeps
// the stone and leaves the card out (checked against every in-stock photo).
const DEFAULT_CROP: Crop = { cx: 0.5, cy: 0.46, d: 0.5 };

// The opening stone: studio cut-out of the round 7.06 ct F SI2 (E-398-248F-1B), as on the About page.
// Why Sothis: hands at work with a stone, one photo per reason (gemmologists, transparent
// valuations, top offers, insured pickup, fast, certified stones for sale).
const WHY_PHOTOS = [3, 1, 5, 6, 2, 4];
const STEPS_STONE = "S-1976"; // RD 1.09ct F IF (IGI): the stone that acts out "How selling works"
const STORY_PIECE = "SCP01"; // Cushion yellow diamond ring, photographed on white

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const href = (path: string) => localePath(lang, path);
  const productHref = (p: Product) => productPath(p, lang);

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

  // Testimonials, shared by both journeys.
  const testimonials = (
    <section className="burgundy-tint border-y border-line">
      <div className="wrap py-28 lg:py-40">
        <h2 className="sr-only">{t.reviews.title}</h2>
        <Quotes items={t.reviews.items} label={t.reviews.choose} />
      </div>
    </section>
  );

  const sellJourney = (
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

    {/* 3. Sell with confidence: what we buy. Heading pinned on the left, numbered categories on the right. */}
    <section className="wrap grid gap-14 py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20 lg:py-36">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <RevealHeading lines={[t.sell.title]} className="text-4xl sm:text-6xl" />
        <p className="mt-6 max-w-md text-platinum-2">{t.sell.body}</p>
        <Link href={href("/sell-your-diamond/")} className="btn btn-primary mt-10">{t.hero.primary}</Link>
      </div>
      <ol className="sell-list border-t border-line">
        {t.sell.categories.map(([name, desc, path], i) => (
          <li key={path} className="border-b border-line">
            <Link href={href(path)} className="sell-row group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 py-7 sm:grid-cols-[3.5rem_1fr_auto] sm:gap-x-6 sm:py-8">
              <span className="font-display text-lg text-platinum-2 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <span>
                <span className="sell-name block font-display text-3xl sm:text-4xl">{name}</span>
                <span className="mt-2 block max-w-md text-sm text-platinum-2">{desc}</span>
              </span>
              <svg viewBox="0 0 24 24" aria-hidden className="sell-arrow size-6 self-center fill-none stroke-current [stroke-width:1.2]">
                <path d="M4 12h15M13 6l6 6-6 6" />
              </svg>
            </Link>
          </li>
        ))}
      </ol>
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
    <section className="wrap grid items-center gap-14 py-28 lg:grid-cols-2 lg:gap-24 lg:py-40">
      {story.image && (
        <div className="relative aspect-[4/5] overflow-hidden bg-ivory-deep">
          <Image src={mediaUrl(story.image)} alt={story.title} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-contain p-12" />
        </div>
      )}
      <div className="max-w-xl">
        <RevealHeading lines={[t.story.title]} className="text-4xl sm:text-5xl" />
        {t.story.body.map((p) => (
          <p key={p} className="mt-6 text-lg text-platinum-2">{p}</p>
        ))}
        <Link href={href("/about-sothis-diamonds/")} className="btn btn-secondary mt-10">{t.story.cta}</Link>
      </div>
    </section>

    {/* 8. Why Sothis: pinned stone, reasons scroll past (see WhyList). */}
    <section className="burgundy-tint border-t border-line">
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

    {testimonials}

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

  // The Buy journey: facts from the shipping and returns policies and the product data.
  const b = t.buy;
  const forSale = allProducts.filter((p) => p.in_stock && p.image);
  const railItems = [
    ...forSale.filter((p) => !p.categories.includes("Diamonds")),
    ...forSale.filter((p) => p.categories.includes("Diamonds")).sort((x, y) => (y.price ?? 0) - (x.price ?? 0)),
  ].map((p) => ({ product: p, href: productHref(p), crop: p.categories.includes("Diamonds") ? (HOME_CROPS[p.sku] ?? DEFAULT_CROP) : undefined }));
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

  const buyJourney = (
    <>
      <CollectionStage items={railItems} total={forSale.length} shopHref={href("/shop/")} line={t.paths.buy[1]} t={b} card={t.stones} />
      {/* The ring from inspection to worn: moved here from the About page. */}
      <NewChapter inspected="/brand/ring-cutout.webp" worn={mediaUrl(productBySku("SCP01").gallery[0])} t={{ title: t.about.chapterTitle, body: t.about.chapterBody, inspection: t.about.inspection }} />

      <ShapeTiles shapes={shapeCounts} shopHref={href("/shop/")} t={{ title: b.shapesTitle, line: b.shapesLine, inStock: b.inStock }} />

      {/* How buying works: the lilac asscher acts out each step, scrubbed by scroll. */}
      <section className="buy-steps border-y border-line">
        <div className="wrap">
          <StepsScroller
            steps={b.steps}
            buyStage={{
              report: [["Lab", ra.lab!], ["Carat", `${ra.carat} ct`], ["Colour", ra.color!], ["Clarity", ra.clarity!]],
              scene: b.scene,
            }}
            stepLabel={t.steps.stepOf}
            heading={<RevealHeading lines={[b.stepsTitle]} className="text-4xl sm:text-5xl" />}
            action={<Link href={href("/shop/")} className="btn btn-inverse">{b.stepsCta}</Link>}
          />
        </div>
      </section>

      {/* Why buy from Sothis: the Sell list's pattern, mirrored (list left, heading right). */}
      <section className="wrap grid gap-14 py-28 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-20 lg:py-36">
        <ol className="sell-list order-2 border-t border-line lg:order-1">
          {b.why.map(([title, body], i) => (
            <li key={title} className="sell-row grid grid-cols-[2.5rem_1fr] items-baseline gap-x-4 border-b border-line py-7 sm:grid-cols-[3.5rem_1fr] sm:gap-x-6 sm:py-8">
              <span className="font-display text-lg text-platinum-2 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <span>
                <span className="sell-name block font-display text-3xl sm:text-4xl">{title}</span>
                <span className="mt-2 block max-w-md text-sm text-platinum-2">
                  {i === 0 ? (
                    // The counts come from the data and count up as the row comes into view.
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
                </span>
              </span>
            </li>
          ))}
        </ol>
        <div className="order-1 lg:sticky lg:top-32 lg:order-2 lg:self-start">
          <RevealHeading lines={[b.whyTitle]} className="text-4xl sm:text-6xl" />
        </div>
      </section>

      {testimonials}

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

  return (
    <>
      <Loader t={t.loader} />
      {/* The homepage opens on the Sell / Buy choice; choosing Sell reveals the selling journey below.
          The buying sections (collection rail, gallery) return with the buying journey. */}
      <Opening
        photo="/brand/opening-held.webp"
        title={t.about.title}
        line={t.home.openingLine}
        scroll={t.about.scroll}
      />
      <HomeChoice
        buy={{ title: t.paths.buy[0], body: t.paths.buy[1], cta: t.home.buyCta, after: t.home.buyAfter }}
        sell={{ title: t.paths.sell[0], body: t.paths.sell[1], cta: t.home.sellCta, after: t.home.sellAfter }}
        instead={{ buy: t.home.sellInstead, sell: t.home.buyInstead }}
        change={t.home.change}
        buyJourney={buyJourney}
        sellJourney={sellJourney}
      />
    </>
  );
}
