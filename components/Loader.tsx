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

// Runs while the HTML is parsed. Marks the page as having a loader (the opening then skips its own
// stone reveal, so there's one opening, not two) and releases it after 9 s if the app's JS never runs.
// Also starts the page at the top (no restored scroll position), since scrolling is locked until release.
const BOOT = `window.__sothisBoot=1;history.scrollRestoration="manual";scrollTo(0,0);document.documentElement.dataset.loader="";setTimeout(function(){document.documentElement.dataset.loaded=""},9000)`;

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
  // Only what the first screen shows: waiting for window "load" would also wait for every image
  // further down the page, holding visitors (and crawlers' renders) on the loader for seconds.
  parts.push([0.3, document.fonts?.ready ?? Promise.resolve()]);
  parts.push([0.2, settled(document.querySelector<HTMLImageElement>('header img[src*="logo"]'))]);
  parts.push([0.5, settled(document.querySelector<HTMLImageElement>(".opening-backdrop img"))]);
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
 * the logo, and a loading bar that fills with real loading progress. On exit the dark dissolves
 * while the stone glides onto the stone in the opening photograph, then gives way to it.
 */
export function Loader({ t }: { t: Dictionary["loader"] }) {
  const [phase, setPhase] = useState<"loading" | "leaving" | "done">(() => (played || arrivedByNavigation() ? "done" : "loading"));
  const [announced, setAnnounced] = useState(0); // for screen readers, in quarters
  const fill = useRef<HTMLSpanElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const spinner = useRef<HTMLDivElement>(null);
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

    const blocked = [...document.querySelectorAll("header, footer, main > *")].filter((el) => !el.contains(overlay.current));
    blocked.forEach((el) => el.setAttribute("inert", ""));

    let real = 0;
    let shown = 0;
    let angle = 0; // the stone turns until loading reaches 100%, then settles upright to match the opening
    let settleFrom = -1;
    let lastT = performance.now();
    let last = -1;
    let raf = 0;
    let timer = 0;
    const start = performance.now();
    trackProgress((p) => (real = p));

    const leave = () => {
      played = true;
      blocked.forEach((el) => el.removeAttribute("inert"));
      // Where the photographed stone is: the loader's brilliant fills about 65% of its image.
      const to = document.querySelector("[data-opening-stone]")?.getBoundingClientRect();
      const from = stage.current?.getBoundingClientRect();
      if (to?.width && from?.width && !reduce) {
        stage.current!.style.setProperty("--to-x", `${(to.left + to.width / 2 - (from.left + from.width / 2)).toFixed(1)}px`);
        stage.current!.style.setProperty("--to-y", `${(to.top + to.height / 2 - (from.top + from.height / 2)).toFixed(1)}px`);
        stage.current!.style.setProperty("--to-s", (to.width / (from.width * 0.65)).toFixed(4));
      }
      html.dataset.loaded = ""; // the headline and the rest of the opening start now
      setPhase("leaving");
      timer = window.setTimeout(() => setPhase("done"), reduce ? 300 : 1400);
    };

    const frame = (now: number) => {
      const elapsed = now - start;
      if (elapsed > MAX_MS) real = 1;
      // The bar follows real progress, paced so it never outruns the reveal, and eases between values.
      const target = Math.min(real, reduce ? 1 : elapsed / REVEAL_MS);
      shown += (target - shown) * (reduce ? 1 : 0.12);
      if (target - shown < 0.002) shown = target;
      fill.current?.style.setProperty("transform", `scaleX(${shown.toFixed(4)})`);
      if (pct.current) pct.current.textContent = `${Math.round(shown * 100)}%`;
      const quarter = Math.floor(shown * 4) * 25;
      if (quarter !== last) setAnnounced((last = quarter));
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      if (!reduce) {
        if (shown < 0.999) {
          angle += dt * 90; // a quarter turn a second while loading
        } else {
          if (settleFrom < 0) settleFrom = Math.ceil(angle / 360) * 360; // finish the current turn
          angle += (settleFrom - angle) * 0.14;
          if (settleFrom - angle < 0.5) angle = settleFrom;
        }
        spinner.current?.style.setProperty("transform", `rotate(${angle.toFixed(2)}deg)`);
      }
      const settled = reduce || (settleFrom >= 0 && angle === settleFrom);
      if (real >= 1 && shown >= 0.999 && settled) return leave();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
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
        <span className="sr-only">{t.status.replace("{n}", String(announced))}</span>

        {/* The dark: obsidian with a burgundy glow gathering at the centre. Dissolves on exit. */}
        <div aria-hidden className="loader-dark absolute inset-0 bg-[#090709]">
          <span className="loader-glow absolute inset-0" />
        </div>

        {/* The stone, centred at its own size. */}
        <div ref={stage} aria-hidden className="loader-stage absolute left-1/2 top-1/2 aspect-square w-[min(78vw,62vh,36rem)] -translate-x-1/2 -translate-y-1/2">
          <div className="loader-stone absolute inset-0">
            <div ref={spinner} className="absolute inset-0 will-change-transform">
              <Image src={STONE} alt="" fill priority sizes={STONE_SIZES} className="object-contain" />
            </div>
          </div>
          {/* A narrow studio light crossing the stone, clipped to the brilliant (18%–82% of the image). */}
          <span className="loader-light absolute inset-[17.5%] overflow-hidden rounded-full">
            <span className="absolute inset-y-0 -left-full w-[60%]" />
          </span>
        </div>

        {/* Logo and progress, below the stone. */}
        <div aria-hidden className="loader-foot absolute inset-x-0 bottom-[9vh] flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- pre-rendered logo, white lettering */}
          <img src="/brand/logo.webp" alt="" width={170} height={45} className="loader-logo h-9 w-auto sm:h-11" />
          {/* The loading bar: a hairline track, a white fill with a soft leading glow, and the percentage. */}
          <div className="loader-segments mt-8 flex w-56 items-center gap-4 sm:w-72">
            <span className="loader-track relative h-[2px] flex-1 overflow-hidden rounded-full">
              <span ref={fill} className="loader-fill absolute inset-0 origin-left rounded-full" style={{ transform: "scaleX(0)" }} />
            </span>
            <span ref={pct} className="w-10 text-right text-xs tabular-nums text-[#f4f0ec]/70">0%</span>
          </div>
        </div>
      </div>
    </>
  );
}
