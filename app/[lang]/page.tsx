import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Newsletter, QuickValuation } from "@/components/Forms";
import { Loader } from "@/components/Loader";
import { InView, Quotes, Rail, RevealHeading, StepsScroller } from "@/components/Motion";
import { ProductCard } from "@/components/ProductCard";
import { StoneChoir, type ChoirStone } from "@/components/StoneChoir";
import { Diamond3DLazy } from "@/components/Diamond3DLazy";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";
import { diameterMm, displayName, inStockDiamonds, mediaUrl, productBySku, productPath, type Product } from "@/lib/products";

// The four hero stones, left to right. Transparent studio variants let them sit naturally on the page ground.
const CHOIR = [
  { sku: "E-398-248F-1B", image: "media/2026/09/choir-studio/round-7.06ct-F-SI2-transparent-v2.png", crop: { cx: 0.5, cy: 0.5, d: 0.64 }, shape: "round" },
  { sku: "FCHE-248E-1A", image: "media/2026/09/choir-studio/heart-5.01ct-fancy-light-yellow-SI2-transparent-v2.png", crop: { cx: 0.5, cy: 0.5, d: 0.69 }, shape: "heart" },
  { sku: "FCRA-243E-5A", image: "media/2026/09/choir-studio/radiant-1.09ct-fancy-intense-yellow-VVS1-transparent-v2.png", crop: { cx: 0.5, cy: 0.5, d: 0.63 }, shape: "square" },
  { sku: "S-1889", image: "media/2026/09/choir-studio/round-5.02ct-J-SI2-transparent-v2.png", crop: { cx: 0.5, cy: 0.5, d: 0.62 }, shape: "round" },
] as const;
const STEPS_STONE = "S-1976"; // RD 1.09ct F IF (IGI): the stone that acts out "How selling works"
const STORY_PIECE = "SCP01"; // Cushion yellow diamond ring, photographed on white

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const href = (path: string) => localePath(lang, path);
  const productHref = (p: Product) => productPath(p, lang);

  const choir: ChoirStone[] = CHOIR.map(({ sku, image, crop, shape }) => {
    const p = productBySku(sku);
    return {
      id: p.id,
      href: productHref(p),
      name: displayName(p),
      details: [p.attributes.color, p.attributes.clarity, p.attributes.lab].filter(Boolean).join(", "),
      priceUsd: p.price,
      image: mediaUrl(image),
      crop,
      shape,
      mm: diameterMm(p),
    };
  });
  const choirSkus: string[] = CHOIR.map((c) => c.sku);
  const collection = inStockDiamonds()
    .filter((p) => !choirSkus.includes(p.sku) && p.image)
    .sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    .slice(0, 10);
  const story = productBySku(STORY_PIECE);
  const stepsStone = productBySku(STEPS_STONE);
  const pct = (k: string) => Number.parseFloat(stepsStone.specs[k] ?? "");
  const sc = t.steps.scene;
  const stage = {
    image: mediaUrl(stepsStone.image!),
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
      {/* 1. The stones, to scale */}
      <section className="choir-section pt-20">
        <div className="flex min-h-dvh flex-col items-center justify-center overflow-hidden border-t border-line px-4 py-24">
          <InView className="flex flex-col items-center">
            <StoneChoir stones={choir} intro={t.hero.choirIntro} />

            <h1 className="hero-title mt-12 text-center text-[2.75rem] leading-[1.02] sm:mt-16 sm:text-6xl lg:text-7xl" aria-label={t.hero.title}>
              {t.hero.titleLines.map(([small, caps], i) => (
                <span key={caps} aria-hidden className={`reveal-line ${i === 0 ? "sm:-translate-x-[12%]" : "sm:translate-x-[12%]"}`}>
                  <span>
                    <em className="font-display text-[0.62em] font-normal italic text-burgundy">{small}</em> <span className="uppercase tracking-[0.02em]">{caps}</span>
                  </span>
                </span>
              ))}
            </h1>

            <div className="hero-after mt-10 flex flex-col items-center gap-8 text-center">
              <p className="max-w-lg text-platinum-2">{t.hero.intro}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href={href("/sell-diamond/")} className="btn btn-primary">{t.hero.primary}</Link>
                <Link href={href("/shop/")} className="btn btn-secondary">{t.hero.secondary}</Link>
              </div>
            </div>
          </InView>
        </div>
      </section>

      {/* 2. Two ways in: sell or buy. Widening a panel never resizes its 3D canvas. */}
      <section>
        <div className="paths flex min-h-[calc(100dvh-5rem)] flex-col md:flex-row">
          {(
            [
              [t.paths.sell, "round", "#ffffff", href("/sell-diamond/")],
              [t.paths.buy, "asscher", "#f5d44a", href("/shop/")],
            ] as const
          ).map(([[title, body, cta], cut, color, to]) => (
            <Link key={title} href={to} className="group relative flex min-h-[70vh] flex-col justify-end border-line p-8 sm:p-12 md:border-l md:first:border-l-0">
              <div aria-hidden className="paths-window absolute left-1/2 top-[6%] isolate aspect-square w-[min(30rem,80vw)] -translate-x-1/2 md:top-1/2 md:w-[min(30rem,34vw)] md:-translate-y-[72%]">
                <span className="paths-spotlight pointer-events-none absolute inset-[5%] -z-10 rounded-full" />
                <div className="pointer-events-none absolute inset-x-[22%] bottom-[16%] h-[14%] rounded-full bg-[radial-gradient(closest-side,rgb(81_31_42/0.18),transparent)] blur-md" />
                <Diamond3DLazy cut={cut} color={color} className="pointer-events-none absolute inset-0" />
              </div>
              <h2 className="relative text-6xl sm:text-8xl">{title}</h2>
              <p className="relative mt-4 max-w-sm text-ink/80">{body}</p>
              <span className="relative mt-8 inline-block self-start border-b border-champagne pb-1 text-sm tracking-[0.04em] text-burgundy">{cta}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Sell with confidence: what we buy */}
      <section className="wrap py-28 text-center lg:py-40">
        <RevealHeading lines={[t.sell.title]} className="text-4xl sm:text-6xl" />
        <p className="mx-auto mt-6 max-w-xl text-platinum-2">{t.sell.body}</p>
        <ul className="mx-auto mt-16 flex max-w-5xl flex-wrap justify-center gap-x-10 gap-y-6">
          {t.sell.categories.map(([name, desc, path]) => (
            <li key={path}>
              <Link href={href(path)} className="group block" title={desc}>
                <span className="font-display text-2xl transition-colors group-hover:text-burgundy sm:text-3xl">{name}</span>
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
            action={<Link href={href("/sell-diamond/")} className="btn btn-primary">{t.steps.cta}</Link>}
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

      {/* 6. The collection */}
      <section className="border-t border-line py-28 lg:py-36">
        <div className="wrap text-center">
          <RevealHeading lines={[t.stones.title]} className="text-4xl sm:text-6xl" />
          <p className="mt-5 text-platinum-2">{t.stones.body}</p>
        </div>
        <div className="wrap mt-16">
          <Rail prev={t.stones.prev} next={t.stones.next}>
            {collection.map((p) => (
              <li key={p.id} className="w-[78vw] shrink-0 snap-start sm:w-[22rem]">
                <ProductCard product={p} href={productHref(p)} t={t.stones} />
              </li>
            ))}
          </Rail>
          <div className="mt-10 text-center">
            <Link href={href("/product-category/diamonds/")} className="btn btn-secondary">{t.stones.all}</Link>
          </div>
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

      {/* 8. Why Sothis */}
      <section className="border-t border-line">
        <div className="wrap py-28 text-center lg:py-36">
          <RevealHeading lines={[t.why.title]} className="text-4xl sm:text-6xl" />
          <ul className="mx-auto mt-16 grid max-w-6xl gap-x-12 gap-y-12 text-left sm:grid-cols-2 lg:grid-cols-3">
            {t.why.items.map(([title, body]) => (
              <li key={title}>
                <h3 className="text-2xl">{title}</h3>
                <p className="mt-2 text-platinum-2">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 9. Testimonials */}
      <section className="border-y border-line bg-ivory-deep">
        <div className="wrap py-28 lg:py-40">
          <h2 className="sr-only">{t.reviews.title}</h2>
          <Quotes items={t.reviews.items} label={t.reviews.choose} />
        </div>
      </section>

      {/* 10. Gallery (becomes the Instagram feed once the account is connected) */}
      <section className="py-28 lg:py-36">
        <div className="wrap text-center">
          <RevealHeading lines={[t.gallery.title]} className="text-[2.25rem] [overflow-wrap:anywhere] sm:text-5xl" />
          <p className="mt-4 text-platinum-2">{t.gallery.body}</p>
        </div>
        <ul className="mt-14 grid grid-cols-3 gap-1 sm:grid-cols-6">
          {collection.slice(0, 6).map((p) => (
            <li key={p.id}>
              <Link href={productHref(p)} className="relative block aspect-square overflow-hidden bg-ivory-deep">
                <Image src={mediaUrl(p.image!)} alt={displayName(p)} fill sizes="(min-width: 640px) 17vw, 33vw" className="object-cover transition-transform duration-[1.2s] hover:scale-110" />
              </Link>
            </li>
          ))}
        </ul>
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
      <section className="bg-wine text-on-accent">
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
