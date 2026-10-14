import { notFound } from "next/navigation";
import { HomeChoice } from "@/components/HomeChoice";
import { Loader } from "@/components/Loader";
import { Opening } from "@/components/Opening";
import { getDictionary, hasLocale, localePath } from "@/lib/i18n";

// The homepage is the opening and the New | Pre-owned choice; each side leads to its own page.
export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <>
      {/* The New | Pre-owned backgrounds are CSS backgrounds (found late) and the page's largest paint: fetch them early. */}
      <link rel="preload" as="image" href="/brand/bg-buy-burgundy.webp" fetchPriority="high" />
      <link rel="preload" as="image" href="/brand/bg-sell-black.webp" fetchPriority="high" />
      <Loader t={t.loader} />
      <Opening photo="/brand/opening-held.webp" title={t.about.title} line={t.home.openingLine} scroll={t.about.scroll} />
      <HomeChoice
        buy={{ title: t.paths.buy[0], body: t.paths.buy[1], cta: t.home.buyCta, after: t.home.buyAfter, href: localePath(lang, "/new/") }}
        sell={{ title: t.paths.sell[0], body: t.paths.sell[1], cta: t.home.sellCta, after: t.home.sellAfter, href: localePath(lang, "/pre-owned/") }}
      />
    </>
  );
}
