"use client";

import Link from "next/link";
import Script from "next/script";
import type { Dictionary } from "@/lib/dictionaries/en";
import { site } from "@/lib/site";
import { useStored } from "@/lib/useStored";

type Choice = "all" | "necessary" | null;

/** Cookie consent + the Tawk.to chat, which only loads after consent (it sets cookies). */
export function CookieBanner({ t, policyHref }: { t: Dictionary["cookies"]; policyHref: string }) {
  // "unknown" on the server so the banner doesn't flash before the saved choice is read.
  const [choice, decide] = useStored<Choice | "unknown">("sothis-cookies", null, "unknown");

  return (
    <>
      {choice === "all" && <Script src={`https://embed.tawk.to/${site.tawkId}`} strategy="lazyOnload" />}
      {choice === null && (
        <div role="region" aria-label={t.policy} className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-3xl flex-col gap-4 rounded-sm bg-ivory-deep p-5 text-sm ring-1 ring-line sm:flex-row sm:items-center">
          <p className="flex-1 text-platinum-2">
            {t.text}{" "}
            <Link href={policyHref} className="text-ink underline underline-offset-4">{t.policy}</Link>
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => decide("necessary")} className="btn btn-secondary min-h-10">{t.decline}</button>
            <button type="button" onClick={() => decide("all")} className="btn btn-primary min-h-10">{t.accept}</button>
          </div>
        </div>
      )}
    </>
  );
}
