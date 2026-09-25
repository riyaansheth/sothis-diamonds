import { Suspense } from "react";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { RevealHeading } from "@/components/Motion";
import { ValuationForm } from "@/components/ValuationForm";
import { pageBySlug } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";

/** Guided diamond description; a gemmologist replies with the valuation. No automatic prices. */
export function CalculatorPage({ lang, crumbs }: { lang: Locale; crumbs: Crumb[] }) {
  const t = getDictionary(lang);
  const c = t.calculator;
  const article = pageBySlug("diamond-valuation-calculator")?.content_html;

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
        <section className="border-t border-line">
          <div className="wrap max-w-3xl py-24">
            <h2 className="text-3xl sm:text-4xl">{c.articleTitle}</h2>
            <div className="prose mt-10" dangerouslySetInnerHTML={{ __html: article }} />
          </div>
        </section>
      )}
    </>
  );
}
