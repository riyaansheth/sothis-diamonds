import Link from "next/link";
import { Anatomy } from "@/components/about/Anatomy";
import { Heritage } from "@/components/about/Heritage";
import { Journey } from "@/components/about/Journey";
import { Loupe } from "@/components/about/Loupe";
import { NewChapter } from "@/components/about/NewChapter";
import { Opening } from "@/components/about/Opening";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { mediaUrl, productBySku } from "@/lib/products";
import { site } from "@/lib/site";

// "The Sothis story": one real stone followed through six chapters. Every figure shown comes from
// its IGI report in the export; heritage wording is the old about page's ("a family passion in 1970").
const STONE = "E-398-248F-1B"; // Round 7.06 ct, F, SI2, IGI: studio photo, cut-out and video in the export
const STUDIO = "media/2026/09/choir-studio/round-7.06ct-F-SI2.png";
const CUTOUT = "media/2026/09/choir-studio/round-7.06ct-F-SI2-transparent-v2.png";
const RING = "SCP01"; // cushion yellow diamond ring: on white, and worn
const SUBMITTED = "media/2025/10/14-1.jpg"; // a round diamond ring on white
const BOXED = "media/2025/10/334f201a-db9d-4582-9b3c-e9091242500c.png"; // the old about page's image

/** One optimised URL for images that must be pixel-identical in two places (the loupe and its lens). */
const optimised = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=1920&q=75`;

export function AboutPage({ lang, crumbs }: { lang: Locale; crumbs: Crumb[] }) {
  const t = getDictionary(lang);
  const a = t.about;
  const stone = productBySku(STONE);
  const ring = productBySku(RING);
  const s = stone.specs;
  const num = (k: string) => Number.parseFloat(s[k] ?? "");
  const [d1, d2] = (s.Measurements ?? "").match(/[\d.]+/g) ?? [];
  const diameter = `${d1} – ${d2} mm`;
  const at = stone.attributes;
  const fill = (x: string) =>
    x.replace("{founded}", String(site.founded)).replace("{carat}", at.carat ?? "").replace("{colour}", at.color ?? "").replace("{clarity}", at.clarity ?? "").replace("{lab}", at.lab ?? "");
  const [colourName, clarityName] = [a.factors[1][0], a.factors[2][0]];

  return (
    <div data-header="clear">
      <Opening cutout={mediaUrl(CUTOUT)} title={a.title} line={a.line} scroll={a.scroll} crumbs={<Breadcrumbs items={crumbs} />} />
      <Heritage
        photo={mediaUrl(STUDIO)}
        t={{ rooted: a.rooted, since: fill(a.since), heritage: a.heritage.map(fill), then: a.then, now: a.now, nowPlace: a.nowPlace, founded: String(site.founded), caption: fill(a.stoneCaption) }}
      />
      <Loupe src={optimised(mediaUrl(STUDIO))} t={{ title: a.loupeTitle, body: a.loupeBody, inspect: a.inspect, inspectTouch: a.inspectTouch, pointsLabel: a.pointsLabel, point: a.point, points: a.points }} />
      <Anatomy
        cutout={mediaUrl(CUTOUT)}
        facts={{ table: num("Table %"), crown: num("Crown Height"), crownAngle: num("Crown Angle"), pavilion: num("Pavilion Depth"), pavilionAngle: num("Pavilion Angle"), depth: num("Depth %"), diameter }}
        values={[at.cut ?? "", at.color ?? "", at.clarity ?? "", `${at.carat} ct`, at.lab ?? "", a.inPerson, a.onTheDay]}
        t={{ title: a.anatomyTitle, body: fill(a.anatomyBody), factors: a.factors, table: a.table, crown: a.crown, pavilion: a.pavilion, depth: a.depth, diameter: a.diameter }}
      />
      <Journey
        media={{
          submit: mediaUrl(SUBMITTED),
          stone: optimised(mediaUrl(STUDIO)),
          boxed: mediaUrl(BOXED),
          cutout: mediaUrl(CUTOUT),
          doc: [
            [a.documentItem, `${at.shape} ${at.carat} ct`],
            [colourName, at.color ?? ""],
            [clarityName, at.clarity ?? ""],
            [a.documentReport, at.lab ?? ""],
          ],
        }}
        t={{
          title: a.journeyTitle, stage: a.stage, stages: a.stages, photoAdded: a.photoAdded, document: a.document, documentOffer: a.documentOffer, documentNote: a.documentNote,
          confidence: a.confidence, diameter: a.diameter, table: a.table, measure: `${a.diameter} ${diameter}`, tablePct: `${a.table} ${num("Table %")}%`,
        }}
      />
      <NewChapter inspected={mediaUrl(ring.image!)} worn={mediaUrl(ring.gallery[0])} t={{ title: a.chapterTitle, body: a.chapterBody, inspection: a.inspection }} />

      {/* Two paths, in the language of the homepage's Sell / Buy split. */}
      <section aria-label={`${a.sellTitle}, ${a.buyTitle}`}>
        <div className="paths flex min-h-[70vh] flex-col md:flex-row">
          {(
            [
              [a.sellTitle, a.sellBody, a.sellCta, localePath(lang, "/sell-your-diamond/"), "bg-[url(/brand/bg-sell.webp)]"],
              [a.buyTitle, a.buyBody, a.buyCta, localePath(lang, "/shop/"), "bg-[url(/brand/bg-buy.webp)]"],
            ] as const
          ).map(([title, body, cta, to, bg]) => (
            <Link key={title} href={to} className="group relative flex min-h-[50vh] flex-col justify-end overflow-hidden border-line p-8 sm:p-12 md:border-l md:border-l-champagne/60 md:first:border-l-0">
              <span aria-hidden className={`paths-bg ${bg}`} />
              <span aria-hidden className="paths-sheen" />
              <h2 className="relative max-w-md text-[2.75rem] leading-[1.05] sm:text-6xl">{title}</h2>
              <p className="relative mt-4 max-w-sm text-ink/80">{body}</p>
              <span className="relative mt-8 inline-block self-start border-b border-champagne pb-1 text-sm tracking-[0.04em] text-burgundy">{cta}</span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
