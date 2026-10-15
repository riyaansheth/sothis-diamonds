import Link from "next/link";

/**
 * Questions as open/close rows, with FAQPage data for search and answer engines. Title and a contact
 * line on the left (sticky on desktop), the questions on the right, on the burgundy tint.
 */
export function Faq({ title, items, more }: { title: string; items: string[][]; more?: { text: string; label: string; href: string } }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
  return (
    <div className="burgundy-tint">
      <div className="wrap grid gap-10 py-16 sm:py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="text-3xl sm:text-4xl">{title}</h2>
          {more && (
            <>
              <p className="mt-4 max-w-xs text-platinum-2">{more.text}</p>
              <Link href={more.href} className="mt-5 inline-block border-b border-white/70 pb-1 text-sm">{more.label}</Link>
            </>
          )}
        </div>
        <div className="divide-y divide-line border-y border-line">
          {items.map(([q, a]) => (
            <details key={q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg">
                {q}
                <span aria-hidden className="text-white transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-2xl pb-1 text-platinum-2">{a}</p>
            </details>
          ))}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
