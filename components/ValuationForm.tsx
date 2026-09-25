"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Dictionary } from "@/lib/dictionaries/en";
import { site } from "@/lib/site";

export type ItemType = "diamond" | "coloured" | "watch" | "antique" | "other";
type T = Dictionary["form"];
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

type Field = { name: string; kind: "text" | "number" | "select" | "textarea"; options?: string[]; required?: boolean };

/** The details asked for each kind of item. Watches never ask for a carat weight. */
function fieldsFor(type: ItemType, t: T): Field[] {
  const f = t.fields;
  const withUnknown = (o: string[]) => [...o, f.unknown];
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
export function ValuationForm({ t, lang, fixedType }: { t: T; lang: string; fixedType?: ItemType }) {
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
  const fields = useMemo(() => (type ? fieldsFor(type, t) : []), [type, t]);
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
    if (step === 1) return fields.filter((f) => f.required && !values[f.name]?.trim()).map((f) => t.fields[f.name as keyof T["fields"]]);
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
          <div className="grid gap-5 sm:grid-cols-2">
            {fields.map((f) => (
              <Labeled key={f.name} label={t.fields[f.name as keyof T["fields"]]} required={f.required} t={t}>
                {f.kind === "select" ? (
                  <select className="field" value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} required={f.required}>
                    <option value="">—</option>
                    {f.options!.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    className="field"
                    type={f.kind === "number" ? "text" : "text"}
                    inputMode={f.kind === "number" ? "decimal" : undefined}
                    value={values[f.name] ?? ""}
                    onChange={(e) => set(f.name, e.target.value)}
                    required={f.required}
                    maxLength={120}
                  />
                )}
              </Labeled>
            ))}
            <div className="sm:col-span-2">
              <Labeled label={t.fields.notes} t={t}>
                <textarea className="field min-h-28 py-3" value={values.notes ?? ""} onChange={(e) => set("notes", e.target.value)} maxLength={2000} />
              </Labeled>
            </div>
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
            {step < 3 ? t.next : status === "sending" ? t.sending : t.submit}
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
