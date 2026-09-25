import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { PostCard, type PostSummary } from "@/components/PostCard";
import { ValuationForm } from "@/components/ValuationForm";
import { parseArticle, readingMinutes, text, type Article } from "@/lib/article";
import { pageBySlug, posts, type Doc } from "@/lib/content";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { mediaUrl } from "@/lib/products";
import { href } from "@/lib/routes";
import { site } from "@/lib/site";

/** The long-form selling guides (old SEO pages). They get the valuation form right after the quick answer. */
export const GUIDES = [
  "sell-your-engagement-ring",
  "sell-your-diamond-ring",
  "free-diamond-valuation-belgium",
  "sell-your-diamond-belgium",
  "sell-diamond-without-certificate",
  "sell-loose-diamond",
  "sell-diamond-jewellery",
];

export function postSummary(p: Doc, lang: Locale): PostSummary {
  const t = getDictionary(lang).blog;
  return {
    slug: p.slug,
    href: href(lang, { kind: "post", slug: p.slug }),
    title: p.title,
    excerpt: text(p.excerpt),
    image: p.featured_image ? mediaUrl(p.featured_image) : undefined,
    date: p.date,
    minutes: t.minutes.replace("{n}", String(readingMinutes(p.content_html))),
  };
}

export function ArticlePage({ doc, lang, crumbs, kind }: { doc: Doc; lang: Locale; crumbs: Crumb[]; kind: "guide" | "post" }) {
  const t = getDictionary(lang);
  const b = t.blog;
  const a = parseArticle(doc.content_html);
  const hero = kind === "post" && doc.featured_image ? mediaUrl(doc.featured_image) : a.hero;

  const related =
    kind === "post"
      ? posts.filter((p) => p.slug !== doc.slug && p.categories.some((c) => doc.categories.includes(c))).slice(0, 3).map((p) => postSummary(p, lang))
      : [];
  const guides = kind === "guide" ? GUIDES.filter((g) => g !== doc.slug).map((g) => pageBySlug(g)).filter((g): g is Doc => Boolean(g)) : [];

  const jsonLd = [
    kind === "post" && {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: doc.title,
      datePublished: doc.date,
      dateModified: doc.modified,
      image: hero ? `${site.url}${hero}` : undefined,
      author: { "@type": "Organization", name: site.name },
      publisher: { "@type": "Organization", name: site.name },
    },
    a.faq && {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: a.faq.items.map(([q, ans]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: text(ans) } })),
    },
  ].filter(Boolean);

  return (
    <article className="pb-28 pt-32">
      <header className="wrap">
        <Breadcrumbs items={crumbs} />
        <div className="mt-10 max-w-4xl">
          {kind === "post" && (
            <p className="text-sm text-platinum-2">
              <time dateTime={doc.date}>{new Date(doc.date).toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric" })}</time>
              <span className="ml-4">{b.minutes.replace("{n}", String(readingMinutes(doc.content_html)))}</span>
            </p>
          )}
          <h1 className="mt-3 text-[2.5rem] leading-[1.05] sm:text-5xl">{doc.title}</h1>
        </div>
        {a.intro && <div className="prose mt-8 max-w-[68ch] text-lg text-platinum-2" dangerouslySetInnerHTML={{ __html: a.intro }} />}
        {hero && (
          <div className="relative mt-12 aspect-[16/9] overflow-hidden bg-ivory-deep sm:aspect-[21/9]">
            <Image src={hero} alt="" fill priority sizes="100vw" className="object-cover" />
          </div>
        )}
      </header>

      {a.quick && (
        <section aria-labelledby="quick" className="wrap mt-16">
          <div className="max-w-4xl border-l-2 border-champagne bg-ivory-deep p-6 sm:p-10">
            <h2 id="quick" className="text-sm font-sans font-semibold text-burgundy">{b.quick}</h2>
            <p className="mt-2 font-display text-xl sm:text-2xl">{a.quick.title.replace(/^quick answer:?\s*/i, "")}</p>
            <div className="prose mt-5" dangerouslySetInnerHTML={{ __html: a.quick.html }} />
          </div>
        </section>
      )}

      {kind === "guide" && (
        <section id="valuation" className="wrap mt-16">
          <div className="bg-ivory-deep p-6 sm:p-10">
            <h2 className="mb-8 text-3xl">{b.formTitle}</h2>
            <Suspense>
              <ValuationForm t={t.form} lang={lang} />
            </Suspense>
          </div>
        </section>
      )}

      <ArticleBody article={a} lang={lang} />

      {guides.length > 0 && (
        <section className="wrap mt-24 border-t border-line pt-16">
          <h2 className="text-3xl">{b.guides}</h2>
          <ul className="mt-8 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((g) => (
              <li key={g.slug} className="border-b border-line">
                <Link href={href(lang, { kind: "page", slug: g.slug })} className="block py-4 font-display text-lg hover:text-burgundy">{g.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {kind === "post" && (
        <>
          <section className="wrap mt-24">
            <div className="bg-wine px-8 py-14 text-center text-on-accent sm:px-16">
              <h2 className="text-3xl sm:text-4xl">{b.valuationTitle}</h2>
              <p className="mx-auto mt-4 max-w-lg opacity-85">{b.valuationBody}</p>
              <Link href={localePath(lang, "/sell-your-diamond/")} className="btn btn-inverse mt-8">{b.valuationCta}</Link>
            </div>
          </section>
          {related.length > 0 && (
            <section className="wrap mt-24">
              <h2 className="text-3xl">{b.related}</h2>
              <div className="mt-10 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => <PostCard key={p.slug} post={p} lang={lang} />)}
              </div>
            </section>
          )}
        </>
      )}

      {jsonLd.map((j, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }} />
      ))}
    </article>
  );
}

/** Sections with a sticky table of contents, then the FAQ as an accordion. */
export function ArticleBody({ article: a, lang }: { article: Article; lang: Locale }) {
  const b = getDictionary(lang).blog;
  const toc = [...a.sections, ...(a.faq ? [{ id: "faq", title: a.faq.title }] : [])];
  return (
    <div className="wrap mt-20 grid gap-12 lg:grid-cols-[15rem_1fr] lg:gap-20">
      {toc.length > 2 ? (
        <nav aria-label={b.contents} className="hidden lg:block">
          <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <p className="text-sm font-semibold">{b.contents}</p>
            <ol className="mt-4 space-y-2.5 border-l border-line text-sm">
              {toc.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="-ml-px block border-l border-transparent pl-4 text-platinum-2 hover:border-burgundy hover:text-ink">{s.title}</a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
      ) : (
        <div className="hidden lg:block" />
      )}

      <div className="min-w-0 max-w-[68ch]">
        {a.sections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-28 [&+&]:mt-16">
            <h2 className="text-[1.75rem] leading-tight sm:text-2xl">{s.title}</h2>
            <div className="prose mt-6" dangerouslySetInnerHTML={{ __html: s.html }} />
          </section>
        ))}

        {a.faq && (
          <section id="faq" className="mt-20 scroll-mt-28">
            <h2 className="text-[1.75rem] leading-tight sm:text-2xl">{a.faq.title}</h2>
            <div className="mt-8 divide-y divide-line border-y border-line">
              {a.faq.items.map(([q, ans]) => (
                <details key={q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg">
                    {q}
                    <span aria-hidden className="text-champagne transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <div className="prose mt-3 text-platinum-2" dangerouslySetInnerHTML={{ __html: ans }} />
                </details>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
