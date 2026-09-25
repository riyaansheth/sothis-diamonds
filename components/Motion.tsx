"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { StageData } from "./StepsStage";

/** Adds data-shown once the element scrolls into view; CSS ([data-reveal]) does the wipe. */
function useShown<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.shown = "";
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

/** Wrapper that gets data-shown once scrolled into view; CSS holds entrance animations until then. */
export function InView({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useShown<HTMLDivElement>();
  return (
    <div ref={ref} data-inview className={className}>
      {children}
    </div>
  );
}

/** Heading whose lines wipe upward into view, one after another. Pass lines as an array. */
export function RevealHeading({ lines, as: Tag = "h2", className = "" }: { lines: string[]; as?: "h1" | "h2"; className?: string }) {
  const ref = useShown<HTMLHeadingElement>();
  return (
    <Tag ref={ref} data-reveal className={className} aria-label={lines.join(" ")}>
      {lines.map((line, i) => (
        <span key={i} className="reveal-line" aria-hidden>
          <span style={{ transitionDelay: `${i * 110}ms` }}>{line}</span>
        </span>
      ))}
    </Tag>
  );
}

const StepsStage = dynamic(() => import("./StepsStage"), { ssr: false });

/**
 * "How selling works": a pinned 3D stage that acts out each step, scrubbed by scroll, beside the step
 * texts. Progress (0..6) lives in a ref so scrolling never re-renders React; only the active step does.
 */
export function StepsScroller({ steps, heading, action, stage, stepLabel }: {
  steps: string[][];
  heading: ReactNode;
  action: ReactNode;
  stage: StageData;
  stepLabel: string;
}) {
  const [active, setActive] = useState(0);
  const [near, setNear] = useState(false);
  const list = useRef<HTMLOListElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef(0);

  useEffect(() => {
    const ol = list.current!;
    let raf = 0;
    const update = () => {
      raf = 0;
      // 0 when the list's top reaches mid-screen; 6 when its bottom reaches the bottom of the screen,
      // so the last step completes while the stage is still pinned.
      const r = ol.getBoundingClientRect();
      const vh = window.innerHeight;
      const span = Math.max(1, r.height - vh * 0.5);
      const p = Math.min(steps.length - 0.001, Math.max(0, ((vh * 0.5 - r.top) / span) * steps.length));
      progress.current = p;
      setActive(Math.floor(p));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Load the 3D scene when the section is about a screen away.
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "100% 0px" });
    io.observe(root.current!);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [steps.length]);

  return (
    <div ref={root} className="grid gap-x-16 lg:grid-cols-[1fr_1fr]">
      <div className="sticky top-20 z-10 -mx-4 bg-ivory-deep px-4 pb-4 pt-6 lg:top-0 lg:mx-0 lg:flex lg:h-dvh lg:flex-col lg:justify-center lg:bg-transparent lg:px-0 lg:pb-8 lg:pt-24">
        <div className="hidden lg:block">{heading}</div>
        <div className="mx-auto aspect-square h-[36vh] max-w-full lg:mx-0 lg:mt-4 lg:h-auto lg:w-[min(32rem,36vw,52vh)]">
          {near && <StepsStage data={stage} progress={progress} />}
        </div>
        <div className="mt-3 flex items-center gap-4 lg:mt-8">
          <span className="font-display text-lg tabular-nums">{stepLabel.replace("{n}", String(active + 1))}</span>
          <div aria-hidden className="flex flex-1 gap-1.5 lg:max-w-56">
            {steps.map((_, i) => (
              <span key={i} className={`h-px flex-1 transition-colors duration-500 ${i <= active ? "bg-champagne" : "bg-line"}`} />
            ))}
          </div>
        </div>
        <div className="mt-6 hidden lg:block">{action}</div>
      </div>

      <div>
        <div className="pt-16 lg:hidden">{heading}</div>
        <ol ref={list}>
          {steps.map(([title, body], i) => (
            <li
              key={title}
              data-on={i === active ? "" : undefined}
              className="step-item flex min-h-[60vh] flex-col justify-center border-t border-line py-12 lg:min-h-[70vh]"
            >
              <h3 className="text-2xl sm:text-3xl">{title}</h3>
              <p className="mt-3 max-w-sm text-platinum-2">{body}</p>
            </li>
          ))}
        </ol>
        <div className="pb-16 lg:hidden">{action}</div>
      </div>
    </div>
  );
}

/** Horizontal, swipeable row with previous/next buttons. */
export function Rail({ children, prev, next }: { children: ReactNode; prev: string; next: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const move = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <div>
      <ul ref={ref} className="rail flex snap-x snap-mandatory gap-8 overflow-x-auto pb-6">
        {children}
      </ul>
      <div className="mt-4 flex justify-center gap-3">
        <button type="button" onClick={() => move(-1)} className="btn btn-secondary" aria-label={prev}>
          <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current [stroke-width:1.5]" aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <button type="button" onClick={() => move(1)} className="btn btn-secondary" aria-label={next}>
          <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current [stroke-width:1.5]" aria-hidden><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}

/** One large quote at a time, crossfading; advances every 8s unless reduced motion or hovered. */
export function Quotes({ items, label }: { items: string[][]; label: string }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % items.length), 8000);
    return () => clearInterval(t);
  }, [paused, items.length]);

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className="grid justify-items-center">
      <div className="grid">
        {items.map(([quote, name], n) => (
          <figure key={name} aria-hidden={n !== i} className="quote col-start-1 row-start-1 max-w-4xl text-center" data-on={n === i ? "" : undefined}>
            <blockquote className="font-display text-2xl leading-snug sm:text-4xl">“{quote}”</blockquote>
            <figcaption className="mt-8 text-platinum-2">{name}</figcaption>
          </figure>
        ))}
      </div>
      <div role="group" aria-label={label} className="mt-10 flex gap-3">
        {items.map(([, name], n) => (
          <button
            key={name}
            type="button"
            aria-label={name}
            aria-pressed={n === i}
            onClick={() => setI(n)}
            className="group py-4"
          >
            <span className="block h-px w-10 bg-line transition-colors group-aria-pressed:bg-champagne" />
          </button>
        ))}
      </div>
    </div>
  );
}
