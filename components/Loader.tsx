"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/dictionaries/en";

// The homepage opening's stone: the loader reveals this exact image in the exact place the opening
// shows it, then dissolves the dark around it, so the loader stone becomes the homepage stone.
const STONE = "/media/2026/09/choir-studio/round-7.06ct-F-SI2-transparent-v2.png";
const STONE_SIZES = "(min-width: 1024px) 60vw, 100vw"; // same as the opening, so it's the same file

const REVEAL_MS = 2300; // the choreography; exits as soon as both this and the real loading are done
const MAX_MS = 8000; // never hold the page longer than this, even if an asset fails
const SEGMENTS = 6;

// Runs while the HTML is parsed. Marks the page as having a loader (the opening then skips its own
// stone reveal, so there's one opening, not two) and releases it after 9 s if the app's JS never runs.
const BOOT = `window.__sothisBoot=1;document.documentElement.dataset.loader="";setTimeout(function(){document.documentElement.dataset.loaded=""},9000)`;

// The loader plays once per full page load of the homepage. Its boot script only runs when it arrives
// in server HTML (a real page load), never on client-side navigation, so its flag tells the two apart.
let played = false;
const arrivedByNavigation = () => typeof window !== "undefined" && !(window as { __sothisBoot?: number }).__sothisBoot;

/** Loaded-ness of what the homepage's first screen needs, 0..1, from real events. */
function trackProgress(onChange: (p: number) => void) {
  const parts: [number, Promise<unknown>][] = [];
  const settled = (el: HTMLImageElement | null) =>
    !el || el.complete
      ? Promise.resolve()
      : new Promise((r) => {
          el.addEventListener("load", r, { once: true });
          el.addEventListener("error", r, { once: true }); // a failed image counts as done
        });
  parts.push([0.2, document.fonts?.ready ?? Promise.resolve()]);
  parts.push([0.1, settled(document.querySelector<HTMLImageElement>('header img[src*="logo"]'))]);
  parts.push([0.3, settled(document.querySelector<HTMLImageElement>(".opening-stone img"))]);
  parts.push([0.4, document.readyState === "complete" ? Promise.resolve() : new Promise((r) => window.addEventListener("load", r, { once: true }))]);
  let done = 0;
  parts.forEach(([w, p]) =>
    p.then(() => {
      done += w;
      onChange(done);
    }),
  );
}

/**
 * The homepage's opening frame: black, a burgundy glow, one brilliant revealed by a narrow light,
 * the logo, and six segments that fill with real loading progress. On exit the dark dissolves and
 * the stone stays put, handing over to the opening's own stone underneath.
 */
export function Loader({ t }: { t: Dictionary["loader"] }) {
  const [phase, setPhase] = useState<"loading" | "leaving" | "done">(() => (played || arrivedByNavigation() ? "done" : "loading"));
  const [filled, setFilled] = useState(0);
  const overlay = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (played || arrivedByNavigation()) {
      played = true;
      document.documentElement.dataset.loaded = ""; // no loader this time: let the opening play now
      return;
    }
    const html = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Put the loader's stone exactly over the opening's stone box.
    const place = () => {
      const target = document.querySelector<HTMLElement>(".opening-stone")?.parentElement;
      const r = target?.getBoundingClientRect();
      if (!r || !r.width || !stage.current) return;
      Object.assign(stage.current.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, translate: "none" });
    };
    place();
    window.addEventListener("resize", place);

    const blocked = [...document.querySelectorAll("header, footer, main > *")].filter((el) => !el.contains(overlay.current));
    blocked.forEach((el) => el.setAttribute("inert", ""));

    let real = 0;
    let last = -1;
    let raf = 0;
    let timer = 0;
    const start = performance.now();
    trackProgress((p) => (real = p));

    const leave = () => {
      played = true;
      blocked.forEach((el) => el.removeAttribute("inert"));
      html.dataset.loaded = ""; // the headline and the rest of the opening start now
      setPhase("leaving");
      timer = window.setTimeout(() => setPhase("done"), reduce ? 300 : 1100);
    };

    const frame = (now: number) => {
      const elapsed = now - start;
      if (elapsed > MAX_MS) real = 1;
      const n = Math.floor(Math.min(1, real) * SEGMENTS + 1e-6);
      if (n !== last) setFilled((last = n));
      if (real >= 1 && elapsed >= (reduce ? 400 : REVEAL_MS)) return leave();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      window.removeEventListener("resize", place);
      blocked.forEach((el) => el.removeAttribute("inert"));
    };
  }, []);

  if (phase === "done") return null;
  const leaving = phase === "leaving";

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      <noscript>
        <style>{".loader{display:none}.hero-title .reveal-line>span,.hero-after,.opening-title span span,.opening-line,.opening-scroll{animation-play-state:running!important}"}</style>
      </noscript>
      <div ref={overlay} role="status" aria-live="polite" data-leaving={leaving ? "" : undefined} className="loader fixed inset-0 z-[100] overflow-hidden">
        <span className="sr-only">{t.status.replace("{n}", String(Math.round((filled / SEGMENTS) * 100)))}</span>

        {/* The dark: obsidian with a burgundy glow gathering at the centre. Dissolves on exit. */}
        <div aria-hidden className="loader-dark absolute inset-0 bg-[#090709]">
          <span className="loader-glow absolute inset-0" />
        </div>

        {/* The stone, over the opening's stone (positioned in JS; centred until then). */}
        <div ref={stage} aria-hidden className="loader-stage absolute left-1/2 top-1/2 aspect-square w-[min(78vw,62vh,36rem)] -translate-x-1/2 -translate-y-1/2">
          <div className="loader-stone absolute inset-0">
            <Image src={STONE} alt="" fill priority sizes={STONE_SIZES} className="object-contain" />
          </div>
          {/* A narrow studio light crossing the stone, clipped to the brilliant (18%–82% of the image). */}
          <span className="loader-light absolute inset-[17.5%] overflow-hidden rounded-full">
            <span className="absolute inset-y-0 -left-full w-[60%]" />
          </span>
        </div>

        {/* Logo and progress, below the stone. */}
        <div aria-hidden className="loader-foot absolute inset-x-0 bottom-[9vh] flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- vector logo, white lettering */}
          <img src="/brand/logo.svg" alt="" width={170} height={45} className="loader-logo h-9 w-auto sm:h-11" />
          <div className="loader-segments mt-7 flex gap-2">
            {Array.from({ length: SEGMENTS }, (_, i) => (
              <span key={i} data-on={i < filled ? "" : undefined} className="h-px w-7 sm:w-9" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
