"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { Diamond3DLazy } from "../Diamond3DLazy";

export type BuyStageData = {
  report: [string, string][]; // [label, value] from a real in-stock stone's report
  scene: {
    report: string;
    ask: string;
    reply: string;
    payments: string[];
    from: string;
    to: string;
    insured: string;
    papers: string;
    days: string;
  };
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/**
 * "How buying works": a white asscher turns at the centre while each step's scene is scrubbed by
 * scroll (progress 0..6 from StepsScroller). Scenes are plain HTML/SVG overlays, written to the DOM
 * directly each frame, so scrolling never re-renders React.
 */
export default function BuyStage({ data, progress }: { data: BuyStageData; progress: MutableRefObject<number> }) {
  const root = useRef<HTMLDivElement>(null);
  const s = data.scene;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = root.current!;
    const scenes = [...el.querySelectorAll<HTMLElement>("[data-scene]")];
    const stone = el.querySelector<HTMLElement>("[data-stone]")!;
    let shown = progress.current;
    let raf = 0;

    const frame = () => {
      const target = progress.current;
      shown = reduce ? Math.floor(target) + 0.8 : shown + (target - shown) * 0.12;
      const p = shown;
      scenes.forEach((sc) => {
        const i = Number(sc.dataset.scene);
        const local = clamp01((p - i) / 0.9); // 0..1 through this step
        const inV = ease(clamp01((p - i) / 0.25));
        const outV = i === 5 ? 1 : 1 - ease(clamp01((p - i - 0.85) / 0.15));
        sc.style.opacity = String(Math.min(inV, outV));
        sc.style.setProperty("--l", ease(local).toFixed(3));
      });
      // The stone settles smaller while it travels (step 4), then returns.
      const travel = ease(clamp01((p - 3) / 0.3)) * (1 - ease(clamp01((p - 4) / 0.3)));
      stone.style.transform = `scale(${(1 - travel * 0.22).toFixed(3)}) translateY(${(-travel * 8).toFixed(1)}%)`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  const card = (label: string) => (
    <div className="w-44 bg-ivory-deep/90 p-4 text-left ring-1 ring-line backdrop-blur-sm">
      <p className="text-xs text-platinum-2">{label}</p>
      <dl className="mt-2 space-y-1 text-sm">
        {data.report.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <dt className="text-platinum-2">{k}</dt>
            <dd className="font-display italic">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );

  return (
    <div ref={root} className="buy-stage relative size-full select-none">
      <div data-stone className="absolute inset-[8%] will-change-transform">
        <span aria-hidden className="absolute inset-[12%] rounded-full bg-[radial-gradient(closest-side,rgb(84_23_43/0.55),transparent)] blur-2xl" />
        <Diamond3DLazy cut="asscher" color="#ffffff" className="absolute inset-0" />
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-0 text-sm">
        {/* 1. Choose: the report card slides in, joined to the stone by a hairline. */}
        <div data-scene="0" className="absolute right-0 top-[18%] flex items-center opacity-0" style={{ transform: "translateX(calc((1 - var(--l, 1)) * 24px))" }}>
          <span className="h-px w-10 origin-right bg-ink/50" style={{ transform: "scaleX(var(--l, 1))" }} />
          {card(s.report)}
        </div>

        {/* 2. Ask: two message lines. */}
        <div data-scene="1" className="absolute inset-0 opacity-0">
          <p className="absolute left-0 top-[14%] rounded-sm bg-ivory-deep/90 px-4 py-2 ring-1 ring-line" style={{ transform: "translateY(calc((1 - var(--l, 1)) * 10px))" }}>{s.ask}</p>
          <p className="absolute bottom-[16%] right-0 rounded-sm bg-wine px-4 py-2 text-on-accent" style={{ opacity: "clamp(0, calc(var(--l, 1) * 2 - 0.6), 1)" }}>{s.reply}</p>
        </div>

        {/* 3. Checkout: the payment methods, then a check. */}
        <div data-scene="2" className="absolute inset-x-0 bottom-[6%] flex flex-wrap justify-center gap-2 opacity-0">
          {s.payments.map((m, i) => (
            <span key={m} className="border border-line bg-ivory-deep/80 px-3 py-1 text-xs" style={{ opacity: `clamp(0, calc(var(--l, 1) * 6 - ${i}), 1)` }}>{m}</span>
          ))}
          <svg viewBox="0 0 20 20" className="size-6 fill-none stroke-ink [stroke-width:1.4]">
            <path d="M4 10.5l4 4 8-9" pathLength={1} strokeDasharray="1" style={{ strokeDashoffset: "calc(1 - var(--l, 1))" }} />
          </svg>
        </div>

        {/* 4. Delivery: a route draws from Antwerp to you. */}
        <div data-scene="3" className="absolute inset-x-[6%] bottom-[8%] opacity-0">
          <div className="flex items-center justify-between text-xs text-platinum-2">
            <span>{s.from}</span>
            <span>{s.to}</span>
          </div>
          <div className="mt-2 h-px origin-left border-t border-dashed border-ink/60" style={{ transform: "scaleX(var(--l, 1))" }} />
          <p className="mt-3 text-center font-display text-lg italic">{s.insured}</p>
        </div>

        {/* 5. Papers: the report returns and docks beside the stone. */}
        <div data-scene="4" className="absolute left-0 top-[22%] opacity-0" style={{ transform: "translateX(calc((1 - var(--l, 1)) * -24px))" }}>
          {card(s.papers)}
        </div>

        {/* 6. Returns: a ring of 14 marks draws around the stone. */}
        <div data-scene="5" className="absolute inset-[4%] opacity-0">
          <svg viewBox="-50 -50 100 100" className="size-full overflow-visible">
            <circle r="47" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.3" />
            {Array.from({ length: 14 }, (_, i) => {
              const a = (i / 14) * Math.PI * 2 - Math.PI / 2;
              return (
                <line
                  key={i}
                  x1={Math.cos(a) * 44}
                  y1={Math.sin(a) * 44}
                  x2={Math.cos(a) * 49}
                  y2={Math.sin(a) * 49}
                  stroke="currentColor"
                  strokeWidth="0.6"
                  style={{ opacity: `clamp(0.15, calc(var(--l, 1) * 14 - ${i}), 1)` }}
                />
              );
            })}
          </svg>
          <p className="absolute inset-x-0 -bottom-9 text-center font-display text-lg italic">{s.days}</p>
        </div>
      </div>
    </div>
  );
}
