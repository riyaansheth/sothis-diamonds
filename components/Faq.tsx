/** Questions as open/close rows, with FAQPage data for search and answer engines. */
export function Faq({ title, items }: { title: string; items: string[][] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
  return (
    <div className="wrap max-w-4xl py-24">
      <h2 className="text-3xl sm:text-4xl">{title}</h2>
      <div className="mt-10 divide-y divide-line border-y border-line">
        {items.map(([q, a]) => (
          <details key={q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-xl">
              {q}
              <span aria-hidden className="text-white transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 max-w-2xl text-platinum-2">{a}</p>
          </details>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
