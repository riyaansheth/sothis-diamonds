"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Dictionary } from "@/lib/dictionaries/en";

/** Step 1 of the valuation flow: hands its answers to the full valuation page as query params. */
export function QuickValuation({ t, action }: { t: Dictionary["quick"]; action: string }) {
  const router = useRouter();
  return (
    <form
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr_auto] lg:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        router.push(`${action}?${new URLSearchParams(data as unknown as Record<string, string>)}`);
      }}
    >
      <label className="grid gap-2 text-sm text-platinum-2">
        {t.item}
        <select name="item" className="field" defaultValue={t.items[0]}>
          {t.items.map((i) => <option key={i}>{i}</option>)}
        </select>
      </label>
      <label className="grid gap-2 text-sm text-platinum-2">
        {t.weight}
        <input name="weight" inputMode="decimal" placeholder={t.weightHint} className="field" />
      </label>
      <label className="grid gap-2 text-sm text-platinum-2">
        {t.email}
        <input name="email" type="email" required autoComplete="email" className="field" />
      </label>
      <button type="submit" className="btn btn-primary">{t.submit}</button>
    </form>
  );
}

// ponytail: no mailing-list provider chosen yet; the form validates and says so instead of pretending to subscribe.
export function Newsletter({ t }: { t: Dictionary["newsletter"] }) {
  const [message, setMessage] = useState("");
  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setMessage(t.notLive);
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="newsletter-email">{t.email}</label>
        <input id="newsletter-email" name="email" type="email" required autoComplete="email" placeholder={t.email} className="field sm:flex-1" />
        <button type="submit" className="btn btn-primary">{t.submit}</button>
      </div>
      <label className="flex items-start gap-3 text-sm text-platinum-2">
        <input type="checkbox" name="consent" required className="mt-1 size-4 accent-burgundy" />
        {t.consent}
      </label>
      <p role="status" className="text-sm text-burgundy">{message}</p>
    </form>
  );
}
