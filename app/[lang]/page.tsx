import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Newsletter, QuickValuation } from "@/components/Forms";
import { Loader } from "@/components/Loader";
import { Quotes, RevealHeading, StepsScroller } from "@/components/Motion";
import type { Crop } from "@/components/CroppedImage";
import { HomeChoice } from "@/components/HomeChoice";
import { Opening } from "@/components/Opening";
import { WhyList } from "@/components/WhyList";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { displayName, inStockDiamonds, mediaUrl, productBySku, productPath, type Product } from "@/lib/products";

// Homepage crops: a square around each stone that stops above its certificate card (and clear of the
// filename and sparkle marks). Measured by eye from the photos; product pages show the full photo.
// ponytail: hand-measured per SKU; a stone added to the homepage without an entry shows uncropped.
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
};

// The opening stone: studio cut-out of the round 7.06 ct F SI2 (E-398-248F-1B), as on the About page.
const OPENING_STONE = "media/2026/09/choir-studio/round-7.06ct-F-SI2-transparent-v2.png";
const STEPS_STONE = "S-1976"; // RD 1.09ct F IF (IGI): the stone that acts out "How selling works"
const STORY_PIECE = "SCP01"; // Cushion yellow diamond ring, photographed on white

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const href = (path: string) => localePath(lang, path);
  const productHref = (p: Product) => productPath(p, lang);

  const collection = inStockDiamonds()
    .filter((p) => p.image)
    .sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    .slice(0, 10);
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
      <Loader t={t.loader} />
      {/* The homepage opens on the Sell / Buy choice; choosing Sell reveals the selling journey below.
          The buying sections (collection rail, gallery) return with the buying journey. */}
      <Opening
        cutout={mediaUrl(OPENING_STONE)}
        title={t.about.title}
        line={t.home.openingLine}
        scroll={t.about.scroll}
        className="motion-safe:lg:h-[200vh]"
      />
      <HomeChoice
        sell={{ title: t.paths.sell[0], body: t.paths.sell[1], cta: t.home.sellCta }}
        buy={{ title: t.paths.buy[0], body: t.paths.buy[1], cta: t.paths.buy[2] }}
        sellAfter={t.home.sellAfter}
        buyInstead={t.home.buyInstead}
        change={t.home.change}
        shopHref={href("/shop/")}
      >
        {/* 3. Sell with confidence: what we buy */}
        <section className="wrap py-28 text-center lg:py-40">
          <RevealHeading lines={[t.sell.title]} className="text-4xl sm:text-6xl" />
          <p className="mx-auto mt-6 max-w-xl text-platinum-2">{t.sell.body}</p>
          <ul className="mx-auto mt-16 flex max-w-5xl flex-wrap justify-center gap-x-10 gap-y-6">
            {t.sell.categories.map(([name, desc, path]) => (
              <li key={path}>
                <Link href={href(path)} className="group block" title={desc}>
                  <span className="inline-block origin-center font-display text-2xl transition-[color,transform] duration-300 ease-out group-hover:scale-110 group-hover:text-burgundy group-focus-visible:scale-110 group-focus-visible:text-burgundy motion-reduce:transition-colors motion-reduce:group-hover:scale-100 sm:text-3xl">{name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

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
        <section className="border-t border-line">
          <div className="wrap pt-28 lg:pt-36">
            <RevealHeading lines={[t.why.title]} className="text-4xl sm:text-6xl" />
          </div>
          <div className="mt-12 lg:mt-16">
            <WhyList
              items={t.why.items}
              view={t.stones.viewStone}
              stones={collection.slice(-6).map((p) => ({ src: mediaUrl(p.image!), name: displayName(p), href: productHref(p), crop: HOME_CROPS[p.sku] }))}
            />
          </div>
        </section>

        {/* 9. Testimonials */}
        <section className="border-y border-line bg-ivory-deep bg-[url(/brand/bg-quotes.webp)] bg-cover bg-center">
          <div className="wrap py-28 lg:py-40">
            <h2 className="sr-only">{t.reviews.title}</h2>
            <Quotes items={t.reviews.items} label={t.reviews.choose} />
          </div>
        </section>

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
      </HomeChoice>
    </>
  );
}
