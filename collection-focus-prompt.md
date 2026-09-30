# The collection rail: a focused centre card with step-by-step Next / Previous

## Where
The Buy journey's "The collection" rail on the homepage (`components/buy/CollectionStage.tsx`). The shop page and other rails are unchanged.

## Problem
Today Next and Previous scroll the rail by 80% of its width, so a whole row of cards jumps past at once. No card is the main one.

## New behaviour
**One focused card, in the centre:**
- The rail becomes a centred carousel.
- The focused card sits in the middle of the screen at about 1.12× scale, fully bright.
- Its neighbours sit either side at 1× scale and slightly dimmed (about 55% opacity), with their prices and buttons faded.
- One neighbour shows on each side on desktop, partially cut off at the edges, which signals there's more.

**Next and Previous:**
- Each click moves the focus by exactly one card. The next card slides into the centre and takes over the larger size, and the previous focus shrinks back to a neighbour.
- Motion: about 600ms with the site's ease (`cubic-bezier(0.2, 0.7, 0.2, 1)`). Only `transform` and `opacity` animate, so it stays smooth.
- **At the ends:** Previous is disabled on the first card and Next on the last. The rail does not loop back.
- **Keyboard:** the left and right arrow keys do the same when the rail has focus.
- **Direct choice:** clicking a neighbour card's image focuses it. A second click on the focused card opens the product, as now.

**Other ways to move:**
- **Trackpad, touch swipe and scrollbar:** they still scroll natively.
  - The rail snaps to the nearest card, centred (`scroll-snap-align: center`).
  - Whichever card ends up in the centre becomes the focused one, tracked with an IntersectionObserver on the rail's centre line.
- **Progress line:** it now shows the focused card's position, e.g. 3 of 77, rather than the scroll distance.
- **Counter:** a small "03 / 77" counter sits beside the buttons, in Bodoni numerals.

**Filtering:** choosing a chip resets the focus to the first card of the filtered set, which rises in as now.

## Mobile
- **Layout:** the focused card fills about 78% of the width with a sliver of each neighbour visible; the focus scale is smaller (1.05×).
- **Controls:** swipe moves one card, snapping to centre, and the buttons work the same.

## Reduced motion
There is no scale animation: the focused card changes instantly and the neighbours stay at full opacity.

## Checks
- `tsc` and `eslint` are clean, and a production build passes.
- **Desktop:**
  - Next moves exactly one card, and the new centre card is the larger one.
  - Previous and Next disable at the ends.
  - The arrow keys work.
  - Clicking a neighbour focuses it.
  - Filters reset to the first card.
- **Mobile at 390px:** swipe snaps one card, and there is no horizontal overflow.
- Commit, push, and deploy to the test site.

## Question
You mentioned "the next 2 products". The plan above moves **one card per click**, so the next product replaces the focused one. Should each click move two cards instead? [Default: one.]
