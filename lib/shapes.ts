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
  Heart: "M0,40C-24,22 -40,6 -40,-12C-40,-30 -20,-40 0,-24C20,-40 40,-30 40,-12C40,6 24,22 0,40Z",
};
