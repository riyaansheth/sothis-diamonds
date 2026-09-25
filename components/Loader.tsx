"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/dictionaries/en";

const MIN_MS = 1200;
const MAX_MS = 8000;
const TURN_S = 2.4; // one full turn

// Runs while the HTML is parsed: releases the page after 9 s on its own, in case the app's JavaScript
// is slow or blocked. The loader itself plays on every full page load.
const BOOT = `setTimeout(function(){document.documentElement.dataset.loaded=""},9000)`;

// Set once the loader has played in this page lifetime, so moving between pages without reloading
// doesn't replay it. A reload resets it.
let played = false;

// The mark's sparkle sits in the top-right corner of mark.svg; the diamond is everything else.
const DIAMOND_CLIP = "polygon(0 0, 79% 0, 79% 44%, 100% 44%, 100% 100%, 0 100%)";
const SPARKLE_CLIP = "inset(0 0 56% 79%)";

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Loaded-ness of what the homepage needs to look right, 0..1, from real events. */
function trackProgress(onChange: (p: number) => void) {
  const parts: [number, Promise<unknown>][] = [];
  const settled = (el: HTMLImageElement | null) =>
    !el || el.complete
      ? Promise.resolve()
      : new Promise((r) => {
          el.addEventListener("load", r, { once: true });
          el.addEventListener("error", r, { once: true }); // a failed image counts as done
        });

  parts.push([0.15, document.fonts?.ready ?? Promise.resolve()]);
  document.querySelectorAll<HTMLImageElement>(".choir-stone img").forEach((img) => parts.push([0.15, settled(img)]));
  parts.push([0.05, settled(document.querySelector<HTMLImageElement>('header img[src*="logo"]'))]);
  parts.push([0.2, document.readyState === "complete" ? Promise.resolve() : new Promise((r) => window.addEventListener("load", r, { once: true }))]);
  // The 3D stones in the first screen: each counts once it has drawn its first frame.
  const stones = document.querySelectorAll(".paths-window").length;
  let ready = 0;
  const allStones = new Promise<void>((r) => {
    if (!stones) return r();
    window.addEventListener("sothis:stone-ready", function on() {
      if (++ready >= stones) {
        window.removeEventListener("sothis:stone-ready", on);
        r();
      }
    });
  });
  parts.push([0.25, allStones]);

  const total = parts.reduce((s, [w]) => s + w, 0);
  let done = 0;
  parts.forEach(([w, p]) =>
    p.then(() => {
      done += w;
      onChange(done / total);
    }),
  );
}

/**
 * First-visit loading screen for the homepage: the Sothis mark turning like a stone on a turntable,
 * a real loading percentage, then the mark flies into the header logo and the page's entrance plays.
 */
