import { permanentRedirect } from "next/navigation";
import { hasLocale, localePath } from "@/lib/i18n";

// The old Sell page, now the diamond journey; links and rankings carry over.
export default async function Moved({ params }: PageProps<"/[lang]/pre-owned">) {
  const { lang } = await params;
  permanentRedirect(localePath(hasLocale(lang) ? lang : "en", "/diamonds/sell/"));
}
