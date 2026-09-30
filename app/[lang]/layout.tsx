import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getDictionary, hasLocale, localePath, locales } from "@/lib/i18n";
import { site } from "@/lib/site";
import "../globals.css";

const bodoni = Bodoni_Moda({ subsets: ["latin"], variable: "--font-bodoni", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const generateStaticParams = () => locales.map((lang) => ({ lang }));

export const viewport: Viewport = { themeColor: "#070708" };

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    metadataBase: new URL(site.url),
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: localePath(lang, "/"),
      languages: { ...Object.fromEntries(locales.map((l) => [l, localePath(l, "/")])), "x-default": "/" },
    },
    openGraph: { siteName: site.name, type: "website", locale: lang },
  };
}

const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  name: site.name,
  url: site.url,
  email: site.email,
  telephone: site.phones,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    postalCode: site.address.postcode,
    addressLocality: site.address.city,
    addressCountry: "BE",
  },
};

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <html lang={lang} className={`${bodoni.variable} ${manrope.variable}`} suppressHydrationWarning>
      <body>
        {/* Marks the page as JS-capable before paint, so JS-only hiding (e.g. the homepage's Sell journey) never flashes. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <Header lang={lang} t={t.nav} sellLines={t.sell.categories.map((c) => c[1])} buyLine={t.paths.buy[1]} />
        <main>{children}</main>
        <Footer lang={lang} t={t} />
        <CookieBanner t={t.cookies} policyHref={localePath(lang, "/cookie-policy-sothis-diamonds/")} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }} />
      </body>
    </html>
  );
}
