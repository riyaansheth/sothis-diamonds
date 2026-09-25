import { Suspense } from "react";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";
import { RevealHeading } from "@/components/Motion";
import { getDictionary, type Locale } from "@/lib/i18n";
import { site, telHref } from "@/lib/site";

export function ContactPage({ lang, crumbs }: { lang: Locale; crumbs: Crumb[] }) {
  const t = getDictionary(lang);
  const c = t.contact;
  const a = site.address;
  const block = "border-t border-line pt-5";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    name: site.name,
    url: site.url,
    email: site.email,
    telephone: site.phones[0],
    address: { "@type": "PostalAddress", streetAddress: a.street, postalCode: a.postcode, addressLocality: a.city, addressCountry: "BE" },
  };

  return (
    <section className="wrap grid gap-16 pb-28 pt-32 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
      <div>
        <Breadcrumbs items={crumbs} />
        <RevealHeading lines={[c.title]} as="h1" className="mt-8 text-5xl sm:text-6xl" />
        <p className="mt-6 max-w-md text-lg text-platinum-2">{c.line}</p>

        <dl className="mt-12 space-y-8">
          <div className={block}>
            <dt className="text-sm text-platinum-2">{c.visit}</dt>
            <dd className="mt-2 text-lg">
              <address className="not-italic">{a.street}<br />{a.postcode} {a.city}, {a.country}</address>
              <a href={site.mapUrl} target="_blank" rel="noopener" className="mt-2 inline-block text-sm font-semibold text-burgundy underline-offset-4 hover:underline">{c.map}</a>
            </dd>
          </div>
          <div className={block}>
            <dt className="text-sm text-platinum-2">{c.call}</dt>
            {site.phones.map((p) => (
              <dd key={p} className="mt-2 text-lg"><a href={telHref(p)} className="hover:text-burgundy">{p}</a></dd>
            ))}
          </div>
          <div className={block}>
            <dt className="text-sm text-platinum-2">{c.write}</dt>
            <dd className="mt-2 text-lg"><a href={`mailto:${site.email}`} className="hover:text-burgundy">{site.email}</a></dd>
          </div>
          {site.hours && (
            <div className={block}>
              <dt className="text-sm text-platinum-2">{c.hours}</dt>
              <dd className="mt-2 text-lg">{site.hours}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="h-fit bg-ivory-deep p-6 sm:p-10">
        <h2 className="mb-8 text-3xl">{c.formTitle}</h2>
        <Suspense>
          <ContactForm t={c} f={t.form} />
        </Suspense>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}
