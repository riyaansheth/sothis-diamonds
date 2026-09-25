# Prompt: re-colour the Sothis Diamonds site with the new brand palette

Re-colour the whole Sothis Diamonds site (Next.js 16, Tailwind 4, tokens in `app/globals.css`) to the client's new palette. This is a **colour and emphasis redesign, not a layout rebuild**:
- Keep every section, interaction and animation that exists: the stones shown to scale, the cursor reveal, the 3D diamonds, the steps scroller, the collection row, the loader.
- The footer's layout and content are locked (see memory); only its colours change.
- Fonts stay: Bodoni Moda and Manrope.

## The palette (from the client)
| Name | Hex | Role given by the client |
|---|---|---|
| Warm Ivory | `#F4F0E8` | Product and editorial sections (the main ground) |
| Champagne Gold | `#B8A27A` | Subtle decorative accents |
| Deep Burgundy | `#511F2A` | Signature brand accent |
| Soft Platinum | `#A5A29D` | Secondary typography and details |

## Two companions the palette needs (for readable text)
Champagne (2.2:1 on ivory) and Soft Platinum (2.2:1) are below the 4.5:1 WCAG AA minimum for normal-size text, so they can't carry small copy. Add:
- **Ink `#241519`**: near-black with a burgundy undertone, for body text and headings (15.4:1 on ivory).
- **Platinum Deep `#63605B`**: the readable version of Soft Platinum for small secondary text (5.5:1 on ivory, 4.9:1 on Ivory Deep).

Soft Platinum itself is used only for non-text details: hairlines, dividers and decorative states. (Checked: at 2.2:1 it fails even the 3:1 large-text minimum.) Champagne is used only for decoration, never for text you need to read.

## New token set (`@theme` in `app/globals.css`)
Replace the current tokens with role-based ones and update every usage (the current names are `ground`, `raised`, `line`, `ink`, `muted`, `champagne`, `gold`):
```
--color-ivory:      #F4F0E8   /* page ground, product + editorial sections */
--color-ivory-deep: #EAE3D6   /* raised sections: steps, testimonials; the cursor-reveal "damp paper" */
--color-burgundy:   #511F2A   /* signature: primary buttons, key headings accents, links, brand blocks */
--color-burgundy-2: #6B2A38   /* burgundy hover/pressed */
--color-champagne:  #B8A27A   /* decorative: hairlines, numerals, sparkle, loader bar, stamp */
--color-platinum:   #A5A29D   /* non-text: dividers, details */
--color-platinum-2: #63605B   /* small secondary text */
--color-ink:        #241519   /* body text + headings */
--color-line:       #DDD5C7   /* default borders */
```
Keep the fine paper grain, recoloured to suit the ivory.

## Where each colour goes
- **Ground:** Warm Ivory everywhere, including behind the stone cut-outs. Check that the product photos' beige backdrops still fade cleanly into ivory; adjust the stone masks if a rim shows.
- **Text:** headings and body in Ink. Captions, spec labels, the price currency and footer small print in Platinum Deep.
- **Burgundy, the signature. Use it deliberately, not everywhere:**
  - Primary buttons: burgundy fill, ivory text. Hover: burgundy-2.
  - Secondary buttons: burgundy 1 px outline, burgundy text. Hover: burgundy fill, ivory text.
  - Text links and the header's "Sell your diamond": burgundy with a champagne underline.
  - The hero headline's small italic words ("Buy", "or") in burgundy; the capitals stay Ink.
  - One full-bleed **burgundy block** per page for emphasis: the closing "Thinking of selling?" section, with ivory text, a champagne hairline, and an ivory primary button with burgundy text.
  - Cart/wishlist count badges: burgundy with ivory numbers.
  - Focus rings: 2 px burgundy with a 3 px offset.
- **Champagne, decorative only:**
  - the large step numerals in "How selling works" and its progress line,
  - hairlines under section headings,
  - the loader's progress hairline,
  - the embossed stamp and the plotting-drawing accents in the cursor reveal,
  - the logo's gold diamond mark (unchanged artwork),
  - the stones' soft glow on hover.
- **Soft Platinum:** dividers between sections (with `line`), inactive currency and language chips, icons in the header, the "shown to scale" caption stays Platinum Deep.

## Specific components
- **Header:** transparent over the hero, then ivory at 92% with a blur and a `line` border when scrolled. Icons in Ink, hover burgundy. The logo lettering changes from ink to **Deep Burgundy**: edit a copy of `public/brand/logo-ink.svg` into `logo-burgundy.svg` by recolouring the `fill` of the wordmark paths, and keep the gold mark.
- **Menu overlay:** ivory. Large menu links in Ink, hover burgundy, group labels in Platinum Deep.
- **Cursor reveal:**
  - **Top surface:** Warm Ivory (update the shader's base colour and grain).
  - **Hidden layer:** Ivory Deep.
  - **Graphite lines:** Ink at 70%.
  - **Stamp:** champagne emboss.
  - **Valuation slip:** its "Offer" rule and title in burgundy.
- **3D diamonds:** unchanged. Their shadow is tinted `rgb(81 31 42 / 0.18)` (burgundy) instead of brown.
- **How selling works:** Ivory Deep ground, champagne numerals, active step in Ink, inactive steps in Platinum Deep.
- **Product cards:**
  - **Frame and text:** image frame `line`, name in Ink, specs labels in Platinum Deep and values in Ink.
  - **Price:** Ink, semibold.
  - **"Add to cart":** burgundy.
  - **Wishlist heart:** burgundy when saved.
- **Testimonials:** Ivory Deep, quotes in Ink, name in Platinum Deep, and a slider line that's champagne when active.
- **Forms:**
  - **Fields:** ivory lightened 50% with white, a `line` border, and a burgundy border on focus.
  - **Status:** messages in burgundy.
  - **Checkbox:** accent burgundy.
- **Loader:** ivory paper with Ink percentage, a champagne hairline filling, and the gold mark unchanged.
- **Cookie banner:** Ivory Deep with a `line` ring, burgundy primary button.
- **Footer (layout locked):** Ivory Deep background, headings in Ink, links in Platinum Deep with hover burgundy, a champagne hairline above the bottom row, active language/currency chips outlined in burgundy.

## Rules
- **Burgundy is the one strong colour.** Apart from the single full-bleed block, it appears as small, deliberate touches: buttons, links, badges, the two italic hero words. Don't tint whole sections burgundy beyond that one closing block.
- **No new gradients** except the existing grain and the subtle light in the hero shader.
- **Contrast:** every text/background pair must pass WCAG AA (4.5:1 normal, 3:1 large). Verify with a quick script that computes the ratios for each pair used, and list the results.
- **Metadata:** update `theme-color` in the layout metadata to Warm Ivory and the favicon's gold on ivory.
- **Scope:** don't change copy, layout, spacing or animation timing. Only colour, and the emphasis choices listed above.

## Done when
- The homepage, menu, loader, quick view, cookie banner and footer all use only the tokens above.
- `grep` finds no leftover old tokens (`ground`, `raised`, `muted`, `gold`) or raw hex colours outside `globals.css` and the SVG assets.
- Contrast checks pass. Screenshots at 1440 px and 390 px show burgundy as a confident but sparing accent on warm ivory.
