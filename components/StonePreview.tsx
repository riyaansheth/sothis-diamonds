// The visitor's stone, drawn as they describe it: the shape outlines itself, the carat sets its size,
// the colour grade tints it and lower clarity grades show a few specks. Face-up outlines in a
// 100-unit box centred on 0,0.

const OUTLINES: Record<string, string> = {
  Round: "M0,-40 A40,40 0 1 1 0,40 A40,40 0 1 1 0,-40 Z",
  Oval: "M0,-42 A30,42 0 1 1 0,42 A30,42 0 1 1 0,-42 Z",
  Pear: "M0,-44 C20,-22 33,-4 33,12 A33,30 0 0 1 -33,12 C-33,-4 -20,-22 0,-44 Z",
  Cushion: "M-24,-38 H24 Q38,-38 38,-24 V24 Q38,38 24,38 H-24 Q-38,38 -38,24 V-24 Q-38,-38 -24,-38 Z",
  Princess: "M-36,-36 H36 V36 H-36 Z",
  Emerald: "M-18,-40 H18 L27,-31 V31 L18,40 H-18 L-27,31 V-31 Z",
  Asscher: "M-24,-36 H24 L36,-24 V24 L24,36 H-24 L-36,24 V-24 Z",
  Radiant: "M-21,-39 H21 L28,-32 V32 L21,39 H-21 L-28,32 V-32 Z",
  Marquise: "M0,-46 Q44,0 0,46 Q-44,0 0,-46 Z",
  Heart: "M0,38 C-40,10 -44,-14 -30,-30 C-18,-42 -4,-36 0,-24 C4,-36 18,-42 30,-30 C44,-14 40,10 0,38 Z",
};
const SPOKES = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4 + Math.PI / 8);

/** Same tints as the colour chips: D reads white, N–Z light yellow; fancy is a deeper yellow. */
function tint(colour: string | undefined, grades: string[]) {
  const i = colour ? grades.indexOf(colour) : -1;
  if (i < 0) return "hsl(0 0% 97%)";
  if (i > 10) return "hsl(44 85% 62%)";
  return `hsl(48 ${Math.round((i / 10) * 70)}% ${97 - i * 2}%)`;
}

const specks = (clarity?: string) => (!clarity ? 0 : /^I\d/.test(clarity) ? 5 : /^SI/.test(clarity) ? 2 : 0);

export function StonePreview({ shape, carat, colour, clarity, grades, empty }: {
  shape?: string;
  carat?: string;
  colour?: string;
  clarity?: string;
  grades: string[];
  empty: string;
}) {
  const outline = shape ? (OUTLINES[shape] ?? OUTLINES.Round) : null;
  const ct = Number.parseFloat((carat ?? "").replace(",", "."));
  // Size grows with the cube root of the weight (its diameter), within the frame.
  const scale = ct > 0 ? Math.min(1.15, Math.max(0.5, 0.48 + 0.24 * Math.cbrt(ct))) : 0.75;
  const n = specks(clarity);

  return (
    <div className="stone-preview grid aspect-square place-items-center">
      {outline ? (
        <svg viewBox="-50 -50 100 100" className="size-full overflow-visible" aria-hidden>
          <defs>
            <clipPath id="stone-clip"><path d={outline} /></clipPath>
            <linearGradient id="stone-shine" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0.15" stopColor="#fff" stopOpacity="0.75" />
              <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.8" stopColor="#000" stopOpacity="0.18" />
            </linearGradient>
          </defs>
          <g className="stone-size" style={{ transform: `scale(${scale})` }}>
            {/* Keyed by shape so a new shape draws itself again. */}
            <g key={shape}>
              <path d={outline} className="stone-body" style={{ fill: tint(colour, grades) }} />
              <g clipPath="url(#stone-clip)" className="stone-facets">
                {SPOKES.map((a) => <line key={a} x1={0} y1={0} x2={Math.cos(a) * 60} y2={Math.sin(a) * 60} />)}
                <path d={outline} transform="scale(0.55)" className="stone-table" />
                <rect x={-50} y={-50} width={100} height={100} fill="url(#stone-shine)" stroke="none" />
                {Array.from({ length: n }, (_, i) => <circle key={i} cx={[-9, 11, 4, -14, 16][i]} cy={[6, -8, 14, -12, 9][i]} r={1.2} className="stone-speck" />)}
              </g>
              <path d={outline} pathLength={1} className="stone-outline" />
            </g>
          </g>
        </svg>
      ) : (
        <p className="max-w-[12rem] text-center text-sm text-platinum-2">{empty}</p>
      )}
    </div>
  );
}
