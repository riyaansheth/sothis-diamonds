# Move the "Every diamond has a story" opening from About to the homepage

## Goal
The cinematic opening currently at the top of the About page becomes the first thing a visitor sees on the **homepage**:
- the burgundy light backdrop,
- the stone revealed by a narrow light,
- the headline rising word by word,
- scrolling moving the camera through the stone.

The **About page** then starts at its next chapter, "Rooted in Antwerp".

## Homepage: new order
1. **Opening** (moved from About): "Every diamond has a story."
2. **The Sell / Buy choice** (as built: Sell reveals the selling journey, Buy goes to the shop)
3. **The selling journey**, still hidden until Sell is chosen

**Changes to the opening on the homepage:**
- **Copy:** the About version says "Discover the heritage, expertise and philosophy behind Sothis Diamonds." On the homepage that becomes a line pointing to the choice below: "Antwerp diamonds, bought and sold with care." The headline "Every diamond has a story." stays.
- **Heading level:** the headline becomes the page's `<h1>`, replacing the hidden "Buy diamonds or sell yours" heading. The `<title>` and meta description are unchanged.
- **No breadcrumbs:** it's the homepage.
- **The scroll transition ends in the choice:**
  - On About, the camera passes through the stone and fades to ivory, leading into the Antwerp chapter.
  - On the homepage it fades to the Sell / Buy satin instead, and the choice comes straight after.
- **The scroll cue** ("Scroll") stays, pointing down to the choice.
- **Pinned length:** on desktop, the pinned scroll drops from 260vh to about 200vh, so the choice isn't far away.

## Header on the homepage
- **Over the dark opening:** the header is transparent, with ivory text and the white-lettering logo. This is the same behaviour About has now, using `data-header="clear"` on the page and `data-header-dark` on the opening.
- **Once past the opening:** the header goes back to the normal glass header over the ivory sections, which the existing logic already handles.
- **Loader:** it currently waits for the two 3D stones in the first screen. It should now wait for the opening's stone image, and still count the 3D stones as they load. The 9s bailout is unchanged.

## About page: starts at chapter 02
- **Removed:** the Opening chapter.
- **New top of the page:** the Heritage chapter ("Rooted in Antwerp.") starts the page below the normal glass header, with the breadcrumbs above it.
- **Heading level:** the page's `<h1>` becomes "Rooted in Antwerp." (currently a decorative big title plus an `h2`).
  - Make the large centred headline in Heritage the real `h1`, visible on all widths.
  - Remove the duplicate mobile-only "Rooted in Antwerp." line.
- **Header:** the About page no longer needs the clear header, because the page no longer opens on a dark image. Remove `data-header="clear"` from About.

## Reuse, not copies
- `components/about/Opening.tsx` becomes a shared component: `components/Opening.tsx`.
- It gains props for what differs between pages:
  - the supporting line,
  - the colour the scroll dissolves into,
  - the pinned height,
  - optional breadcrumbs,
  - the heading level.
- The About page stops importing it.

## What must not break
- **The homepage choice:**
  - `#sell` links still open the journey, and Back still returns to the choice.
  - After Sell, the page scrolls to the journey. The opening stays above it, so scrolling up still shows the opening.
- **The steps section:** it still pins correctly, since the page above it is now taller.
- **Mobile:** no pinning; the opening is one screen tall with the stone and headline, and there is no horizontal overflow.
- **Reduced motion:** there is no light sweep or camera move, only a static composition.
- **SEO:** each page keeps exactly one `h1`.
- **Other languages:** all six keep working, with the new text in the dictionary.

## Checks before done
- `tsc` and `eslint` are clean, and a production build passes.
- **Desktop at 1440px:**
  - The homepage opens on the opening, and scrolling through it arrives at the choice.
  - Sell reveals the journey and Buy goes to the shop.
  - The About page starts at "Rooted in Antwerp".
- **Other checks:**
  - At 390px mobile, both pages work without horizontal overflow.
  - With reduced motion, there are no animations.
- Commit, push, and deploy to the test site.

## Defaults used for open questions
- **Homepage supporting line:** "Antwerp diamonds, bought and sold with care." (it replaces the About-specific line). This can be changed in the dictionary.
- **About:** it starts directly with Heritage, with no new intro added.
- **Homepage opening:** it plays in full on every visit, like the loader, rather than only on the first.
