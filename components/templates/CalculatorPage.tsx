import { Suspense } from "react";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { RevealHeading } from "@/components/Motion";
import { ValuationForm } from "@/components/ValuationForm";
import { ArticleBody } from "@/components/templates/ArticlePage";
import { parseArticle } from "@/lib/article";
import { pageBySlug } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";

/** Guided diamond description; a gemmologist replies with the valuation. No automatic prices. */
export function CalculatorPage({ lang, crumbs }: { lang: Locale; crumbs: Crumb[] }) {
  const t = getDictionary(lang);
  const c = t.calculator;
  const html = pageBySlug("diamond-valuation-calculator")?.content_html;
  const article = html ? parseArticle(html) : undefined;

  return (
    <>
      <section className="wrap pb-24 pt-32">
        <Breadcrumbs items={crumbs} />
        <RevealHeading lines={[c.title]} as="h1" className="mt-8 text-5xl sm:text-6xl" />
        <p className="mt-6 max-w-2xl text-lg text-platinum-2">{c.line}</p>

        <div id="valuation" className="mt-14 bg-ivory-deep p-6 sm:p-10">
          <h2 className="mb-8 text-3xl">{c.formTitle}</h2>
          <Suspense>
            <ValuationForm t={t.form} lang={lang} fixedType="diamond" calculator={c} />
          </Suspense>
        </div>
      </section>

      {article && (
        <section className="border-t border-line pb-28">
          <div className="wrap pt-20">
            <h2 className="text-3xl">{c.articleTitle}</h2>
            {article.intro && <div className="prose mt-6 max-w-[68ch] text-platinum-2" dangerouslySetInnerHTML={{ __html: article.intro }} />}
          </div>
          {article.quick && (
            <div className="wrap mt-12">
              <div className="max-w-4xl border-l-2 border-champagne bg-ivory p-6 sm:p-10">
                <h2 className="font-display text-2xl">{article.quick.title.replace(/^quick answer:?\s*/i, "")}</h2>
                <div className="prose mt-5" dangerouslySetInnerHTML={{ __html: article.quick.html }} />
              </div>
            </div>
          )}
          <ArticleBody article={article} lang={lang} />
        </section>
      )}
    </>
  );
}
