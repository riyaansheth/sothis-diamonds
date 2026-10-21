import { notFound } from "next/navigation";
import { HomeChoice, type Side } from "@/components/HomeChoice";
import { HOME_PIECES, KIND_PATH } from "@/components/home/JourneyPages";
import { Loader } from "@/components/Loader";
import { Opening } from "@/components/Opening";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";

// The homepage is the opening and the Diamond | Jewellery choice; each side leads to its own Buy | Sell page.
export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <>
      {/* The two halves' backgrounds are CSS backgrounds (found late) and the page's largest paint: fetch them early. */}
      <link rel="preload" as="image" href="/brand/bg-buy-burgundy.webp" fetchPriority="high" />
      <link rel="preload" as="image" href="/brand/bg-sell-black.webp" fetchPriority="high" />
      <Loader t={t.loader} />
      <Opening photo="/brand/opening-held.webp" title={t.about.title} line={t.home.openingLine} scroll={t.about.scroll} />
      <HomeChoice
        sides={(["diamond", "jewellery"] as const).map((k, i) => {
          const { title, body, cta } = t.journeys[k];
          return { title, body, cta, href: localePath(lang, KIND_PATH[k]), silk: i ? "sell" : "buy", piece: HOME_PIECES[k] } as const;
        }) as [Side, Side]}
      />
    </>
  );
}
