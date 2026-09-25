"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Dictionary } from "@/lib/dictionaries/en";
import { site } from "@/lib/site";

export type ItemType = "diamond" | "coloured" | "watch" | "antique" | "other";
type T = Dictionary["form"];
type C = Dictionary["calculator"];
type Values = Record<string, string>;

const MAX_PHOTOS = 7;
const MAX_BYTES = 10 * 1024 * 1024;
const PHOTO_TYPES = /\.(jpe?g|png|heic|heif|webp)$/i;
const DRAFT = "sothis-valuation-draft";

const SHAPES = ["Round", "Oval", "Pear", "Cushion", "Princess", "Emerald", "Asscher", "Radiant", "Marquise", "Heart", "Other"];
const COLOURS = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N–Z", "Fancy colour"];
const CLARITY = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1", "I2", "I3"];
// Europe first (where the buying happens), then a few major markets.
const COUNTRIES = ["BE", "NL", "FR", "DE", "LU", "GB", "CH", "IT", "ES", "PT", "AT", "IE", "DK", "SE", "NO", "FI", "PL", "CZ", "GR", "MC", "US", "CA", "AE", "IN", "IL", "HK", "SG", "AU"];

type Field = { name: string; kind: "text" | "number" | "select" | "textarea" | "chips"; options?: string[]; required?: boolean; label?: string };

/** The details asked for each kind of item. Watches never ask for a carat weight. */
function fieldsFor(type: ItemType, t: T, c?: C): Field[] {
  const f = t.fields;
  const withUnknown = (o: string[]) => [...o, f.unknown];
  if (c) {
    // The calculator: a guided, visual version of the diamond questions.
    return [
      { name: "carat", kind: "number", required: true },
      { name: "origin", kind: "chips", options: withUnknown(c.origins), label: c.origin },
      { name: "shape", kind: "chips", options: SHAPES },
      { name: "colour", kind: "chips", options: withUnknown(COLOURS) },
      { name: "clarity", kind: "chips", options: withUnknown(CLARITY) },
      { name: "cut", kind: "select", options: withUnknown(c.cuts), label: c.cut },
      { name: "condition", kind: "select", options: c.conditions, label: c.condition },
      { name: "report", kind: "select", options: t.choices.report },
    ];
  }
  switch (type) {
    case "diamond":
      return [
        { name: "carat", kind: "number" },
        { name: "shape", kind: "select", options: withUnknown(SHAPES) },
        { name: "colour", kind: "select", options: withUnknown(COLOURS) },
        { name: "clarity", kind: "select", options: withUnknown(CLARITY) },
        { name: "report", kind: "select", options: t.choices.report },
      ];
    case "coloured":
      return [
        { name: "stone", kind: "text", required: true },
        { name: "carat", kind: "number" },
        { name: "origin", kind: "text" },
        { name: "report", kind: "select", options: t.choices.report },
      ];
    case "watch":
      return [
        { name: "brand", kind: "text", required: true },
        { name: "model", kind: "text" },
        { name: "reference", kind: "text" },
        { name: "year", kind: "number" },
        { name: "boxPapers", kind: "select", options: t.choices.boxPapers },
      ];
    case "antique":
      return [
        { name: "piece", kind: "select", options: t.choices.piece, required: true },
        { name: "era", kind: "text" },
        { name: "mainStones", kind: "text" },
        { name: "hallmarks", kind: "text" },
      ];
    case "other":
      return [
        { name: "piece", kind: "select", options: t.choices.piece, required: true },
        { name: "metal", kind: "select", options: t.choices.metal },
        { name: "mainStones", kind: "text" },
        { name: "brand", kind: "text" },
      ];
  }
}

/** Homepage quick-valuation items -> the form's item type (and the piece, for jewellery). */
function fromQuick(item: string | null): { type?: ItemType; piece?: string } {
  switch (item) {
    case "Diamond":
      return { type: "diamond" };
    case "Coloured diamond":
      return { type: "coloured" };
    case "Watch":
      return { type: "watch" };
    case "Ring":
    case "Necklace":
    case "Bracelet":
    case "Earrings":
      return { type: "other", piece: item };
    case "Other":
      return { type: "other" };
    default:
      return {};
  }
}

/**
 * Four-step valuation request: item, type-specific details, up to 7 photos, contact details.
 * Draft (not photos) is kept in sessionStorage; posts multipart to /api/valuation/.
 */
