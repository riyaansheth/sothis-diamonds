# Homepage as a choice: Sell reveals the selling journey, Buy goes to the shop

## Goal
The Sell / Buy split becomes the homepage's opening screen. Nothing else is visible until the visitor chooses:
- **Sell:** the page reveals the selling sections below it and glides the visitor into them.
- **Buy:** go straight to the shop (`/shop/`, localised). For now, a dedicated buying journey comes later.

## Starting screen
- Use the existing section 2 ("Two ways in"): both halves, their 3D stones, satin backgrounds, the hover-widening and sheen. It fills the viewport below the header (`min-h-[calc(100dvh-5rem)]`).
- **Remove the current hero** (section 1: "Buy DIAMONDS or SELL YOURS", intro and buttons). The split *is* the hero now.
  - Keep one `<h1>` on the page for SEO, visually hidden: "Buy diamonds or sell yours in Antwerp".
  - Keep the page's `<title>` and meta description as they are.
- **Loader:** it waits for the hero; check it still finishes, now that the first visible content is the two 3D stones (`sothis:stone-ready`), with the 9s bailout unchanged.
- Each half is a `<button>` for Sell (it changes the page) and a `<Link>` for Buy (it navigates).
  - Sell's call to action becomes "See how selling works". Buy's stays "Explore the collection".
  - Both labels come from the dictionary.

## Sell: the reveal
The sections after the split, in this order, form the **selling journey**:
3. Sell with confidence (what we buy)
4. How selling works (the pinned 3D steps)
5. Quick valuation
7. Our story
8. Why Sothis
9. Testimonials
12. Closing call to action

The **buying sections** are hidden from this page for now, as they belong to the future buying journey:
- 6. The collection rail
- 10. Gallery
They stay in the code, since the buying journey will reuse them.

**11. Newsletter:** keep it after the journey, just before the closing block.

**Motion on click (about 1.2s total, one orchestrated moment):**
1. The Sell half widens to fill the screen (the existing `flex-grow` transition), while the Buy half fades and narrows away.
2. The Sell stone lifts slightly. The Sell headline stays; the body text crossfades to a short line: "Here's how selling to us works."
3. The journey sections are already rendered and simply become visible: height from 0 to auto, with `content-visibility`, and opacity 0 to 1.
4. The page smooth-scrolls to "Sell with confidence".
5. Focus moves to that section's heading, for keyboard and screen-reader users.

**After the reveal:**
- The split collapses to a slim band at the top (about 40vh) showing only the Sell side.
- A small "Buying instead? Explore the collection" link appears in the band, so the visitor can still switch.

**Reduced motion:** there is no widening or scrolling animation. The sections appear instantly and the page jumps to them.

## State and URLs
- Sell adds `#sell` to the URL (via `history.replaceState`). This makes the revealed state shareable and supports going "back".
- Loading `/#sell` directly (from ads, emails, or the header's "Sell your diamond"?) opens with the journey already revealed and the split collapsed.
- Pressing browser Back after the reveal returns to the untouched split, not to the previous website.
- The header's "Sell your diamond" link keeps pointing to `/sell-diamond/` (the full sell page with the form). The homepage reveal is the story; the sell page is the action.

## What must not break
- **SEO:** the selling sections must stay in the server-rendered HTML, hidden only visually until Sell is chosen.
  - Use `hidden="until-found"` on the wrapper. The browser's find-in-page and search engines still see the content, and it reveals itself if matched.
  - Fallback for browsers without `until-found`: a `data-revealed` attribute on the wrapper toggles a `grid-template-rows: 0fr → 1fr` transition.
- **Without JavaScript:** the journey is visible (no-JS gets the full page), because the hiding is applied by a tiny inline script before paint.
- **The steps section's pinned scroll:** it measures on scroll, so it must measure correctly after the reveal. Recalculate sizes when the section becomes visible, e.g. by dispatching a `resize` event after the reveal ends.
- **3D canvases:** these use IntersectionObserver lazy-loading. Hidden sections must not load WebGL until revealed.
- **Anchor links:** existing links elsewhere pointing into homepage sections (if any) should reveal the journey first.
- **The locked footer:** it is untouched and always visible.
- **Other languages:** all six keep working, using the same component and dictionary keys.

## Mobile
- The split stacks vertically. Each half is about 50vh, so both choices are visible without scrolling.
- Tapping Sell uses the same reveal, without the widening: the Buy half collapses upward and the page scrolls to the journey.

## Implementation notes
- Create a small client component `HomeChoice` that wraps section 2 and the journey. Sections stay server components passed in as children, so the page's HTML stays server-rendered.
- There is no new dependency; use CSS transitions and the existing Motion helpers.
- Dictionary: add `home.choice` keys for the new labels (Sell call to action, the "Here's how selling works" line, the "Buying instead?" link).

## Checks before done
- `tsc` and `eslint` are clean, and a production build passes.
- **Desktop at 1440px:**
  - The first screen shows only the split.
  - Clicking Sell reveals the journey and scrolls to it.
  - The steps section pins and animates correctly.
  - Back restores the split.
  - Clicking Buy goes to `/shop/`.
- **Other checks:**
  - Loading `/#sell` directly opens with the journey revealed.
  - At 390px mobile there is no horizontal overflow.
  - With reduced motion there are no animations.
  - With JavaScript off, all content is visible.
  - The French homepage uses its French URLs and text.
- Commit, push, and deploy to the test site with `/srv/sothis/deploy.sh`.

## Open questions for you
1. ~~Buy's link~~ **Decided:** the full shop (`/shop/`) for now; it will be redirected later.
2. **After the reveal,** keep the "Buying instead?" link, or leave the collapsed band with Sell only?
3. **Collection and gallery:** hide them from the homepage now, as planned above, or keep them at the end of the selling journey until the buying journey exists?
