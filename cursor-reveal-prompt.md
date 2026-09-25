# Prompt: cursor "reveal" effect, Sothis Diamonds homepage

Add a cursor-driven reveal effect to two sections of the Sothis Diamonds homepage (Next.js 16, React 19, Tailwind 4, dark design: black `#0A0A0A`, off-white `#F2EFEA`, champagne `#C9A96E`, Bodoni Moda + Manrope). Reference: Cartier's "Le Chœur des Pierres" (cartier.com/en-fr/lechoeurdespierres#kentia). There, moving the cursor paints a soft, cloud-shaped window that uncovers a hidden layer underneath (the jeweller's pencil sketch on paper with an embossed "Cartier Paris Londres New York" stamp), while the finished piece stays in place on top.

## The effect, precisely
- **Two stacked layers, same size:**
  - **Surface:** what the section shows now.
  - **Hidden:** a second artwork, fully rendered underneath.
- **The cursor paints a mask** that makes the surface transparent, so the hidden layer shows through.
- **Brush:** a soft round blob about 160–220 px across (scale with viewport; smaller on small screens). The edge is organic and cloudy, not a clean circle: feathered, with noise or turbulence breaking it up, like ink on damp paper or breath on glass.
- **Trail:** the mask is continuous along the cursor's path. Interpolate between pointer positions so fast moves leave no gaps. Overlapping strokes merge into one cloud shape.
- **Decay:** painted areas fade back to the surface over about 1.5–2.5 s, slowly and without a hard cut. Leaving the cursor still keeps a small area open that breathes gently (slight radius pulse).
- **Easing:** the brush position follows the pointer with light inertia (lerp about 0.15 per frame), so it feels liquid, not glued to the cursor.
- **Content that must stay on top:** the 3D diamonds and the text sit above both layers and are never masked. The reveal only swaps what's behind them.

## What gets revealed (Sothis's version of Cartier's sketch)
Cartier reveals the design drawing. Sothis reveals **the grading report**: the technical side of each stone.
- **Hidden layer look:** warm paper `#EDE8DF` with fine grain, and technical drawings of the stones in thin graphite-grey lines (`#6B665F`, 1 px):
  - a top view with facet lines,
  - a side profile with proportion lines,
  - small annotations from the stone's real data: measurements (e.g. "15.02 – 15.08 × 9.01 mm"), depth %, table %, carat, colour, clarity, lab.
- **Stamp:** a blind-embossed circular stamp in one area, "SOTHIS DIAMONDS · ANTWERPEN · SINCE [YEAR]", set in the same circular way as Cartier's "PARIS LONDRES NEW YORK" (embossed look: subtle light and shadow, no ink). Leave the year blank until the client confirms it.
- **Data:** all figures come from `export/data/products.json` (`specs`, `attributes`). Nothing is invented.

## Where it goes
1. **Hero** (the four stones "shown to scale" and "Buy DIAMONDS / or SELL YOURS"):
   - **Surface:** the current black with the soft "silk" light.
   - **Hidden:** the paper layer with the plotting diagrams of the four hero stones, each placed directly behind its stone (12.38 ct, 7.06 ct, 5.02 ct, 7.79 ct Asscher), plus the stamp in the right third.
   - **Behaviour:** the stone cut-outs and headline stay on top. Hovering a stone still works exactly as now, and the reveal runs alongside it.
2. **Buy / Sell split section:**
   - **Surface:** the current black panels with the rotating 3D diamonds.
   - **Hidden, Sell panel:** a filled-in valuation slip on paper (carat, colour, clarity, "Offer"), with the round brilliant's facet diagram.
   - **Hidden, Buy panel:** the Asscher's plotting diagram and proportions from S-1880's data.
   - **Behaviour:** the 3D diamond stays on top and keeps rotating. The panel still widens on hover.

## Build notes
- **Painting:** keep the mask on an offscreen `<canvas>` at half resolution, one per section. On each frame: fade the whole canvas a little (erase with low alpha using `destination-out`), then stamp the brush along the path. Don't turn the canvas into a CSS mask each frame (`toDataURL` is too slow); upload it as a texture to the shader below.
- **Preferred approach:** one small WebGL fragment shader per section (plain three.js, already installed; no new libraries). It samples surface and hidden textures plus the mask texture and adds animated noise at the mask edge for the cloudy border. If the surface is live DOM (the text and 3D canvas), keep them as separate layers above the shader and draw only the backgrounds in the shader.
- **Performance:** run the loop only while the section is on screen and the pointer has moved in the last 3 s. Cap at 60 fps, use device pixel ratio no higher than 1.5, and keep textures sized to the section.
- **Touch:** there's no hover on phones. Follow the finger while touching. When idle, a slow scripted "wander" path shows the effect once when the section enters the viewport, then stops.
- **Reduced motion:** no trail, no wander. Show a static, soft-edged reveal in one corner so the hidden artwork still exists.
- **Accessibility:** both layers are decorative (`aria-hidden`), text contrast on the surface is unchanged, and nothing essential lives only on the hidden layer.
- **Code:** a single reusable `<CursorReveal surface={...} hidden={...}>` component, used by both sections. Match the code style of `components/Motion.tsx` and `components/StoneChoir.tsx`. The approved footer is not touched.

## Done when
- Moving the mouse over the hero and the Buy/Sell panels leaves a soft cloud trail that uncovers the paper plotting diagrams and fades back on its own.
- 3D diamonds, stone hover, text and buttons stay on top and fully usable.
- It holds 60 fps on a mid-range laptop, is smooth on phones, and has a sensible reduced-motion version.
