import { Suspense } from "react";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { RevealHeading } from "@/components/Motion";
import { ValuationForm, type ItemType } from "@/components/ValuationForm";
import { getDictionary, type Locale } from "@/lib/i18n";

type PageKey = ItemType | "general";

/** One template for every "sell to us" page; each item type has its own copy and form fields. */
export function SellPage({ lang, kind, crumbs }: { lang: Locale; kind: PageKey; crumbs: Crumb[] }) {
  const t = getDictionary(lang);
  const s = t.sellPage;
  const page = s.pages[kind];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: s.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };

  return (
    <>
      <section className="wrap grid gap-14 pb-24 pt-32 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Breadcrumbs items={crumbs} />
          <RevealHeading lines={[page.title]} as="h1" className="mt-8 text-5xl sm:text-6xl" />
          <p className="mt-6 max-w-md text-lg text-platinum-2">{page.line}</p>
          <ul className="mt-10 space-y-2 text-sm">
            {t.hero.promises.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <span aria-hidden className="h-px w-6 bg-champagne" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div id="valuation" className="bg-ivory-deep p-6 sm:p-10">
          <h2 className="mb-8 text-3xl">{s.formTitle}</h2>
          <Suspense>
            <ValuationForm t={t.form} lang={lang} fixedType={kind === "general" ? undefined : kind} />
          </Suspense>
        </div>
      </section>

      <section className="border-y border-line bg-ivory-deep">
        <div className="wrap py-20">
          <h2 className="text-3xl sm:text-4xl">{s.stepsTitle}</h2>
          <ol className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {t.steps.items.map(([title, body], i) => (
              <li key={title} className="border-t border-line pt-5">
                <span className="font-display text-2xl text-champagne">{i + 1}</span>
                <h3 className="mt-2 text-xl">{title}</h3>
                <p className="mt-2 max-w-xs text-platinum-2">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap grid gap-16 py-24 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl sm:text-4xl">{s.buysTitle}</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {page.buys.map((b) => (
              <li key={b} className="border-b border-line pb-3 font-display text-xl">{b}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-3xl sm:text-4xl">{s.valuesTitle}</h2>
          <dl className="mt-8 space-y-6">
            {s.values.map(([k, v]) => (
              <div key={k}>
                <dt className="text-lg font-semibold">{k}</dt>
                <dd className="mt-1 text-platinum-2">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="wrap max-w-4xl py-24">
          <h2 className="text-3xl sm:text-4xl">{s.faqTitle}</h2>
          <div className="mt-10 divide-y divide-line border-y border-line">
            {s.faq.map(([q, a]) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-xl">
                  {q}
                  <span aria-hidden className="text-champagne transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl text-platinum-2">{a}</p>
              </details>
            ))}
          </div>
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      </section>
    </>
  );
}
