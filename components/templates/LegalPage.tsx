import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { ArticleBody } from "@/components/templates/ArticlePage";
import { parseArticle } from "@/lib/article";
import type { Doc } from "@/lib/content";
import { getDictionary, type Locale } from "@/lib/i18n";

export const LEGAL = ["privacy-policy", "refund_returns", "terms-conditions", "shipping-policy", "cookie-policy-sothis-diamonds"];

/** Legal text is migrated verbatim; only the layout (contents, last updated) is new. */
export function LegalPage({ doc, lang, crumbs }: { doc: Doc; lang: Locale; crumbs: Crumb[] }) {
  const a = parseArticle(doc.content_html);
  const updated = new Date(doc.modified.replace(" ", "T")).toLocaleDateString(lang, { day: "numeric", month: "long", year: "numeric" });
  return (
    <article className="pb-28 pt-32">
      <header className="wrap">
        <Breadcrumbs items={crumbs} />
        <h1 className="mt-8 text-4xl sm:text-5xl">{doc.title}</h1>
        <p className="mt-4 text-sm text-platinum-2">{getDictionary(lang).legal.updated.replace("{date}", updated)}</p>
        {a.intro && <div className="prose mt-8 max-w-[68ch]" dangerouslySetInnerHTML={{ __html: a.intro }} />}
      </header>
      <ArticleBody article={a} lang={lang} />
    </article>
  );
}
