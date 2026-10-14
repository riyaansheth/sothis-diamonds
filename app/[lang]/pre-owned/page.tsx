import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SellJourney } from "@/components/home/Journeys";
import { JourneyBand } from "@/components/home/JourneyBand";
import { getDictionary, hasLocale, localePath, locales } from "@/lib/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/pre-owned">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const m = getDictionary(lang).journeys.sell;
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: localePath(lang, "/pre-owned/"), languages: { ...Object.fromEntries(locales.map((l) => [l, localePath(l, "/pre-owned/")])), "x-default": "/pre-owned/" } },
  };
}

export default async function PreOwnedPage({ params }: PageProps<"/[lang]/pre-owned">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <>
      <JourneyBand side="sell" title={t.paths.sell[0]} line={t.home.sellAfter} instead={t.home.buyInstead} insteadHref={localePath(lang, "/new/")} />
      <SellJourney lang={lang} />
    </>
  );
}
