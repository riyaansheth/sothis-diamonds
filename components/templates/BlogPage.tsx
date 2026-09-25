import Link from "next/link";
import { Suspense } from "react";
import { BlogGrid } from "@/components/BlogGrid";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { PostCard } from "@/components/PostCard";
import { RevealHeading } from "@/components/Motion";
import { postSummary } from "@/components/templates/ArticlePage";
import { posts, terms } from "@/lib/content";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { href } from "@/lib/routes";

/** Blog index; with `category` it lists that category (the old /category/<slug>/ URLs). */
export function BlogPage({ lang, crumbs, category }: { lang: Locale; crumbs: Crumb[]; category?: string }) {
  const t = getDictionary(lang).blog;
  const inCategory = category ? posts.filter((p) => p.categories.includes(category)) : posts;
  const [featured, ...rest] = category ? [undefined, ...inCategory] : inCategory;
  // Only categories that actually have posts (the export also holds spam categories from the hack).
  const cats = terms.filter((c) => c.taxonomy === "category" && posts.some((p) => p.categories.includes(c.name)));

  return (
    <section className="wrap pb-28 pt-32">
      <Breadcrumbs items={crumbs} />
      <RevealHeading lines={[category ?? t.title]} as="h1" className="mt-8 text-5xl sm:text-6xl" />
      {!category && <p className="mt-6 max-w-xl text-lg text-platinum-2">{t.line}</p>}

      {cats.length > 1 && (
        <nav className="mt-10 flex flex-wrap gap-2 text-sm">
          <Link href={localePath(lang, "/blog/")} aria-current={!category ? "page" : undefined} className="border border-line px-4 py-2 aria-[current]:border-wine aria-[current]:bg-wine aria-[current]:text-on-accent">{t.all}</Link>
          {cats.map((c) => (
            <Link key={c.slug} href={href(lang, { kind: "category", slug: c.slug })} aria-current={category === c.name ? "page" : undefined} className="border border-line px-4 py-2 aria-[current]:border-wine aria-[current]:bg-wine aria-[current]:text-on-accent">{c.name}</Link>
          ))}
        </nav>
      )}

      {featured && (
        <div className="mt-16 border-b border-line pb-20">
          <PostCard post={postSummary(featured, lang)} lang={lang} large />
        </div>
      )}
      <div className="mt-20">
        <Suspense>
          <BlogGrid items={rest.map((p) => postSummary(p!, lang))} lang={lang} t={t} />
        </Suspense>
      </div>
    </section>
  );
}
