import pagePaths from "@/export/data/page_paths.json";
import { en, type Dictionary } from "./dictionaries/en";

export const locales = ["en", "fr", "nl", "de", "it", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const languageNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  nl: "Nederlands",
  de: "Deutsch",
  it: "Italiano",
  es: "Español",
};

export const hasLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

// ponytail: only English copy exists for the new design; other languages fall back to it until translated.
const dictionaries: Record<Locale, Dictionary> = { en, fr: en, nl: en, de: en, it: en, es: en };
export const getDictionary = (locale: Locale) => dictionaries[locale];

const translated = pagePaths as Record<string, Partial<Record<Locale, string>>>;

/**
 * Localised URL for an English site path: English has no prefix; other languages use the old site's
 * translated slug when there is one (/sell-diamond/ -> /fr/vendre-du-diamant/), else just the prefix.
 */
export const localePath = (locale: Locale, path: string) => {
  if (locale === defaultLocale) return path;
  if (path === "/") return `/${locale}/`;
  return translated[path]?.[locale] ?? `/${locale}${path}`;
};
