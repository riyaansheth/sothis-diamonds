// Face-up outlines of each cut, in a -50..50 box. Drawn three times (girdle, crown, table) as a
// fine technical drawing, like the About page's anatomy drawing.
const oct = (w: number, h: number, c: number) => `M${-w + c},${-h}H${w - c}L${w},${-h + c}V${h - c}L${w - c},${h}H${-w + c}L${-w},${h - c}V${-h + c}Z`;
export const OUTLINES: Record<string, string> = {
  Round: "M0,-40A40,40 0 1 1 0,40A40,40 0 1 1 0,-40Z",
  Oval: "M0,-44A30,44 0 1 1 0,44A30,44 0 1 1 0,-44Z",
  Pear: "M0,-44C22,-16 32,6 30,22A30,22 0 0 1 -30,22C-32,6 -22,-16 0,-44Z",
  Cushion: "M-26,-38H26Q38,-38 38,-26V26Q38,38 26,38H-26Q-38,38 -38,26V-26Q-38,-38 -26,-38Z",
  Emerald: oct(28, 42, 10),
  Radiant: oct(32, 40, 11),
  Asscher: oct(38, 38, 15),
  Princess: "M-38,-38H38V38H-38Z",
  // Jewellery types: a ring with its stone, a bracelet seen at an angle, a watch face with its strap.
  Ring: "M0,-24A30,30 0 1 1 0,36A30,30 0 1 1 0,-24ZM-9,-24L0,-38L9,-24",
  Bracelet: "M0,-24A42,24 0 1 1 0,24A42,24 0 1 1 0,-24Z",
  Watch: "M-18,-22H18V22H-18ZM-12,-22V-46M12,-22V-46M-12,22V46M12,22V46",
  Heart: "M0,40C-24,22 -40,6 -40,-12C-40,-30 -20,-40 0,-24C20,-40 40,-30 40,-12C40,6 24,22 0,40Z",
};

/** A jewellery piece's kind, from its name (a band is a ring). */
export const jewelleryType = (p: { title: string }) => {
  const m = p.title.match(/\b(ring|band|bracelet|watch)\b/i)?.[1].toLowerCase();
  return m ? ({ ring: "Ring", band: "Ring", bracelet: "Bracelet", watch: "Watch" } as Record<string, string>)[m] : undefined;
};
