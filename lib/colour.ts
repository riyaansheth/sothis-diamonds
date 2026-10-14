// Colour maths for the colour picker: hex <-> hue, saturation, brightness.

export type Hsv = { h: number; s: number; v: number }; // h 0..360, s and v 0..1

export function hsvToHex({ h, s, v }: Hsv) {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return Math.round(255 * (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))));
  };
  return `#${[f(5), f(3), f(1)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

export function hexToHsv(hex: string): Hsv | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = Number.parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255);
  const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
  const h = d === 0 ? 0 : max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}

// Self-check: `npx tsx lib/colour.ts`
if (typeof window === "undefined" && process.argv[1]?.endsWith("colour.ts")) {
  for (const hex of ["#ac6757", "#ffffff", "#000000", "#ff0000", "#12ab34"]) {
    const back = hsvToHex(hexToHsv(hex)!);
    if (back !== hex) throw new Error(`${hex} -> ${back}`);
  }
  console.log("colour maths ok");
}
