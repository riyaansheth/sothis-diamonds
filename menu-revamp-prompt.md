# Menu revamp: from a wall of links to a guided, cinematic menu

## What's wrong today
- **Everything shouts equally:** three columns of huge serif words (Diamonds, Coloured stones, Watches…), and "Diamonds" appears twice at the same size, so it's unclear which is which.
- **No visual hierarchy or story:** Resources is a long list of SEO page names, and About, Contact and Blog float at the bottom right.
- **The page is flat black:** no imagery and no brand atmosphere, unlike the rest of the site.
- **"Close"** is a boxed button that looks like a form control.

## The new menu
A full-screen overlay in two parts: **navigation on the left, a live preview on the right**.

### Layout (desktop)
```
┌──────────────────────────────────────────────────────────────────────────┐
│ SOTHIS logo                                              ✕  (thin cross) │
│                                                                          │
│  ┌ Sell ─────────┐ ┌ Buy ──────────┐       ┌────────────────────────┐    │
│  │  (tab)        │ │  (tab)        │       │                        │    │
│  └───────────────┘ └───────────────┘       │     PREVIEW PANEL      │    │
│                                            │  (image of the hovered │    │
│   01  Diamonds                             │   item, on silk, with  │    │
│   02  Coloured stones                      │   one line about it)   │    │
│   03  Watches                              │                        │    │
│   04  Antique jewellery                    │                        │    │
│   05  Other jewellery                      └────────────────────────┘    │
│                                                                          │
│   Guides ·  Calculator ·  Free valuation in Belgium ·  More guides →     │
│   ───────────────────────────────────────────────────────────────────    │
│   About   Contact   Blog          info@… · +32…    EN FR NL…   USD EUR   │
└──────────────────────────────────────────────────────────────────────────┘
```

**1. Sell / Buy switch at the top.**
- Two large serif tabs, "Sell" and "Buy", mirroring the homepage choice.
- **Sell tab (default):** the five sell categories, numbered 01–05.
- **Buy tab:** Diamonds, Jewellery and Other gemstones, plus "Shop by shape" as a row of the 8 small shape outlines (from the homepage tiles).
- **Default tab:** it opens on the tab matching the page you're on (a sell page opens Sell, the shop or a product opens Buy); otherwise Sell.
- **One size:** the list shows only one tab's items at a time, one size, one column, so nothing is duplicated.

**2. The preview panel (right, about 40% width).**
- **Content:** hovering or focusing a link shows a matching image on the burgundy or black silk, the same halves as the homepage choice.
  - Diamonds shows a studio stone, Watches a watch-face line drawing, Jewellery a ring photo, and so on, all using existing media and no generated images.
  - Each preview comes with one line of copy from the dictionary (for example "Loose and certified diamonds of any size.").
- **Transition:** the image crossfades (400ms) with a slight scale from 1.04 to 1. The line under it types in or fades.
- **At rest (nothing hovered):** the 3D stone of the active tab turns slowly, the white round for Sell and the lilac asscher for Buy.

**3. Guides row.** The eight SEO guide pages become a single compact row of pills under the list:
- the 3 most useful (Valuation calculator, Free valuation in Belgium, Sell an engagement ring),
- then "All guides →", which expands the rest inline.

**4. Footer strip.**
- **Company links:** About, Contact and Blog in medium sans, not giant serif.
- **Contact details:** email and both phone numbers, linked to mail and call.
- **Settings:** the language links and the USD / EUR switch, as now.

### Animation
- **Opening:**
  1. The overlay wipes down from the top (clip-path, 500ms).
  2. The silk backdrop fades in behind a dark scrim.
  3. The list items rise in one after another, 50ms apart, using the site's line-reveal.
  4. The preview panel fades in last.
- **Hovering a link:**
  - The number turns white and the name shifts 10px to the right, while the other links dim to 45% (the same pattern as "Sell with confidence").
  - A thin line draws under the hovered name.
- **Switching tabs:** the list crossfades and slides slightly sideways in the direction of the tab, and the preview stone swaps.
- **Closing:**
  - Everything reverses in 350ms. The close control is a thin "✕" that rotates 90° on hover.
  - Escape and clicking a link also close it.
- **Reduced motion:** no wipe, slide or stone spin, only fades.

### Mobile
- **Full screen:** the tabs sit at the top and the list is full width in large serif, one column.
- **No preview panel:** instead, a small thumbnail sits beside each item.
- **Guides:** collapse into an accordion.
- **Footer strip:** stacks, and the language and currency pills wrap.
- **Scrolling:** the overlay body scrolls on its own, and the page behind stays locked.

### Accessibility
- **Dialog:** the menu stays a native `<dialog>` with a focus trap and restores focus to the Menu button on close.
- **Tabs:** they're real `tablist`/`tab` controls with arrow-key support.
- **Preview:** it's decorative (`aria-hidden`), and all the information is in the links themselves.

## Content
- **Links:** every link and label comes from the existing dictionary (`nav.*`, `sell.categories` descriptions, `buy`). Only the tab labels and "All guides" are new keys.
- **Routes:** no changes.

## Checks
- `tsc` and `eslint` are clean, and a production build passes.
- **Desktop:**
  - The menu opens with the wipe and staggered items.
  - The tabs switch.
  - Hover shows the preview and the matching line.
  - The guides expand.
  - Escape closes it and focus returns to Menu.
- **Mobile at 390px:** usable, with no horizontal overflow, and the body scroll is locked.
- **Six languages:** they work.
- Commit, push, and deploy to the test site.

## Questions (defaults in brackets)
1. **Buy tab:** show the shape outlines row in the Buy tab? [Yes.]
2. **At rest:** should the preview show the turning 3D stone, or a still photo (lighter on older phones)? [3D stone on desktop, still photo on mobile.]
