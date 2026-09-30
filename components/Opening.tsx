"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { seg, setVars } from "./about/useScrub";

const DIVE_MS = 1400;
const BACK_MS = 1200;
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
    let lastScroll = 0;

    // t: 0 = the opening at rest, 1 = fully dissolved into the choice.
    const paint = (t: number) => {
      const fade = reduce ? t : seg(t, 0.43, 0.93);
      setVars(el, {
        "--zoom": reduce ? 1 : 1 + Math.pow(seg(t, 0, 0.64), 2) * maxZoom,
        "--turn": reduce ? 0 : seg(t, 0, 0.64) * 28,
        "--copy": 1 - seg(t, 0, 0.15),
        "--light": reduce ? 0 : seg(t, 0.3, 0.6),
        "--fade": fade,
      });
      // The 3D stones underneath stay paused while fully covered.
      html.toggleAttribute("data-covered", fade < 0.02);
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
        const eased = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
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
    const atTop = () => window.scrollY <= 1 && performance.now() - lastScroll > 400;

    const onWheel = (e: WheelEvent) => {
      if (state === "playing" || performance.now() < quietUntil) {
        e.preventDefault();
        return;
      }
      if (!ready()) return;
      if (state === "shown" && e.deltaY > 0) {
        e.preventDefault();
        play(1);
      } else if (state === "gone" && e.deltaY < 0 && atTop()) {
        e.preventDefault();
        play(-1);
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
      } else if (state === "gone" && dy > 40 && atTop()) {
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
    const onScroll = () => (lastScroll = performance.now());
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
      <div
        className="relative flex h-[100svh] min-h-[34rem] items-center justify-center overflow-hidden bg-[#2a0d14] bg-[url(/brand/bg-about-opening.webp)] bg-cover bg-center pt-20"
        style={{ opacity: "calc(1 - var(--fade, 0))", willChange: "opacity" }}
      >
        {/* The stone: revealed by the light on load; the dive scales and turns it. */}
        <div
          className="relative aspect-square w-[min(78vw,62vh,36rem)] will-change-transform"
          style={{ transform: "scale(var(--zoom, 1)) rotate(calc(var(--turn, 0) * 1deg))" }}
        >
          <div className="opening-stone absolute inset-0">
            {/* Larger source than it's shown at, so it stays crisp as the camera moves in. */}
            <Image src={cutout} alt="" fill priority sizes="(min-width: 1024px) 60vw, 100vw" className="object-contain" />
          </div>
          {/* Brightening as an opacity layer (cheap) rather than an animated filter on a scaled image. */}
          <span aria-hidden className="pointer-events-none absolute inset-[2%] rounded-full bg-[radial-gradient(closest-side,rgb(255_252_244/0.9),rgb(255_252_244/0.35)_70%,transparent)]" style={{ opacity: "calc(var(--light, 0) * 0.8)" }} />
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
