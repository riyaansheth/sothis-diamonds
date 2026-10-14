import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BuyJourney } from "@/components/home/Journeys";
import { JourneyBand } from "@/components/home/JourneyBand";
import { getDictionary, hasLocale, localePath, locales } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/new">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const m = getDictionary(lang).journeys.buy;
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: localePath(lang, "/new/"), languages: { ...Object.fromEntries(locales.map((l) => [l, localePath(l, "/new/")])), "x-default": "/new/" } },
  };
}

export default async function NewPage({ params }: PageProps<"/[lang]/new">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <>
      <JourneyBand side="buy" title={t.paths.buy[0]} line={t.home.buyAfter} instead={t.home.sellInstead} insteadHref={localePath(lang, "/pre-owned/")} />
      <BuyJourney lang={lang} />
    </>
  );
}
