# Homepage fixes: Sell journey only after a click, Buy left / Sell right, smooth opening

## 1. The Sell band and journey appear only after clicking Sell
**Problem:** the collapsed "Sell · Here's how selling to us works" band and the selling sections show up without a click.
- **Why:** the address keeps `#sell` after someone chooses Sell. Reloading, sharing that link, or coming back later opens straight into the revealed state.

**Change:**
- **Every visit starts fresh:** a page load always opens on the opening, then the full Sell / Buy choice, regardless of `#sell` in the address.
- **Only a click reveals:** the band and the journey appear only when Sell is clicked in that visit.
- **Stop using the hash:**
  - Clicking Sell no longer adds `#sell`.
  - Revealed and collapsed is plain in-page state, so loading `/#sell` does nothing special.
  - If an old `#sell` link is opened, the hash is removed from the address on load with `history.replaceState`.
- **Browser Back:** the reveal no longer creates a history entry, so Back leaves the page as normal.
  - To offer a way back to the choice, the collapsed band gets a small "Change" (↺) control that restores the full choice and scrolls to it.

## 2. Swap the halves: Buy on the left, Sell on the right
- **Desktop:** Buy (yellow asscher stone, gold silk) on the left, Sell (white round stone, white silk) on the right. Each keeps its own stone, background, text and link; only the order changes.
- **Mobile, stacked:** Buy on top, Sell below, in the same order as desktop.
- **After clicking Sell:** Sell expands from the right to take the full width while Buy folds away to the left.
- **The collapsed band:**
  - It shows Sell with its stone on the left side of the band, the mirror of today.
  - "Sell · Here's how selling to us works" stays at the left edge of the text column for readability.
  - "Buying instead? Explore the collection" moves to the band's left corner, towards where Buy was.
- **Divider:** the champagne line between the halves moves with them.

## 3. The opening animation lags. Make it smooth
**Causes found in the code (each forces the browser to redraw large areas every frame while scrolling):**
- **Brightness filter:** `filter: brightness(...)` is animated on the stone while it's scaled up to 10×, so the browser redraws a huge filtered layer every frame.
- **Fixed background:** the burgundy backdrop uses `background-attachment: fixed` (`lg:bg-fixed`), which is repainted on every scroll step and is unnecessary inside a pinned (sticky) screen.
- **Light sweep blend mode:** the light sweep uses `mix-blend-mode: overlay` over the stone, adding another blended layer.
- **Oversized scaling:** the stone image is scaled from about 36rem up to 10×, far beyond its resolution, which is both heavy and soft.

**Fixes:**
1. **Brightness:** replace the animated `filter` with a white "light" layer over the stone whose **opacity** rises. Opacity is GPU-cheap and looks the same.
2. **Background:** remove `bg-fixed`. The pinned screen already keeps the backdrop still.
3. **Composited motion:** only `transform` and `opacity` change during scroll. Add `will-change: transform` to the stone while the opening is on screen, and remove it afterwards.
4. **Zoom:** reduce the maximum zoom from 10× to about 4.5×, and fade the opening out earlier, from about 70% through its scroll. The pass through the stone still reads, without the heaviest frames.
5. **Light sweep:** remove its `mix-blend-mode` and use a plain semi-transparent gradient. It only plays once on load anyway.
6. **Image source:** request a larger source for the stone (`sizes` set to about 60vw on desktop), so it stays crisp when enlarged instead of being upscaled.
7. **Scroll updates:** write the CSS variables only when the progress value has actually changed. Skip frames where it hasn't.

**Target:** a steady 60 fps while scrolling through the opening on a normal laptop, checked with the browser's performance recording (no long paint frames).

## What stays the same
- **The opening's content:** the burgundy backdrop, the light reveal on load, the headline rising word by word, and the header turning ivory over it.
- **The fade into the choice:** the opening still fades to reveal the real choice underneath (the earlier glitch fix).
- **Buy** still goes to the full shop.
- **The selling journey:** its content and order are unchanged.
- **Phones and reduced motion:** no pinning, as now.

## Checks before done
- `tsc` and `eslint` are clean, and a production build passes.
- **Loading the page:**
  - A fresh load shows the opening, then the full choice with Buy on the left and Sell on the right.
  - Loading `/#sell` shows the same, with nothing revealed.
- **Clicking the halves:**
  - Clicking Sell reveals the band and the journey. The band's "Change" control brings the choice back.
  - Clicking Buy goes to the shop.
- **Smoothness:** a performance recording while scrolling the opening shows no long frames.
- **Mobile at 390px:** there is no horizontal overflow, with Buy stacked above Sell.
- Commit, push, and deploy to the test site.

## Defaults used
- **Reload after clicking Sell:** it starts over at the choice, and nothing is remembered.
- **Collapsed band:** it gets a "Change" control.
- **Mobile order:** it follows desktop, with Buy first.
- **Zoom:** it is reduced to about 4.5×, for smoothness.
