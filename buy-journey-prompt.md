# The Buy journey: a cinematic homepage experience that mirrors Sell

## Goal
Clicking **Buy** on the homepage no longer jumps to `/shop/`. Like Sell, it opens a story on the page:
1. The Buy half takes the screen.
2. The choice collapses into a Buy band.
3. A buying journey unfolds: the collection, shapes, how buying works, why Sothis, testimonials and a closing call.

The journey hands the visitor to the shop or a specific stone. Every fact comes from the export (shipping and returns policies, product data). Nothing is invented.

## Visual language (match what the site already does)
- **Palette:**
  - obsidian ground `#070708`,
  - burgundy silk and velvet for the Buy side (Sell owns black silk),
  - white text accents,
  - champagne only on non-text hairlines and the logo mark.
- **Type:** Bodoni Moda for headings and numerals; Manrope for body and labels. No all-caps eyebrows, and no gold text.
- **Motion vocabulary already on the site (reuse, don't invent new styles):**
  - headings that wipe up line by line (`RevealHeading`),
  - pinned scroll scenes (`StepsScroller`, `WhyList`),
  - a silk "sheen" sweep on hover,
  - a stone that morphs by dissolving into light,
  - rows that dim while one comes forward.
- **Rules:**
  - One orchestrated moment per section, not scattered fade-ups.
  - Motion answers scroll or the pointer.
  - Only `transform` and `opacity` animate during scroll.
  - 3D renders only while visible and uncovered (existing `data-covered` pause).
  - Everything has a reduced-motion state that shows the final frame.

## 0. The choice: Buy opens its journey

**Clicking Buy:**
1. **The halves (0–900ms):** the Buy half widens to full width (`flex-grow`, the same curve as Sell). The Sell half narrows and fades to the right, and the champagne divider slides away with it.
2. **The Buy stone (0–600ms):** the lilac asscher lifts 12px and brightens as its spotlight blooms (the existing `.paths-spotlight`). It then fades out as the band collapses (the Sell band's treatment).
3. **The text (300–800ms):** "Buy" stays. The body crossfades to "Here's how buying from us works.", and "See the collection" fades out.
4. **The band (600–1200ms):** the section collapses to the band height, `max(16rem, 32vh)`. The burgundy silk re-crops to its lower waves, with the same grain and a bottom fade into the obsidian.
5. **The journey (from 650ms):** it is revealed, the page smooth-scrolls to the first section, and focus moves to its heading.

**The Buy band:**
- It mirrors the Sell band: "Buy" and its line on the left.
- Bottom row: "Selling instead? **See how selling works**" and "↺ Change".
- "See how selling works" swaps journeys in place:
  1. The band crossfades from burgundy to black silk over 500ms.
  2. The Buy journey fades out and the Sell journey fades in.
  3. The page scrolls to the Sell journey's first section.
- The Sell band gets the matching "Buying instead? **See the collection**", which now opens the Buy journey instead of the shop.

**State:**
- `open: null | "buy" | "sell"`, in-page only, with no URL hash.
- Every visit starts at the choice, and Change restores it.

## 1. The collection: a burgundy stage for the stones
**Layout:** full-bleed, 100vh on desktop. Deep burgundy velvet at the top fades into obsidian at the bottom, using the dark velvet image already in `public/brand`, flipped. The heading sits left-aligned in the `wrap`, and the rail runs edge to edge beneath it.

**Content:**
- The heading "The collection" (wipes up) and its existing line.
- **Filter chips:**
  - "All", "Diamonds", "Jewellery", then the shapes actually in stock (computed).
  - The active chip has a white fill and obsidian text; the others have a hairline outline.
- **The rail:**
  - Order: the 4 jewellery pieces first, then diamonds by price.
  - Cards are cropped clear of certificates (`HOME_CROPS`, which must be extended so every stone in the rail has a crop).
  - Each card shows the name, key specs and price in the chosen currency.
- **Link:** "Browse all {n} pieces" goes to `/shop/`, with `n` computed.

**Animation:**
- **Entrance (once, on first view):**
  1. The rail's cards rise from 40px lower and fade in, staggered 70ms apart and capped at the first 6 visible.
  2. At the same time the velvet backdrop drifts upward from `scale(1.08)` to `1` over 1.4s.
- **Chip filtering (FLIP):**
  - Cards that stay slide to their new positions (400ms). Cards leaving fade and shrink to 0.96.
  - Cards arriving fade in from 0.96.
  - No layout jump: the rail keeps its height.
- **Card hover:**
  - The photo scales to 1.04 over 900ms, and the stone's video plays (as now).
  - A light sheen sweeps across the card once (the existing `.paths-sheen` keyframe).
  - The name underline draws from the left.
- **Rail scrolling:** native horizontal scroll with snap, plus the previous/next buttons. There is no auto-advance here.
  - A thin progress line under the rail fills as the visitor scrolls (scaleX of the progress, transform only).
- **Reduced motion:** no rise, drift or FLIP; changes are instant.

## 2. Shop by shape
**Layout:** a single row of shape tiles, wrapping on smaller screens. Each tile is a square hairline frame.

**Content:**
- **The tile's visual:** a precise line drawing of the cut, as face-up SVGs for round, oval, pear, cushion, emerald, radiant, heart, asscher and princess.
  - These are generated from geometry like the About page's anatomy drawing, not images.
- **Below the drawing:** the shape name and its in-stock count ("Oval · 6"), both computed.
- **Link:** each tile goes to `/shop/?shape=Oval`.

**Animation:**
- **On first view:** each tile's outline draws itself with `stroke-dashoffset` over 900ms, staggered 60ms left to right. The name and count fade in after its drawing completes.
- **On hover or focus:**
  - The drawing rotates 12° and the facet lines brighten from 40% to 100% white.
  - The frame's corners extend inward (four small L-brackets, like a viewfinder, echoing Sell step 1).
  - The count lifts 4px.
- **Reduced motion:** the drawings are fully drawn and static.

## 3. How buying works: a pinned 3D story with its own stone
**Layout:** the same mechanics as "How selling works" (`StepsScroller`): the stone and a step indicator are pinned on the left while six steps scroll past on the right.
- **Backdrop:** obsidian with a soft burgundy glow behind the stone (a radial gradient), so it reads as the Buy counterpart of Sell's velvet without repeating it.
- **The stone:** the lilac asscher (`#D4B9CB`) from the Buy half, rendered with the existing `Diamond3D` refraction material.
- **Step indicator:** "Step n of 6" with six hairline segments that fill white as each step passes.

**The six steps, each with one scene over the turning stone.** Scenes are HTML overlays like the Sell stage: crisp, translatable, cheap.
1. **Choose your stone.** "Every diamond comes with its grading report from GIA, HRD or IGI."
   - *Scene:* the stone turns face-up. A slim report card slides in from the right with the lab, carat, colour and clarity of a real in-stock stone, and a hairline connects the card to the stone.
2. **Ask us anything.** "Enquire about any piece, and a gemmologist replies personally."
   - *Scene:* two short message bubbles fade in beside the stone. They are generic text from the site's own copy, not a real person or conversation. A soft pulse runs along the hairline.
3. **Secure checkout.** "Bancontact, iDEAL, Visa, Mastercard or bank transfer."
   - *Scene:* the stone settles and five small wordmarks of the payment methods fade in beneath it as plain text labels (no brand logos), with a checkmark drawing.
4. **Insured delivery.** "Fully insured and tracked with DHL Express, FedEx or UPS, signed for on arrival. Europe, the US, Canada and Australia."
   - *Scene:* the presentation box from the Sell stage rises, the stone lowers in and the lid closes, all reused from `StepsStage`. A dotted route line draws from "Antwerp" to "You".
5. **Arrives with its papers.** "The original certificate travels with the stone."
   - *Scene:* the box opens, the stone rises, and the report card from step 1 returns and docks beside it.
6. **14-day returns.** "Unworn pieces in their original condition, with packaging and certificates, can be returned within 14 days."
   - *Scene:* a thin ring draws around the stone like a clock face, filling to 14 marks. The stone gives one bright sparkle, as at the end of Sell.

**Scroll mechanics:**
- The same reading-line progress as Sell, so each step's scene is tied to its text crossing the middle of the screen.
- Scenes are scrubbed by scroll, not timed, and reversing scroll reverses them.

**Call to action:** "Explore the collection" goes to `/shop/`.

**Reduced motion:** each step shows its most telling frame.

**Mobile:** the stone is pinned at the top at 36vh and the steps scroll under it, as in the Sell version.

## 4. Why buy from Sothis
**Layout:** the same numbered-row pattern as the new "Sell with confidence", mirrored: the list on the left and the pinned heading on the right, so the two journeys feel like a pair.

**Rows (all facts computed or from the policies):**
1. **Certified stones:** "56 GIA, 12 HRD and 11 IGI reports in the collection today." The counts are computed.
2. **From Antwerp:** stones chosen and checked in the diamond district (existing site wording).
3. **Insured to your door:** every shipment insured until signed for.
4. **14-day returns:** links to the returns policy.
5. **Your currency:** prices in USD or EUR, with the currency switch inline.

**Animation:**
- **Numerals count up** when a row enters view: the certificate totals count from 0 over 900ms with easing. Plain text is shown with reduced motion.
- **On hover:** the rows dim except the hovered one, as on the Sell list.

## 5. Testimonials
Reuse the existing testimonials section, unchanged.

## 6. Closing call to action
**The block:** the burgundy closing block, with "Found a stone you love?" and the buttons "Explore the collection" (`/shop/`) and "Ask about a stone" (`/contact-us/`).

**Animation:** the heading wipes up, and the champagne hairline above it draws from the centre outward (scaleX).

## Engineering
- **`HomeChoice`:**
  - Generalise to `open: null | "buy" | "sell"`, with both bands and both journeys as server-rendered children.
  - Hidden until chosen via the existing `html.js` technique; no JavaScript means everything shows.
- **`StepsScroller` and `StepsStage`:** accept a `variant` ("sell" | "buy") that selects the stone, backdrop, step copy and scene set. Shared mechanics stay in one place.
- **New components:**
  - `CollectionStage` (chips, rail, progress line, FLIP),
  - `ShapeTiles` (with `shapeOutline(shape)` SVG geometry),
  - `BuySteps` scenes.
- **Server data:** in-stock items, shape counts and lab counts are computed in `page.tsx` from `lib/products.ts`. Only the slim fields each client component needs are passed down.
- **Dictionary:** add `home.buy*`, `buySteps`, `buyWhy` and `buyClosing`, English first.
- **Performance:**
  - Only one WebGL stone renders per visible section.
  - The Buy stage stone lazy-loads when near.
  - Scroll handlers write CSS variables only when values change.
  - Card videos load on hover only.
- **Accessibility:**
  - The filter chips are a `radiogroup`, and the rail has previous and next buttons with labels.
  - Every animated count or scene has its text in the DOM.
  - Focus is visible on every tile, row and card.

## Checks
- `tsc` and `eslint` are clean, and a production build passes.
- **Desktop at 1440px:**
  - Buy expands, the band appears and the journey scrolls in.
  - The chips filter with FLIP, and the rail scrolls with its progress line.
  - The shape tiles draw.
  - How buying works pins and scrubs all six scenes both ways.
  - Why numerals count up, and "Selling instead?" swaps journeys.
- **Mobile at 390px:** stacked, with no horizontal overflow.
- **Reduced motion and no JavaScript:** everything is readable.
- **Performance:** a steady 60fps through How buying works.
- Commit, push, and deploy to the test site.

## Defaults (change before building if needed)
1. The journey stays on the homepage for now; it can move to `/buy/` later.
2. Rail order: jewellery first, then diamonds by price.
3. How buying works uses the lilac asscher.
