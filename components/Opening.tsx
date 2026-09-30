"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { clamp01, seg, setVars } from "./about/useScrub";

const DIVE_MS = 1800;
const BACK_MS = 1400;
const REDUCED_MS = 300;

/**
 * The homepage opening, as a scene rather than a scrolled section. It covers the screen (html.js only;
 * without JS it's a normal first section) and holds the page still. The first downward gesture (wheel,
 * swipe, keys, or the scroll cue) plays the whole transition on its own clock: the camera dives into
 * the stone and its light dissolves into the Buy | Sell choice, which is already in place underneath,
 * so nothing slides. Scrolling up at the very top of the page plays it back in reverse.
 */
export function Opening({ cutout, title, line, scroll }: { cutout: string; title: string; line: string; scroll: string }) {
  const root = useRef<HTMLElement>(null);
  const cue = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = root.current!;
    const html = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    const maxZoom = narrow ? 2 : 3.5; // 3x on phones, 4.5x on larger screens
    let state: "shown" | "playing" | "gone" = "shown";
    let raf = 0;
    let quietUntil = 0; // swallow the tail of a gesture (trackpad momentum) after a transition

    // t: 0 = the opening at rest, 1 = fully dissolved into the choice. The stone is the window: a hole
    // the size of the stone opens in the backdrop, the facets dissolve, and the choice is seen through
    // it as the camera keeps moving in until it fills the screen.
    const stoneEl = el.querySelector<HTMLElement>("[data-opening-stone]")!;
    const paint = (t: number) => {
      const zoom = reduce ? 1 : 1 + Math.pow(clamp01(t / 0.85), 1.6) * maxZoom;
      const radius = (stoneEl.offsetWidth / 2) * 0.64; // the brilliant fills about 64% of its image
      const open = reduce ? t : clamp01((t - 0.3) / 0.7);
      const hole = open > 0 ? radius * zoom * (0.9 + open * 2.2) : -60; // negative: no hole at all
      setVars(el, {
        "--zoom": zoom,
        "--turn": reduce ? 0 : seg(t, 0, 0.75) * 28,
        "--copy": 1 - seg(t, 0, 0.15),
        "--light": reduce ? 0 : seg(t, 0.2, 0.5),
        "--gem": 1 - clamp01((t - 0.3) / 0.45), // the facets dissolve, leaving the view through the stone
        "--hole": `${hole.toFixed(1)}px`,
        "--fade": clamp01((t - 0.95) / 0.05),
      });
      // The 3D stones underneath stay paused while nothing of them can be seen.
      html.toggleAttribute("data-covered", open < 0.01);
    };

    const lock = (on: boolean) => html.toggleAttribute("data-opening", on);
    paint(0);
    lock(true);

    const play = (dir: 1 | -1) => {
      if (state === "playing") return;
      const from = dir === 1 ? 0 : 1;
      const ms = reduce ? REDUCED_MS : dir === 1 ? DIVE_MS : BACK_MS;
      state = "playing";
      lock(true);
      el.dataset.state = "playing";
      if (dir === -1) window.scrollTo(0, 0);
      const start = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - start) / ms);
        const eased = k * k * (3 - 2 * k); // gentle ease, so every stage of the dive is seen
        paint(from + dir * eased);
        if (k < 1) {
          raf = requestAnimationFrame(step);
          return;
        }
        quietUntil = performance.now() + 350;
        if (dir === 1) {
          window.scrollTo(0, 0);
          state = "gone";
          el.dataset.state = "gone";
          lock(false);
        } else {
          state = "shown";
          el.dataset.state = "shown";
        }
      };
      raf = requestAnimationFrame(step);
    };

    // Only once the loading screen has released the page.
    const ready = () => html.hasAttribute("data-loaded");

    // A deliberate gesture, not a twitch: wheel movement adds up (and fades away if it pauses), and the
    // transition starts once it passes a threshold. Going back only counts movement made while the page
    // is already resting at the top, so scrolling up through the page just stops there first.
    let intent = 0;
    let intentAt = 0;
    let topSince = window.scrollY <= 1 ? performance.now() : Infinity;
    const FORWARD = 40;
    const BACK = 120;
    const addIntent = (dy: number) => {
      const now = performance.now();
      if (now - intentAt > 350 || Math.sign(dy) !== Math.sign(intent)) intent = 0;
      intentAt = now;
      intent += dy;
    };

    // A new gesture starts after a short pause in wheel input (trackpad momentum has no pauses).
    let lastWheel = 0;
    let gestureStart = 0;
    const onWheel = (e: WheelEvent) => {
      const t = performance.now();
      if (t - lastWheel > 220) gestureStart = t;
      lastWheel = t;
      if (state === "playing" || performance.now() < quietUntil) {
        e.preventDefault();
        return;
      }
      if (!ready()) return;
      if (state === "shown") {
        e.preventDefault();
        if (e.deltaY > 0) {
          addIntent(e.deltaY);
          if (intent >= FORWARD) {
            intent = 0;
            play(1);
          }
        }
      } else if (state === "gone" && e.deltaY < 0 && window.scrollY <= 1 && gestureStart > topSince) {
        addIntent(e.deltaY);
        if (-intent >= BACK) {
          intent = 0;
          e.preventDefault();
          play(-1);
        }
      }
    };
    let touchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0].clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (touchY === null || !ready() || state === "playing") return;
      const dy = e.touches[0].clientY - touchY;
      if (state === "shown" && dy < -30) {
        touchY = null;
        play(1);
      } else if (state === "gone" && dy > 60 && window.scrollY <= 1 && performance.now() - topSince > 350) {
        touchY = null;
        play(-1);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (!ready() || state === "playing" || (e.target as HTMLElement)?.closest?.("input, textarea, select, dialog")) return;
      const down = ["PageDown", "ArrowDown", " ", "End"].includes(e.key);
      const up = ["PageUp", "ArrowUp", "Home"].includes(e.key);
      if (state === "shown" && down) {
        e.preventDefault();
        play(1);
      } else if (state === "gone" && up && window.scrollY <= 1) {
        e.preventDefault();
        play(-1);
      }
    };
    const onScroll = () => {
      topSince = window.scrollY <= 1 ? Math.min(topSince, performance.now()) : Infinity;
    };
    const onCue = () => ready() && state === "shown" && play(1);

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    const button = cue.current;
    button?.addEventListener("click", onCue);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
      button?.removeEventListener("click", onCue);
      lock(false);
      html.removeAttribute("data-covered");
    };
  }, []);

  return (
    <section ref={root} data-state="shown" className="opening-layer relative text-on-accent">
      <div className="relative flex h-[100svh] min-h-[34rem] items-center justify-center overflow-hidden pt-20" style={{ opacity: "calc(1 - var(--fade, 0))" }}>
        {/* The backdrop, with a soft-edged hole that opens where the stone is. */}
        <span aria-hidden className="opening-backdrop absolute inset-0 bg-[#2a0d14] bg-[url(/brand/bg-about-opening.webp)] bg-cover bg-center" />
        {/* The stone: revealed by the light on load; the dive scales and turns it. */}
        <div
          data-opening-stone
          className="relative aspect-square w-[min(78vw,62vh,36rem)] will-change-transform"
          style={{ transform: "scale(var(--zoom, 1)) rotate(calc(var(--turn, 0) * 1deg))" }}
        >
          <div className="opening-stone absolute inset-0" style={{ opacity: "var(--gem, 1)" }}>
            {/* Larger source than it's shown at, so it stays crisp as the camera moves in. */}
            <Image src={cutout} alt="" fill priority sizes="(min-width: 1024px) 60vw, 100vw" className="object-contain" />
          </div>
          {/* Brightening as an opacity layer (cheap) rather than an animated filter on a scaled image. */}
          <span aria-hidden className="pointer-events-none absolute inset-[2%] rounded-full bg-[radial-gradient(closest-side,rgb(255_252_244/0.9),rgb(255_252_244/0.35)_70%,transparent)]" style={{ opacity: "calc(var(--light, 0) * 0.8 * var(--gem, 1))" }} />
          <span aria-hidden className="opening-light pointer-events-none absolute -inset-[20%]" />
        </div>

        <div className="absolute inset-x-0 bottom-0" style={{ opacity: "var(--copy, 1)" }}>
          <div className="wrap flex flex-col gap-6 pb-12 sm:pb-16 lg:flex-row lg:items-end lg:justify-between">
            <h1 className="opening-title font-display text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-7xl">
              {title.split(" ").map((w, i) => (
                <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                  <span className="inline-block" style={{ animationDelay: `${0.9 + i * 0.09}s` }}>{w}&nbsp;</span>
                </span>
              ))}
            </h1>
            <p className="opening-line max-w-xs text-on-accent/75">{line}</p>
          </div>
        </div>

        <button
          ref={cue}
          type="button"
          className="opening-scroll absolute bottom-4 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-on-accent/60 hover:text-on-accent lg:flex"
          style={{ opacity: "var(--copy, 1)" }}
        >
          {scroll}
          <span aria-hidden className="block h-8 w-px bg-champagne/70" />
        </button>
      </div>
    </section>
  );
}
