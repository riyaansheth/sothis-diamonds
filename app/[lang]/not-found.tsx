import Link from "next/link";
import { getDictionary } from "@/lib/i18n";

// Rendered inside the [lang] layout, so header and footer stay. Language-neutral links (English) since
// Next doesn't pass params to not-found; the header still offers every language.
export default function NotFound() {
  const t = getDictionary("en").notFound;
  return (
    <section className="wrap flex min-h-[80vh] flex-col items-center justify-center pt-24 text-center">
      <p className="font-display text-7xl text-champagne" aria-hidden>404</p>
      <h1 className="mt-4 text-4xl sm:text-5xl">{t.title}</h1>
      <p className="mt-4 max-w-md text-platinum-2">{t.body}</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/sell-diamond/" className="btn btn-primary">{t.sell}</Link>
        <Link href="/shop/" className="btn btn-secondary">{t.shop}</Link>
      </div>
      <Link href="/" className="mt-6 text-sm text-burgundy underline underline-offset-4">{t.home}</Link>
    </section>
  );
}
