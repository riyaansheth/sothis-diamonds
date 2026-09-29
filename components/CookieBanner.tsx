"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/dictionaries/en";
import { site } from "@/lib/site";
import { useStored } from "@/lib/useStored";

type Choice = "all" | "necessary" | null;

const CHAT_DELAY_MS = 4000;

/** True 4 s after the page is released: after the loading screen on the homepage, after load elsewhere. */
function useChatReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const html = document.documentElement;
    let timer = 0;
    const released = () => html.hasAttribute("data-loaded") || (!document.querySelector(".loader") && document.readyState === "complete");
    const arm = () => {
      if (timer || !released()) return;
      timer = window.setTimeout(() => setReady(true), CHAT_DELAY_MS);
    };
    const mo = new MutationObserver(arm);
    mo.observe(html, { attributes: true, attributeFilter: ["data-loaded"] });
    window.addEventListener("load", arm);
    arm();
    return () => {
      mo.disconnect();
      window.removeEventListener("load", arm);
      clearTimeout(timer);
    };
  }, []);
  return ready;
}

/** Cookie consent + the Tawk.to chat, which only loads after consent (it sets cookies), 4 s after the page is released. */
export function CookieBanner({ t, policyHref }: { t: Dictionary["cookies"]; policyHref: string }) {
  // "unknown" on the server so the banner doesn't flash before the saved choice is read.
  const [choice, decide] = useStored<Choice | "unknown">("sothis-cookies", null, "unknown");
  const chatReady = useChatReady();

  return (
    <>
      {choice === "all" && chatReady && <Script src={`https://embed.tawk.to/${site.tawkId}`} strategy="afterInteractive" />}
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
