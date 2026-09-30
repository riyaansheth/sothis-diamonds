# Homepage: a seamless transition from the opening stone to the Buy | Sell choice

## The problem
Today the opening ("Every diamond has a story") is a pinned section 200vh tall. Scrolling scrubs the camera into the stone, then the opening fades out over the choice, which sits underneath it.

It still *feels* like scrolling:
- **The page moves:** the scrollbar moves the whole way, and the last part of the fade happens while the pin is releasing, so the choice slides up into place.
- **Speed follows the wheel:** the zoom rate depends on how fast the visitor scrolls. A fast flick skips the dive, and a slow trackpad drags it out.
- **No clear end:** the visitor can stop halfway, with a half-faded stone over a half-visible choice.

## The goal
It should feel like a **scene cut in a film**, not a scrolled page: one scroll gesture on the opening plays the whole transition on its own, and the visitor lands on the Buy | Sell choice, fixed and full-screen, with no visible sliding.

## Approach: a gesture-triggered transition (recommended)
1. **At rest:** the opening fills the screen, and page scrolling is held (the same lock technique as the loader) while the opening is shown.
2. **The trigger:** the first downward intent starts the transition. That can be the mouse wheel, a trackpad swipe, a touch swipe up, or the Page Down, arrow-down or space keys. The scroll cue at the bottom also becomes a button that triggers it.
3. **The transition plays on its own clock:** about 1.4s, eased, identical every time whatever the scroll speed.
   1. **0–0.9s:** the camera dives into the stone. It scales from 1 to about 4.5× with its slight turn, as now, and brightens as it passes the table.
   2. **0.6–1.3s:** the stone's light dissolves into the choice. The choice is already in its final place underneath, full screen, so nothing moves; the opening simply becomes transparent.
   3. **1.1–1.4s:** the Buy and Sell 3D stones and text settle in, a small fade of about 8px.
4. **Arrival:**
   - The page is instantly at the choice's position (set before the fade finishes, invisibly, under the opening), and the lock releases.
   - From here the page scrolls normally.
   - The header switches from clear to glass as today.
5. **Going back:** scrolling or swiping up while at the very top of the choice plays the same transition in reverse (1.2s), back to the opening.

**Guarding the gesture:**
- A trackpad sends a stream of wheel events, so the first event triggers the transition. The rest are swallowed until it finishes, plus about 300ms, so the momentum doesn't carry the visitor past the choice.
- **Reduced motion:** there's no dive. The first scroll crossfades in 300ms, or with no motion at all the page just scrolls normally.

**Layout:**
- The opening becomes a fixed full-screen layer over the choice while it's active, instead of a 200vh scroll section.
- The page no longer has 100vh of empty scroll height for the pin, so the scrollbar doesn't move during the transition.

## Alternative: keep scroll-scrubbing but hide the movement
- Keep the scroll-driven dive, but pin the choice inside the same stage, so it never slides up.
- After the fade, hold the stage pinned a little longer before the page scrolls on.

This is simpler, but the speed still follows the wheel and the visitor can stop halfway. It is not recommended if the goal is "I don't want to see it scrolling".

## What stays the same
- **Unchanged pieces:**
  - the loader's handover to the opening stone,
  - the opening's look (burgundy light, stone and headline),
  - the choice design, and Buy or Sell opening their journeys.
- **Mobile:** it uses the same trigger on a swipe up, with a lighter dive (up to 3×).
- **SEO and no-JavaScript:** the opening and the choice are both in the HTML. Without JavaScript the page simply scrolls from one to the other.

## Checks
- `tsc` and `eslint` are clean, and a production build passes.
- **Desktop:**
  - One wheel notch plays the full transition in about 1.4s, at the same speed whether the scroll was slow or fast.
  - No sliding is visible, and the scrollbar doesn't move during the dive.
  - Trackpad momentum doesn't skip past the choice.
  - Scrolling up at the top of the choice returns to the opening.
  - The Page Down, space and arrow keys work.
- **Mobile at 390px:** a swipe up triggers the transition, and there is no horizontal overflow.
- **Reduced motion:** a quick crossfade, or none.
- Commit, push, and deploy to the test site.

## Question
Should going back up (scrolling up at the top of the choice) replay the transition in reverse to the opening, or should the opening be shown only once per visit? [Default: reverse back to the opening.]
