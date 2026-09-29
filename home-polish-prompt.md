# Homepage polish: one scroll = one product, clean Sell band, better "Sell with confidence"

## 1. One scroll = one product change
The homepage's product scroller is "Why Sothis": the pinned stone changes as the reasons scroll past. The collection rail, the old horizontal one, is no longer on the homepage.

**Behaviour:** on desktop, each mouse-wheel or trackpad scroll gesture over that section moves exactly one reason, and so exactly one stone.
- **How:** listen for `wheel` events while the reasons are on screen, cancel the native scroll, and smooth-scroll the next or previous reason to the centre.
- **One step per gesture:** accumulate trackpad deltas and lock while the step animates (about 650ms). Streams of trackpad events must not skip several stones.
- **No scroll trap:** at the first reason scrolling up, or the last reason scrolling down, the wheel passes through, so the page scrolls on normally.
- **Unchanged:**
  - Keyboard, scrollbar, touch and phones: all native.
  - The stone morph between reasons.
  - Hover to preview a reason.
- **Reduced motion:** the step jumps instead of animating.

## 2. The collapsed Sell band (the "glitch")
After clicking Sell, the band shows three problems:
- **Stripes:** vertical banding across the black silk. The portrait photo, 767 px wide, is stretched to about 1440 px, and the dark gradients band after WebP compression.
- **The stone:** a small 3D stone floats oddly in the middle, with its shadow detached far below it.
- **Proportions:** the band is taller than its content needs.

**Fix:**
- **Background:**
  - Re-encode the black half at high quality with sharp YUV, which removes the banding.
  - Use the full original width.
  - Position the image so the silk waves sit at the bottom.
  - Add a very light film-grain overlay, which dithers any remaining banding.
- **The stone:** hide it in the collapsed band.
- **The band:**
  - A compact band of about 30vh (min 16rem), with "Sell" and its line vertically centred on the left.
  - "Buying instead?" and "Change" sit on one baseline under the line.
  - The silk fades gently into the obsidian page below.

## 3. Restructure "Sell with confidence"
**Now:** a centred heading, a paragraph, and five category names floating in a loose wrap. It reads as a cloud of words.

**New layout: editorial, two columns (desktop).**
- **Left column (sticky while the list scrolls):**
  - the heading "Sell with confidence",
  - the paragraph,
  - one "Get a free valuation" button (to `/sell-your-diamond/`).
- **Right column:** a numbered list of the five categories (01–05). Each row is a full-width link:
  - the number, the category name in large serif, and the short description from the dictionary (already there, currently unused),
  - a thin arrow on the right,
  - rows separated by hairlines.
- **Hover or focus on a row:**
  - the name turns white and shifts right slightly (8px),
  - the arrow slides in,
  - the other rows dim.
  - This replaces the 110% scale effect.
- **Mobile:** stacked. The heading and text come first, then the list rows at full width with their descriptions.
- **Links:** each row links to its sell page, as now.

## Checks
- `tsc` and `eslint` are clean, and a production build passes.
- **Desktop:**
  - One wheel notch in Why Sothis moves one stone.
  - At the ends, the page scrolls on normally.
  - The collapsed band shows no stripes and no floating stone.
  - The new section layout works on hover.
- **Mobile at 390px:** there is no horizontal overflow.
- Commit, push, and deploy to the test site.
