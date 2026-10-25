// The pages behind the homepage choice: /diamonds/ and /jewellery/ (Buy | Sell), and the four journeys
// under them. Each page file is two lines; everything they share lives here.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Side } from "@/components/HomeChoice";
import { KindChoice } from "@/components/KindChoice";
import { BuyJourney, SellJourney, type Kind } from "@/components/home/Journeys";
import { JourneyBand } from "@/components/home/JourneyBand";
import { getDictionary, hasLocale, localePath, locales, type Locale } from "@/lib/i18n";

export const KIND_PATH: Record<Kind, string> = { diamond: "/diamonds/", jewellery: "/jewellery/" };

// What floats over each homepage half, then over the seam of its Buy | Sell page.
export const HOME_PIECES: Record<Kind, Side["piece"]> = { diamond: { cut: "asscher", color: "#ffffff" }, jewellery: { bracelet: "#ffffff" } };

type Props = { params: Promise<{ lang: string }> };

function meta(lang: Locale, path: string, title: string, description: string): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: localePath(lang, path), languages: { ...Object.fromEntries(locales.map((l) => [l, localePath(l, path)])), "x-default": path } },
  };
}

/** /diamonds/ or /jewellery/: the chosen half settles into a band, Buy | Sell opens beneath. */
export function choicePage(kind: Kind) {
  const path = KIND_PATH[kind];
  return {
    async generateMetadata({ params }: Props): Promise<Metadata> {
      const { lang } = await params;
      if (!hasLocale(lang)) return {};
      const m = getDictionary(lang).journeys[kind];
      return meta(lang, path, m.metaTitle, m.description);
    },
    async Page({ params }: Props) {
      const { lang } = await params;
      if (!hasLocale(lang)) notFound();
      const t = getDictionary(lang);
      const j = t.journeys[kind];
      const other: Kind = kind === "diamond" ? "jewellery" : "diamond";
      return (
        <>
          <link rel="preload" as="image" href="/brand/bg-buy-burgundy.webp" fetchPriority="high" />
          <link rel="preload" as="image" href="/brand/bg-sell-black.webp" fetchPriority="high" />
          <KindChoice
            band={{ title: j.title, body: j.body, cta: j.cta, silk: kind === "diamond" ? "buy" : "sell", instead: j.instead, insteadLabel: t.journeys[other].cta, insteadHref: localePath(lang, KIND_PATH[other]) }}
            piece={HOME_PIECES[kind]}
            sides={[
              { title: j.buy.title, body: j.buy.body, cta: j.buy.cta, href: localePath(lang, `${path}buy/`), silk: "buy" },
              { title: j.sell.title, body: j.sell.body, cta: j.sell.cta, href: localePath(lang, `${path}sell/`), silk: "sell" },
            ]}
          />
        </>
      );
    },
  };
}

/** One of the four journeys, opening with the band its half collapsed into. */
export function journeyPage(kind: Kind, side: "buy" | "sell") {
  const path = `${KIND_PATH[kind]}${side}/`;
  const other = `${KIND_PATH[kind]}${side === "buy" ? "sell" : "buy"}/`;
  return {
    async generateMetadata({ params }: Props): Promise<Metadata> {
      const { lang } = await params;
      if (!hasLocale(lang)) return {};
      const m = getDictionary(lang).journeys[kind][side];
      return meta(lang, path, m.metaTitle, m.description);
    },
    async Page({ params }: Props) {
      const { lang } = await params;
      if (!hasLocale(lang)) notFound();
      const t = getDictionary(lang);
      return (
        <>
          <JourneyBand
            side={side}
            title={t.journeys[kind][side].title}
            line={side === "buy" ? t.home.buyAfter : t.home.sellAfter}
            instead={side === "buy" ? t.home.sellInstead : t.home.buyInstead}
            insteadHref={localePath(lang, other)}
          />
          {side === "buy" ? <BuyJourney lang={lang} kind={kind} /> : <SellJourney lang={lang} kind={kind} />}
        </>
      );
    },
  };
}
