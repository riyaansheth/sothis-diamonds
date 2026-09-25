# Prompt: loading screen, Sothis Diamonds

Build a loading screen for the Sothis Diamonds homepage (Next.js 16, React 19, Tailwind 4). It uses the site's light paper design: ground `#EDE8DF` with fine grain, ink `#1F1B16`, muted `#6B6358`, champagne `#C9A96E`, gold text `#7F612B`, Bodoni Moda + Manrope. The centrepiece is the Sothis mark (the gold diamond with the "S" folded through it and the four-point sparkle top right) spinning, with a loading percentage under it.

## What the visitor sees
1. **Instantly:** the page is covered by plain paper, the same colour and grain as the site, so there's no white flash and no layout jump.
2. **The mark:** centred, about 120 px wide (88 px on phones).
   - It turns slowly around its vertical axis like a stone on a turntable: one full turn about every 2.4 s, with an ease-in-out on each half-turn so it lingers face-on.
   - As it turns, a thin highlight sweeps across the gold, as if light is catching a facet. The sparkle stays still and gently twinkles (scale 0.85 → 1 → 0.85, opacity 0.6 → 1).
   - Past 90° you see the back of the mark: a slightly darker, flatter gold, the reverse of a real piece rather than a mirrored copy.
3. **The percentage:** under the mark, in Bodoni Moda at about 2rem, tabular figures, counting 0 → 100. The only other text is a small muted Manrope line under it: "Sothis Diamonds, Antwerp".
4. **A hairline:** 1 px, 160 px wide, under the number. It fills with champagne from left to right in step with the percentage.
5. **At 100%:**
   - The mark stops face-on, the number holds for 250 ms, then the loader fades out while the mark shrinks and flies up into the header logo's position (a shared-element-style move of about 700 ms, eased out).
   - The homepage's own entrance, where the stones rise in and the headline wipes up, starts only when the loader has gone, so the two animations never overlap.

## The percentage must be real
The number reflects what the homepage actually needs before it looks right. It's not a fake timer.
- **Track, with weights:**
  - fonts: `document.fonts.ready` (15%)
  - the 4 hero stone images (15% each = 60%)
  - the logo (5%)
  - window `load` (20%)
- **The number shown eases towards the real progress** (lerp per frame), so it counts smoothly, never jumps, and never goes backwards.
- **Minimum time on screen:** 1.2 s, so it doesn't flash on fast connections.
- **Maximum:** 8 s. After that it finishes anyway and the page loads the rest in the background. If an asset fails, count it as done; never get stuck.

## When it appears
- **Every full page load or reload** (changed at the client's request). Moving between pages without reloading doesn't replay it.
- **The homepage only.** Other pages load normally.
- **If JavaScript is off**, it never blocks the page.
- **Reduced motion:** no spinning or flying. The mark sits still, the number counts, then the loader simply fades (300 ms).

## Accessibility
- The overlay has `role="status"`, `aria-live="polite"` and an accessible label like "Loading Sothis Diamonds, 45%". Announce only at 25% steps, not every number.
- Focus isn't trapped. The page underneath is `inert` while the loader shows, and it's released at the end.
- Text contrast: ink on paper, gold only for the hairline.

## The mark asset
- Recreate the mark as a clean vector SVG, not the raster embedded in `public/brand/logo.svg`. Trace the shapes from that logo:
  - the diamond outline,
  - the folded "S" band with its lighter and darker halves,
  - the sparkle.
- Use a two-stop gold gradient (about `#E6CC8A` → `#B8923F`) plus a darker gradient for the back face. Save it as `public/brand/mark.svg`, so the favicon and other small uses can reuse it.
- The spin is CSS 3D (`transform: rotateY()`, `backface-visibility: hidden` on front and back faces, `perspective` on the parent). No WebGL and no new libraries.

## Code
- One client component, `components/Loader.tsx`, rendered from `app/[lang]/page.tsx` (the homepage only), plus the SVG asset.
- **Tell the homepage when it's done:** a tiny shared signal, e.g. a `data-loaded` attribute on `<html>` that the entrance CSS keys off (`html:not([data-loaded]) .choir-rise { animation-play-state: paused }` or similar). No global state library.
- **All text from the dictionary:** `lib/dictionaries/en.ts`, under `loader`.
- **Match the code style** of `components/Motion.tsx` and `components/StoneChoir.tsx`. The approved footer is untouched.

## Done when
- A fresh visit shows paper → the spinning gold mark with a real percentage → a smooth handoff of the mark into the header logo → the hero entrance plays.
- Every reload shows the loader again; client-side navigation back to the homepage doesn't.
- Reduced motion shows a still mark and a simple fade.
- Nothing flashes and the page never gets stuck, including on slow 3G throttling and with an image that fails to load.
