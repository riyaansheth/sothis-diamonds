import Link from "next/link";
import { site } from "@/lib/site";

export type Crumb = { label: string; href: string };

/** Visible trail plus BreadcrumbList structured data. The last crumb is the current page. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: `${site.url}${c.href}` })),
  };
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-platinum-2">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((c, i) => (
          <li key={c.href} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className="text-champagne">/</span>}
            {i === items.length - 1 ? (
              <span aria-current="page" className="text-ink">{c.label}</span>
            ) : (
              <Link href={c.href} className="hover:text-burgundy">{c.label}</Link>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </nav>
  );
}
