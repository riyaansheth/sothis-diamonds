import "server-only";

// Splits a migrated article into its h2 sections so templates can place the quick answer, the
// table of contents and the FAQ themselves instead of dumping one block of HTML.

export type Section = { id: string; title: string; html: string };
export type Article = { intro: string; hero?: string; quick?: Section; sections: Section[]; faq?: { title: string; items: [string, string][] } };

export const text = (html: string) =>
  html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/&amp;/g, "&").replace(/&#8217;|&rsquo;/g, "’").replace(/&nbsp;/g, " ").replace(/&#8220;|&#8221;/g, "\"").replace(/&#8211;/g, "–").replace(/&#8212;/g, "—").trim();
const slug = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);

/** FAQ pairs from <details><summary>, or from a question (h3/p ending in "?") followed by its answer blocks. */
function faqItems(html: string): [string, string][] {
  const details = [...html.matchAll(/<details>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)];
  if (details.length) return details.map((m) => [text(m[1]), wrap(m[2])]);

  const blocks = [...html.matchAll(/<(h3|h4|p|ul|ol|table)\b[^>]*>[\s\S]*?<\/\1>/g)].map((m) => ({ tag: m[1], html: m[0] }));
  const items: [string, string][] = [];
  for (const b of blocks) {
    const t = text(b.html);
    if ((b.tag === "h3" || b.tag === "h4" || b.tag === "p") && t.endsWith("?") && t.length < 200) items.push([t, ""]);
    else if (items.length) items[items.length - 1][1] += b.html;
  }
  return items.filter(([, a]) => a);
}
const wrap = (s: string) => (/^\s*</.test(s) ? s.trim() : `<p>${s.trim()}</p>`);

export function parseArticle(html: string): Article {
  const parts = html.split(/<h2>([\s\S]*?)<\/h2>/);
  let intro = parts[0];
  const hero = intro.match(/<img[^>]*src="([^"]+)"/)?.[1];
  intro = intro.replace(/<img[^>]*>/, "").trim();

  const seen = new Set<string>();
  const all: Section[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const title = text(parts[i]);
    let id = slug(title) || `section-${i}`;
    while (seen.has(id)) id += "-2";
    seen.add(id);
    all.push({ id, title, html: parts[i + 1].trim() });
  }

  const quick = all.find((s) => /^quick answer/i.test(s.title));
  const faqSection = all.find((s) => /frequently asked/i.test(s.title));
  const items = faqSection ? faqItems(faqSection.html) : [];
  const faq = faqSection && items.length >= 2 ? { title: faqSection.title, items } : undefined;
  const sections = all.filter((s) => s !== quick && !(faq && s === faqSection) && s.html);
  return { intro, hero, quick, sections, faq };
}

export const readingMinutes = (html: string) => Math.max(1, Math.round(text(html).split(/\s+/).length / 230));
