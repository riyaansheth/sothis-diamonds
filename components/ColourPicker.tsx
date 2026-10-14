"use client";

import { useEffect, useState } from "react";
import { hexToHsv, hsvToHex, type Hsv } from "@/lib/colour";

// A colour picker in the shape of a design tool's: saturation/brightness square, hue strip, the
// picked swatch and its hex code. Mouse, touch and arrow keys (shift for bigger steps).

const clamp = (n: number) => Math.max(0, Math.min(1, n));

export function ColourPicker({ value, onChange, label, clear }: { value: string; onChange: (hex: string) => void; label: string; clear: string }) {
  // Starts white, with a grey square: colour appears only once a hue is chosen (or a colour was saved).
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value) ?? { h: 0, s: 0, v: 1 });
  const [hueChosen, setHueChosen] = useState(() => Boolean(hexToHsv(value)?.s));
  const pickHue = (h: number) => {
    setHueChosen(true);
    pick({ h, s: hsv.s || 1, v: hsv.s ? hsv.v : 1 }); // from white, jump to the full colour
  };
  const [hexText, setHexText] = useState(value);

  // A draft restored after mount, or a cleared value, updates the picker.
  useEffect(() => {
    const parsed = hexToHsv(value);
    /* eslint-disable react-hooks/set-state-in-effect -- follow the form's value */
    if (parsed && value.toLowerCase() !== hsvToHex(hsv)) {
      setHsv(parsed);
      if (parsed.s) setHueChosen(true);
    }
    if (!value) {
      setHsv({ h: 0, s: 0, v: 1 }); // cleared: back to white
      setHueChosen(false);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    setHexText(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the value changes from outside
  }, [value]);

  const pick = (next: Hsv) => {
    setHsv(next);
    const hex = hsvToHex(next);
    setHexText(hex);
    onChange(hex);
  };

  const drag = (apply: (x: number, y: number) => void) => (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent | React.PointerEvent) => {
      const r = el.getBoundingClientRect();
      apply(clamp((ev.clientX - r.left) / r.width), clamp((ev.clientY - r.top) / r.height));
    };
    move(e);
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
  };

  const keys = (e: React.KeyboardEvent, dx: (d: number) => void, dy: (d: number) => void) => {
    const d = e.shiftKey ? 0.1 : 0.02;
    const moves: Record<string, () => void> = { ArrowLeft: () => dx(-d), ArrowRight: () => dx(d), ArrowUp: () => dy(-d), ArrowDown: () => dy(d) };
    if (moves[e.key]) {
      e.preventDefault();
      moves[e.key]();
    }
  };

  const picked = value ? hsvToHex(hsv) : null;

  return (
    <div className="colour-picker grid max-w-md grid-cols-[1fr_1.25rem] gap-3">
      <div
        role="slider"
        tabIndex={0}
        aria-label={`${label}: saturation and brightness`}
        aria-valuetext={picked ?? "none"}
        aria-valuenow={Math.round(hsv.s * 100)}
        onPointerDown={drag((x, y) => pick({ ...hsv, s: x, v: 1 - y }))}
        onKeyDown={(e) => keys(e, (d) => pick({ ...hsv, s: clamp(hsv.s + d) }), (d) => pick({ ...hsv, v: clamp(hsv.v - d) }))}
        className="relative aspect-[4/3] cursor-crosshair touch-none rounded-sm ring-1 ring-line focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueChosen ? `hsl(${hsv.h} 100% 50%)` : "#fff"})` }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white shadow-[0_0_0_1px_rgb(0_0_0/0.5)]"
          style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, opacity: picked ? 1 : 0.5 }}
        />
      </div>
      <div
        role="slider"
        tabIndex={0}
        aria-label={`${label}: hue`}
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={Math.round(hsv.h)}
        onPointerDown={drag((_, y) => pickHue(y * 360))}
        onKeyDown={(e) => keys(e, () => {}, (d) => pickHue((hsv.h + d * 360 + 360) % 360))}
        className="relative cursor-ns-resize touch-none rounded-sm ring-1 ring-line focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ background: "linear-gradient(to bottom, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)" }}
      >
        <span aria-hidden className="pointer-events-none absolute -inset-x-1 h-1.5 -translate-y-1/2 rounded-sm border border-white bg-black/20 shadow" style={{ top: `${(hsv.h / 360) * 100}%`, opacity: hueChosen ? 1 : 0 }} />
      </div>

      <div className="col-span-2 flex items-center gap-3">
        <span aria-hidden className="size-10 shrink-0 rounded-sm ring-1 ring-line" style={{ background: picked ?? "repeating-conic-gradient(rgb(255 255 255/0.12) 0 25%, transparent 0 50%) 0 0/10px 10px" }} />
        <label className="flex items-center gap-1 text-sm text-platinum-2">
          #
          <input
            className="field h-10 w-28 font-mono uppercase"
            value={hexText.replace("#", "")}
            maxLength={7}
            spellCheck={false}
            aria-label={`${label}: hex code`}
            onChange={(e) => {
              const text = `#${e.target.value.replace(/[^0-9a-f]/gi, "").slice(0, 6)}`;
              setHexText(text);
              const parsed = hexToHsv(text);
              if (parsed) pick(parsed);
            }}
          />
        </label>
        {picked && (
          <button type="button" onClick={() => onChange("")} className="ml-auto text-sm text-platinum-2 underline underline-offset-4 hover:text-ink">
            {clear}
          </button>
        )}
      </div>
    </div>
  );
}