export function Loader({ t }: { t: Dictionary["loader"] }) {
  const [phase, setPhase] = useState<"loading" | "leaving" | "done">(() => (played ? "done" : "loading"));
  const [announced, setAnnounced] = useState(0);
  const overlay = useRef<HTMLDivElement>(null);
  const flyer = useRef<HTMLDivElement>(null);
  const spinner = useRef<HTMLDivElement>(null);
  const sheen = useRef<HTMLDivElement>(null);
  const number = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (played) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Everything except the loader is inert while it shows.
    const blocked = [...document.querySelectorAll("header, footer, main > *")].filter((el) => !el.contains(overlay.current));
    blocked.forEach((el) => el.setAttribute("inert", ""));

    let real = 0;
    let shown = 0;
    let angle = 0;
    let stopAt: number | null = null; // angle to settle on, once loading is finished
    let finishedAt = 0;
    let raf = 0;
    let lastStep = 0;
    const start = performance.now();
    trackProgress((p) => (real = p));

    const finish = () => {
      played = true;
      blocked.forEach((el) => el.removeAttribute("inert"));

      const end = () => {
        html.dataset.loaded = "";
        setPhase("done");
      };
      if (reduce) {
        overlay.current!.style.transition = "opacity 300ms";
        overlay.current!.style.opacity = "0";
        setTimeout(end, 300);
        return;
      }
      // Fly the mark into the header logo's mark (the left 38.6% of the logo artwork).
      const logo = [...document.querySelectorAll("header img[src*='logo']")].map((el) => el.getBoundingClientRect()).find((r) => r.width > 0);
      const from = flyer.current!.getBoundingClientRect();
      if (logo && logo.width) {
        const tw = logo.width * 0.386;
        const scale = tw / from.width;
        const dx = logo.left + tw / 2 - (from.left + from.width / 2);
        const dy = logo.top + logo.height * 0.48 - (from.top + from.height / 2);
        flyer.current!.style.transition = "transform 700ms cubic-bezier(0.2, 0.7, 0.2, 1)";
        flyer.current!.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
      }
      setPhase("leaving");
      html.dataset.loaded = ""; // let the hero entrance start as the paper lifts
      setTimeout(end, 800);
    };

    const frame = (now: number) => {
      const elapsed = now - start;
      if (elapsed > MAX_MS) real = 1; // never get stuck on a slow or failed asset
      shown += (real * 100 - shown) * 0.08;
      if (real === 1 && 100 - shown < 0.5) shown = 100;
      const pct = elapsed < MIN_MS ? Math.min(shown, (elapsed / MIN_MS) * 100) : shown;

      number.current!.textContent = String(Math.floor(pct));
      bar.current!.style.transform = `scaleX(${pct / 100})`;
      const step = Math.floor(pct / 25) * 25;
      if (step !== lastStep) {
        lastStep = step;
        setAnnounced(step);
      }

      if (!reduce) {
        // Half-turns with an ease, so the stone lingers face-on and face-down.
        const u = (elapsed / 1000) / (TURN_S / 2);
        const target = 180 * Math.floor(u) + 180 * easeInOut(u % 1);
        angle = stopAt === null ? target : angle + (stopAt - angle) * 0.18;
        spinner.current!.style.transform = `rotateY(${angle}deg)`;
        // Light catches the facets as it turns face-on.
        const sweep = ((angle % 180) + 180) % 180 / 180;
        sheen.current!.style.backgroundPositionX = `${120 - sweep * 240}%`;
      }

      if (pct >= 100 && elapsed >= MIN_MS) {
        if (stopAt === null) {
          stopAt = reduce ? 0 : Math.ceil(angle / 360) * 360;
          finishedAt = now;
        }
        const settled = reduce || Math.abs(stopAt - angle) < 0.5;
        if (settled && now - finishedAt > 250) {
          if (!reduce) spinner.current!.style.transform = "rotateY(0deg)";
          finish();
          return;
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      blocked.forEach((el) => el.removeAttribute("inert"));
    };
  }, []);

  if (phase === "done") return null;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      <noscript>
        <style>{".loader{display:none}.choir-rise,.choir-intro,.hero-title .reveal-line>span,.hero-after{animation-play-state:running!important}"}</style>
      </noscript>
      <div
        ref={overlay}
        role="status"
        aria-live="polite"
        className={`loader fixed inset-0 z-[100] grid place-items-center transition-[background-color] duration-700 ${phase === "leaving" ? "bg-transparent" : "bg-ivory"}`}
      >
        <span className="sr-only">{t.status.replace("{n}", String(announced))}</span>
        <div aria-hidden className="flex flex-col items-center">
          <div ref={flyer} className="w-[88px] sm:w-[120px]" style={{ aspectRatio: "49.5 / 32.3" }}>
            <div className="relative size-full [perspective:600px]">
              <div ref={spinner} className="absolute inset-0 [transform-style:preserve-3d]">
                <MarkFace clip={DIAMOND_CLIP} />
                <MarkFace clip={DIAMOND_CLIP} back />
                <div
                  ref={sheen}
                  className="absolute inset-0 [backface-visibility:hidden]"
                  style={{
                    clipPath: DIAMOND_CLIP,
                    maskImage: "url(/brand/mark.svg)",
                    maskSize: "100% 100%",
                    backgroundImage: "linear-gradient(105deg, transparent 40%, rgb(255 250 235 / 0.65) 50%, transparent 60%)",
                    backgroundSize: "250% 100%",
                    mixBlendMode: "screen",
                  }}
                />
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/mark.svg" alt="" className="loader-sparkle absolute inset-0 size-full" style={{ clipPath: SPARKLE_CLIP }} />
            </div>
          </div>
          <div className={`mt-10 flex flex-col items-center transition-opacity duration-300 ${phase === "leaving" ? "opacity-0" : ""}`}>
            <span className="font-display text-[2rem] leading-none tabular-nums">
              <span ref={number}>0</span>%
            </span>
            <div className="mt-4 h-px w-40 bg-line">
              <div ref={bar} className="h-full origin-left scale-x-0 bg-champagne" />
            </div>
            <p className="mt-4 text-xs text-platinum-2">{t.place}</p>
          </div>
        </div>
      </div>
    </>
  );
}

function MarkFace({ clip, back }: { clip: string; back?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- raster-in-SVG mark from the original logo
    <img
      src="/brand/mark.svg"
      alt=""
      className="absolute inset-0 size-full [backface-visibility:hidden]"
      style={{
        clipPath: clip,
        // The reverse of the piece: darker, flatter gold rather than a mirrored copy.
        transform: back ? "rotateY(180deg) scaleX(-1)" : undefined,
        filter: back ? "brightness(0.72) saturate(0.8) contrast(0.9)" : undefined,
      }}
    />
  );
}