export function ValuationForm({ t, lang, fixedType, calculator: c }: { t: T; lang: string; fixedType?: ItemType; calculator?: C }) {
  const params = useSearchParams();
  const [step, setStep] = useState(fixedType ? 1 : 0);
  const [values, setValues] = useState<Values>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const [problems, setProblems] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [result, setResult] = useState<{ ref: string; delivered: boolean } | null>(null);
  const top = useRef<HTMLDivElement>(null);
  const files = useRef<HTMLInputElement>(null);

  const type = (fixedType ?? values.type) as ItemType | undefined;
  const fields = useMemo(() => (type ? fieldsFor(type, t, c) : []), [type, t, c]);
  const labelOf = (f: Field) => f.label ?? t.fields[f.name as keyof T["fields"]];
  const regionName = useMemo(() => {
    try {
      return new Intl.DisplayNames([lang], { type: "region" });
    } catch {
      return null;
    }
  }, [lang]);

  // Restore a draft, then apply the homepage quick-valuation answers on top.
  useEffect(() => {
    let draft: Values = {};
    try {
      draft = JSON.parse(sessionStorage.getItem(DRAFT) ?? "{}");
    } catch {}
    const quick = fromQuick(params.get("item"));
    const next: Values = { ...draft };
    if (quick.type && !fixedType) next.type = quick.type;
    if (quick.piece) next.piece = quick.piece;
    if (params.get("weight")) next.carat = params.get("weight")!;
    if (params.get("email")) next.email = params.get("email")!;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from browser storage
    setValues(next);
    if (quick.type && !fixedType) setStep(1);
  }, [params, fixedType]);

  const set = (name: string, value: string) => {
    const next = { ...values, [name]: value };
    setValues(next);
    try {
      sessionStorage.setItem(DRAFT, JSON.stringify(next));
    } catch {}
  };

  const goTo = (n: number) => {
    setProblems([]);
    setStep(n);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const validate = (): string[] => {
    if (step === 0 && !type) return [t.itemType];
    if (step === 1) return fields.filter((f) => f.required && !values[f.name]?.trim()).map(labelOf);
    if (step === 3) {
      const miss = (["name", "email", "phone"] as const).filter((k) => !values[k]?.trim()).map((k) => t[k]);
      if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) miss.push(t.invalidEmail);
      if (values.consent !== "yes") miss.push(t.consent);
      return miss;
    }
    return [];
  };

  const addPhotos = (list: FileList | null) => {
    if (!list) return;
    const errs: string[] = [];
    const ok = [...list].filter((f) => {
      if (!PHOTO_TYPES.test(f.name)) return errs.push(t.photoType.replace("{name}", f.name)), false;
      if (f.size > MAX_BYTES) return errs.push(t.photoTooBig.replace("{name}", f.name)), false;
      return true;
    });
    const merged = [...photos, ...ok];
    if (merged.length > MAX_PHOTOS) errs.push(t.tooMany);
    setPhotos(merged.slice(0, MAX_PHOTOS));
    setProblems(errs);
  };

  const submit = async () => {
    const miss = validate();
    if (miss.length) return setProblems(miss);
    setStatus("sending");
    const body = new FormData();
    body.set("type", type!);
    for (const f of fields) if (values[f.name]) body.set(f.name, values[f.name]);
    for (const k of ["notes", "name", "email", "phone", "country", "contactBy"]) if (values[k]) body.set(k, values[k]);
    body.set("lang", lang);
    if (c) body.set("calculator", "yes");
    photos.forEach((p) => body.append("photos", p));
    try {
      const res = await fetch("/api/valuation/", { method: "POST", body });
      if (!res.ok) throw new Error(String(res.status));
      setResult(await res.json());
      setStatus("done");
      try {
        sessionStorage.removeItem(DRAFT);
      } catch {}
    } catch {
      setStatus("error");
    }
  };

  if (status === "done" && result) {
    return (
      <div ref={top} role="status" className="bg-ivory-deep p-10 text-center">
        <p className="font-display text-3xl">{result.delivered ? t.sentTitle : t.previewTitle}</p>
        <p className="mx-auto mt-4 max-w-md text-platinum-2">
          {(result.delivered ? t.sentBody : t.previewBody).replace("{ref}", result.ref).replace("{email}", site.email)}
        </p>
      </div>
    );
  }

  const next = () => {
    const miss = validate();
    if (miss.length) return setProblems(miss);
    goTo(step + 1);
  };

  return (
    <div ref={top} className="scroll-mt-28">
      {/* Progress */}
      <ol className="grid grid-cols-4 gap-2 text-xs" aria-label={t.steps.join(", ")}>
        {t.steps.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined} className={i <= step ? "text-ink" : "text-platinum-2"}>
            <span className={`mb-2 block h-0.5 ${i <= step ? "bg-wine" : "bg-line"}`} />
            <span className="hidden sm:inline">{label}</span>
          </li>
        ))}
      </ol>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 3) next();
          else void submit();
        }}
        className="mt-8"
      >
        {step === 0 && (
          <fieldset>
            <legend className="font-display text-2xl">{t.itemType}</legend>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {(Object.keys(t.types) as ItemType[]).map((k) => (
                <label key={k} className="flex cursor-pointer items-center gap-3 border border-line p-4 has-[:checked]:border-wine has-[:checked]:bg-ivory-deep">
                  <input type="radio" name="type" value={k} checked={type === k} onChange={() => set("type", k)} className="accent-burgundy" />
                  {t.types[k]}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {step === 1 && type && (
          <div className={c ? "grid gap-10 xl:grid-cols-[1fr_15rem]" : ""}>
            <div className="grid gap-5 sm:grid-cols-2">
              {fields.map((f) =>
                f.kind === "chips" ? (
                  <fieldset key={f.name} className="sm:col-span-2">
                    <legend className="mb-2 text-sm text-platinum-2">{labelOf(f)}</legend>
                    {f.name === "colour" && c && (
                      <p className="mb-2 flex flex-wrap gap-x-4 text-xs text-platinum-2">
                        {c.colourGroups.map(([range, name]) => <span key={range}>{range}: {name}</span>)}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {f.options!.map((o, i) => (
                        <label key={o} title={f.name === "clarity" && c ? c.clarityHelp[o as keyof C["clarityHelp"]] : undefined} className="flex cursor-pointer items-center gap-2 border border-line px-3 py-2 text-sm has-[:checked]:border-wine has-[:checked]:bg-wine has-[:checked]:text-on-accent">
                          <input type="radio" name={f.name} value={o} checked={values[f.name] === o} onChange={() => set(f.name, o)} className="sr-only" />
                          {f.name === "colour" && i < 11 && (
                            // D (white) to N–Z (light yellow), as the grades read to the eye.
                            <span aria-hidden className="size-3 rounded-full ring-1 ring-line" style={{ background: `hsl(48 ${Math.round((i / 10) * 70)}% ${97 - i * 2}%)` }} />
                          )}
                          {o}
                        </label>
                      ))}
                    </div>
                    {f.name === "clarity" && c && values.clarity && c.clarityHelp[values.clarity as keyof C["clarityHelp"]] && (
                      <p className="mt-2 text-xs text-platinum-2">{values.clarity}: {c.clarityHelp[values.clarity as keyof C["clarityHelp"]]}</p>
                    )}
                  </fieldset>
                ) : (
                  <Labeled key={f.name} label={labelOf(f)} required={f.required} t={t}>
                    {f.kind === "select" ? (
                      <select className="field" value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} required={f.required}>
                        <option value="">—</option>
                        {f.options!.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        className="field"
                        type="text"
                        inputMode={f.kind === "number" ? "decimal" : undefined}
                        value={values[f.name] ?? ""}
                        onChange={(e) => set(f.name, e.target.value)}
                        required={f.required}
                        maxLength={120}
                      />
                    )}
                  </Labeled>
                ),
              )}
              <div className="sm:col-span-2">
                <Labeled label={t.fields.notes} t={t}>
                  <textarea className="field min-h-28 py-3" value={values.notes ?? ""} onChange={(e) => set("notes", e.target.value)} maxLength={2000} />
                </Labeled>
              </div>
            </div>

            {c && (
              <aside aria-live="polite" className="h-fit border border-line bg-ivory p-5 xl:sticky xl:top-28">
                <p className="font-display text-xl">{c.summary}</p>
                {fields.some((f) => values[f.name]) ? (
                  <dl className="mt-4 space-y-2 text-sm">
                    {fields.filter((f) => values[f.name]).map((f) => (
                      <div key={f.name} className="flex justify-between gap-4 border-b border-line pb-2">
                        <dt className="text-platinum-2">{labelOf(f)}</dt>
                        <dd className="text-right">{f.name === "carat" ? `${values[f.name]} ct` : values[f.name]}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-3 text-sm text-platinum-2">{c.summaryEmpty}</p>
                )}
              </aside>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-sm text-platinum-2">{t.photosHint}</p>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addPhotos(e.dataTransfer.files);
              }}
              className="mt-4 grid place-items-center border border-dashed border-line px-6 py-10 text-center"
            >
              <input ref={files} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" multiple className="sr-only" onChange={(e) => addPhotos(e.target.files)} />
              <button type="button" onClick={() => files.current?.click()} className="btn btn-secondary" disabled={photos.length >= MAX_PHOTOS}>
                {t.addPhotos} ({photos.length}/{MAX_PHOTOS})
              </button>
            </div>
            {photos.length > 0 && (
              <ul className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-7">
                {photos.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="relative aspect-square overflow-hidden bg-ivory-deep">
                    <Thumb file={f} />
                    <button type="button" aria-label={`${t.removePhoto}: ${f.name}`} onClick={() => setPhotos(photos.filter((_, n) => n !== i))} className="absolute right-1 top-1 grid size-6 place-items-center bg-ivory/90 text-xs">✕</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Labeled label={t.name} required t={t}><input className="field" autoComplete="name" value={values.name ?? ""} onChange={(e) => set("name", e.target.value)} maxLength={120} /></Labeled>
            <Labeled label={t.email} required t={t}><input className="field" type="email" autoComplete="email" value={values.email ?? ""} onChange={(e) => set("email", e.target.value)} maxLength={160} /></Labeled>
            <Labeled label={t.phone} required t={t}><input className="field" type="tel" autoComplete="tel" value={values.phone ?? ""} onChange={(e) => set("phone", e.target.value)} maxLength={40} /></Labeled>
            <Labeled label={t.country} t={t}>
              <select className="field" autoComplete="country" value={values.country ?? ""} onChange={(e) => set("country", e.target.value)}>
                <option value="">—</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{regionName?.of(c) ?? c}</option>)}
              </select>
            </Labeled>
            <fieldset className="sm:col-span-2">
              <legend className="mb-2 text-sm text-platinum-2">{t.contactBy}</legend>
              <div className="flex flex-wrap gap-2">
                {t.contactOptions.map((o) => (
                  <label key={o} className="flex cursor-pointer items-center gap-2 border border-line px-4 py-2 text-sm has-[:checked]:border-wine">
                    <input type="radio" name="contactBy" value={o} checked={values.contactBy === o} onChange={() => set("contactBy", o)} className="accent-burgundy" />
                    {o}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="flex items-start gap-3 text-sm text-platinum-2 sm:col-span-2">
              <input type="checkbox" checked={values.consent === "yes"} onChange={(e) => set("consent", e.target.checked ? "yes" : "")} className="mt-1 size-4 accent-burgundy" />
              {t.consent}
            </label>
          </div>
        )}

        {problems.length > 0 && (
          <ul role="alert" className="mt-6 space-y-1 border-l-2 border-burgundy pl-4 text-sm text-burgundy">
            {problems.map((p) => <li key={p}>{p}</li>)}
          </ul>
        )}
        {status === "error" && <p role="alert" className="mt-6 text-sm text-burgundy">{t.error.replace("{email}", site.email)}</p>}

        <div className="mt-8 flex items-center gap-3">
          {step > (fixedType ? 1 : 0) && (
            <button type="button" onClick={() => goTo(step - 1)} className="btn btn-secondary">{t.back}</button>
          )}
          <button type="submit" className="btn btn-primary" disabled={status === "sending"}>
            {step < 3 ? t.next : status === "sending" ? t.sending : (c?.submit ?? t.submit)}
          </button>
        </div>
      </form>
    </div>
  );
}

function Labeled({ label, required, t, children }: { label: string; required?: boolean; t: T; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-platinum-2">
        {label}
        {!required && <span className="text-platinum-2/70"> ({t.optional})</span>}
      </span>
      {children}
    </label>
  );
}

/** Local preview of a chosen photo (object URL, revoked on unmount). */
function Thumb({ file }: { file: File }) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    const u = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- object URL lifecycle is tied to this effect
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  // eslint-disable-next-line @next/next/no-img-element -- local blob preview
  return url ? <img src={url} alt="" className="size-full object-cover" /> : null;
}
