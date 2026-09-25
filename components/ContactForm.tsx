"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Dictionary } from "@/lib/dictionaries/en";
import { site } from "@/lib/site";

/** Contact form; "Enquire about this stone" links here with ?stone=SKU, which prefills the message. */
export function ContactForm({ t, f }: { t: Dictionary["contact"]; f: Dictionary["form"] }) {
  const stone = useSearchParams().get("stone")?.slice(0, 40);
  const [status, setStatus] = useState<"idle" | "sending" | "preview" | "error">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact/", { method: "POST", body: new FormData(e.currentTarget) });
      setStatus(res.ok && (await res.json()).delivered === false ? "preview" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "preview")
    return (
      <div role="status" className="border-l-2 border-burgundy pl-5">
        <p className="font-display text-2xl">{t.previewTitle}</p>
        <p className="mt-2 text-platinum-2">{t.previewBody.replace("{email}", site.email)}</p>
      </div>
    );

  const field = (label: string, name: string, type: string, auto: string) => (
    <label className="block">
      <span className="mb-1.5 block text-sm text-platinum-2">{label}</span>
      <input className="field" name={name} type={type} autoComplete={auto} required maxLength={200} />
    </label>
  );
  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">{field(f.name, "name", "text", "name")}</div>
      {field(f.email, "email", "email", "email")}
      {field(f.phone, "phone", "tel", "tel")}
      <fieldset className="sm:col-span-2">
        <legend className="mb-2 text-sm text-platinum-2">{f.contactBy}</legend>
        <div className="flex flex-wrap gap-2">
          {f.contactOptions.map((o, i) => (
            <label key={o} className="flex cursor-pointer items-center border border-line px-4 py-2 text-sm has-[:checked]:border-wine has-[:checked]:bg-wine has-[:checked]:text-on-accent">
              <input type="radio" name="contactBy" value={o} defaultChecked={i === 0} className="sr-only" />
              {o}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block sm:col-span-2">
        <span className="mb-1.5 block text-sm text-platinum-2">{t.message}</span>
        <textarea className="field min-h-40 py-3" name="message" required maxLength={4000} defaultValue={stone ? t.aboutStone.replace("{sku}", stone) : ""} />
      </label>
      <div className="flex flex-wrap items-center gap-5 sm:col-span-2">
        <button type="submit" disabled={status === "sending"} className="btn btn-primary">{status === "sending" ? f.sending : t.submit}</button>
        {status === "error" && <p role="alert" className="text-sm text-burgundy">{f.error.replace("{email}", site.email)}</p>}
      </div>
    </form>
  );
}
