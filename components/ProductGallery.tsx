"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { StoneVideo } from "./StoneVideo";

export type Slide = { kind: "video" | "image"; src: string; poster?: string };

/** Stone video first, then photos; thumbnails switch, clicking enlarges in a lightbox. */
export function ProductGallery({ slides, name, t }: { slides: Slide[]; name: string; t: { video: string; photo: string; zoom: string; close: string } }) {
  const [i, setI] = useState(0);
  const box = useRef<HTMLDialogElement>(null);
  const cur = slides[i];
  const label = (s: Slide, n: number) => (s.kind === "video" ? t.video : t.photo.replace("{n}", String(n + 1)));

  const view = (s: Slide, large = false) =>
    s.kind === "video" ? (
      <StoneVideo src={s.src} poster={s.poster && `/_next/image/?url=${encodeURIComponent(s.poster)}&w=1080&q=75`} className="size-full object-cover" />
    ) : (
      <Image src={s.src} alt={name} fill priority={!large} sizes={large ? "90vw" : "(min-width: 1024px) 50vw, 100vw"} className={large ? "object-contain" : "object-cover"} />
    );

  return (
    <div>
      <button type="button" onClick={() => box.current?.showModal()} aria-label={`${t.zoom}: ${label(cur, i)}`} className="relative block aspect-square w-full cursor-zoom-in overflow-hidden bg-ivory-deep ring-1 ring-line">
        {view(cur)}
      </button>

      {slides.length > 1 && (
        <ul className="mt-4 flex gap-3 overflow-x-auto">
          {slides.map((s, n) => (
            <li key={s.src}>
              <button
                type="button"
                aria-label={label(s, n)}
                aria-current={n === i ? "true" : undefined}
                onClick={() => setI(n)}
                className="relative block size-20 overflow-hidden bg-ivory-deep ring-1 ring-line aria-[current]:ring-2 aria-[current]:ring-burgundy"
              >
                <Image src={s.kind === "video" ? (s.poster ?? s.src) : s.src} alt="" fill sizes="80px" className="object-cover" />
                {s.kind === "video" && (
                  <span className="absolute inset-0 grid place-items-center bg-ink/25">
                    <svg viewBox="0 0 24 24" className="size-6 fill-on-accent" aria-hidden><path d="M8 5v14l11-7z" /></svg>
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog ref={box} aria-label={name} onClick={(e) => e.target === box.current && box.current.close()} className="m-auto size-[min(90vw,90vh)] max-h-none max-w-none bg-ivory p-0 backdrop:bg-ink/60">
        <div className="relative size-full">{view(cur, true)}</div>
        <button type="button" onClick={() => box.current?.close()} className="absolute right-3 top-3 bg-ivory/80 px-3 py-1.5 text-sm">{t.close}</button>
      </dialog>
    </div>
  );
}
