# Prompt: "How selling works": an interactive 3D diamond that acts out the journey

Redesign the "How selling works" section of the Sothis Diamonds homepage (Next.js 16, React 19, Tailwind 4, three.js + @react-three/fiber + drei already installed).
- **Palette tokens** (see `app/globals.css`): ivory `#F4F0E8`, ivory-deep `#EAE3D6` (this section's ground), burgundy `#511F2A`, champagne `#B8A27A` (decoration only), ink `#241519`, platinum-2 `#63605B`. Fonts: Bodoni Moda + Manrope.
- **Right now** the left column is empty apart from the heading, a button and a big "1". It feels bare.
- **The goal:** a real 3D diamond, pinned in view, that **acts out each of the 6 selling steps as you scroll**, and that the visitor can play with.

## The idea: one stone's journey, told by the stone
As the visitor scrolls through the six steps, a single round brilliant (the same refraction-material diamond as the Buy/Sell panels) goes through what a seller's stone actually goes through. Each step is a short, clear scene:

| Step (text stays as is) | What the diamond does |
|---|---|
| 1. **Submit your piece** | The stone drops gently into frame and settles. Four thin camera-viewfinder corner brackets (champagne) close in around it, a soft white shutter flash plays, and a small "photo 1 of 7" counter ticks, echoing the up-to-7-photos form. |
| 2. **Expert review** | A jeweller's loupe (a glass lens in a thin burgundy-black ring) glides across the stone. Facets under the lens are genuinely magnified by the refraction, not faked. Fine graphite callout lines draw out to three readouts that type in: carat, colour, clarity, using a real stone from `export/data/products.json` (e.g. S-1889: 5.02 ct, J, SI2, GIA). |
| 3. **Receive an offer** | The stone turns face-up and rests. A slim ivory offer card on a hairline thread swings in beside it. It says "Your offer" with the amount **deliberately blurred** (e.g. `€ ••,•••`), because we never show a made-up price. A burgundy "No obligation" note sits under it. |
| 4. **Accept and send** | A small ivory presentation box with a burgundy lining rises from below. The stone lowers into it, the lid closes, and a courier label slides onto the lid: "Fully insured · FedEx / DHL". The box slides off to the right, as if collected. |
| 5. **Inspection** | The box slides back in from the left ("arrived in Antwerp"), the lid opens and the stone rises onto a slow turntable. A thin champagne scan line passes over it top to bottom, and a small graphite tick draws itself with "Verified". |
| 6. **Fast payment** | The stone gives one bright sparkle (the dispersion strength briefly peaks), then settles on the turntable. A slim confirmation card appears: a burgundy tick and "Payment sent". |

Scrolling back up plays everything in reverse, smoothly. The timeline is **scrubbed by scroll position**, not triggered once, so the stone is always exactly where the scroll says.

## Interaction (the "play with it" part)
- **Drag to turn:** the visitor can grab the stone and spin it on any axis, with inertia. Letting go eases it back into the current scene's pose over about 1.2 s. Use drei's `PresentationControls` (or a small custom handler) with snap-back. No zoom and no page-scroll hijacking. On touch, a vertical swipe still scrolls the page; only horizontal drags turn the stone.
- **Hover:** the stone tilts a few degrees towards the cursor (parallax), and its fire (dispersion) gently increases under the pointer.
- **Click or tap the stone:** a quick celebratory full spin with a sparkle.
- **Hint:** a small platinum-2 caption under the stage, "Drag to turn the stone". It fades after the first drag.

## Layout
- **Desktop (≥ 1024 px):** two columns.
  - **Left, sticky:** full viewport height, vertically centred. The **3D stage** is about 34rem square, with:
    - the section title "How selling works" above it,
    - the current step number in small Bodoni with a champagne 6-segment progress rail under the stage (replacing the big lone "1"),
    - the "Start your valuation" button.
  - **Right:** the six step texts, as now, each about 70vh tall. The active one is ink and the rest platinum-2.
- **Tablet and phone:** the stage becomes sticky at the top (about 42vh), and the step texts scroll underneath it in a card that sits on the ivory-deep ground. The step text stays readable and is never covered by the stage.
- **Overlays:** the cards, labels and callouts (offer card, courier label, readouts, "Verified", "Payment sent") are **HTML/SVG overlays positioned over the canvas**, not 3D text. They stay crisp, can be translated, and read well at small sizes. All their text lives in `lib/dictionaries/en.ts` under `steps.scene`.

## Look
- **Lighting and shadow:** keep the diamond's studio look from the Buy/Sell panels (MeshRefractionMaterial, ior 2.42, 3 bounces), with a soft burgundy-tinted contact shadow on the ground.
- **Props:** the box, loupe and turntable are simple, elegant, low-poly shapes:
  - box: ivory with a burgundy lining,
  - loupe: a ring with a glass lens (transmission),
  - turntable: a thin brushed-metal disc.
  No clutter, no cartoon props, no textures beyond soft materials.
- **Easing:** everything eases (cubic in-out). Nothing snaps, and no scene element moves faster than the scroll feels like it should.
- **Colour:** champagne only for thin decorative lines (brackets, scan line, progress rail). Burgundy only for the few accents named above.

## Performance (keep what we learned from the Buy/Sell fix)
- **One canvas** for the whole scene. The stage is fixed-size (sized by viewport, never by its container), so nothing resizes while scrolling.
- **Render only when needed:** `frameloop="demand"`, invalidated on scroll progress change, drag, hover and running animations. Idle means no frames. Pause entirely when the section is off screen (IntersectionObserver).
- **Resolution:** DPR `[1, 2]`, full quality. Keep an eye on a steady 60 fps at 2× DPR (measure it, as we did for the Buy/Sell section).
- **Loading:** lazy-load the whole scene (`next/dynamic`, `ssr: false`) when the section is about one screen away. Show the step text immediately; the stage fades in when ready.
- **Assets:** props are built from primitives in code. No GLB downloads and no new libraries.

## Accessibility and fallbacks
- The step list stays the real content: headings plus text, in order, readable without the 3D.
- The canvas and overlays are `aria-hidden`. The drag hint and controls don't trap focus.
- **Reduced motion:** no scrubbing, drift, spin or sparkle. Each step shows a still pose of the stone with its overlay, and they crossfade as the active step changes.
- **No WebGL:** show a still image of the stone (from the Buy/Sell diamond, rendered once) with the same overlays.

## Done when
- Scrolling through the six steps plays the stone's journey forwards, and scrolling back plays it in reverse, frame-accurately with the scroll.
- The stone can be dragged, hovered and clicked, and it always settles back into its scene.
- The section no longer feels empty on desktop or mobile, the approved footer is untouched, and it holds 60 fps at 2× DPR.
