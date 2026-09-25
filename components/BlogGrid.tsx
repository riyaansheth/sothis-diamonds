"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PostCard, type PostSummary } from "./PostCard";

const PER_PAGE = 9;

/** The post grid, paginated by ?page= so pages can be linked and "back" works. */
export function BlogGrid({ items, lang, t }: { items: PostSummary[]; lang: string; t: { prev: string; next: string; page: string; empty: string } }) {
  const pages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number(useSearchParams().get("page")) || 1));
  const shown = items.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const to = (n: number) => (n === 1 ? "?" : `?page=${n}`);

  if (!items.length) return <p className="text-platinum-2">{t.empty}</p>;
  return (
    <>
      <div className="grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => <PostCard key={p.slug} post={p} lang={lang} />)}
      </div>
      {pages > 1 && (
        <nav aria-label={t.page.replace("{n}", String(page))} className="mt-20 flex items-center justify-center gap-2 text-sm">
          {page > 1 && <Link href={to(page - 1)} className="px-3 py-2" aria-label={t.prev}>←</Link>}
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link key={n} href={to(n)} aria-current={n === page ? "page" : undefined} aria-label={t.page.replace("{n}", String(n))} className="grid size-10 place-items-center border border-transparent hover:border-line aria-[current]:border-wine aria-[current]:bg-wine aria-[current]:text-on-accent">
              {n}
            </Link>
          ))}
          {page < pages && <Link href={to(page + 1)} className="px-3 py-2" aria-label={t.next}>→</Link>}
        </nav>
      )}
    </>
  );
}
