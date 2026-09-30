# Shop by shape: coloured gems with animation

## Goal
The eight shape tiles (Round, Pear, Radiant, Cushion, Heart, Oval, Emerald, Asscher) are thin white outlines today. Each becomes a small, faceted **coloured gem** that feels alive, still in the site's fine-line style, not clip-art.

## The gems
**Colours:** each shape gets a gem colour that suits it and matches stones in the real inventory (fancy yellow, fancy brown and white diamonds are in stock; ruby and emerald appear in the jewellery).

| Shape | Colour | Hex |
|---|---|---|
| Round | White diamond (icy silver) | #e9eef5 |
| Pear | Fancy yellow | #f2c94c |
| Radiant | Champagne / cognac | #c9a27a |
| Cushion | Sapphire blue | #3f6fd8 |
| Heart | Ruby | #d23a55 |
| Oval | Emerald green | #2fa37a |
| Emerald | Aquamarine | #7fd0d6 |
| Asscher | Lilac (the Buy stone) | #d4b9cb |

**Drawing:** SVG, built from the existing outlines, with no images.
- Outer girdle, table and inner facets, with facet lines drawn in the gem colour.
- Each facet band filled with the gem colour at different opacities (a lighter table, darker pavilion edges), so it reads as cut stone.
- A soft radial glow of the gem's colour behind it on the obsidian tile (low opacity), so each tile has its own light.

## Animation
1. **Entrance (on first view):**
   1. Outlines draw themselves as now.
   2. Then the colour fills in from the table outwards (facet opacity animates up over 600ms, staggered 60ms per tile).
   3. Then one sparkle glint crosses each gem.
2. **Idle:**
   - A very slow shimmer: a thin light band sweeps across each gem every 6–8s, with an offset per tile so they never shimmer together.
   - A gentle 2px float.
   - Subtle enough to read as light moving, not blinking.
3. **Hover or focus:**
   - The gem rotates 12° and scales up 1.08.
   - Its glow brightens and widens, and a quick sparkle flares on the table.
   - The shape name tints to the gem colour (the one place colour touches text, as a hover state).
   - The viewfinder corners close in, as now.
4. **Click:** the gem does a short 180ms press-in before navigating to the filtered shop.
5. **Reduced motion:** gems are shown fully coloured and static, with no shimmer, float or sparkle.

## Performance
- **Transform and opacity only:** the shimmer is a translated gradient masked by the gem shape, and the glow is an opacity change.
- **No WebGL** and no per-frame JavaScript.
- **Pause off screen:** the idle shimmer pauses when the section is off screen (`animation-play-state` via the existing `data-shown` / an IntersectionObserver).

## Checks
- `tsc` and `eslint` are clean, and a production build passes.
- **Desktop:** the entrance sequence plays, the idle shimmer is staggered, and hover works on each tile.
- **Mobile, 2 per row:** the tiles are readable, with no horizontal overflow.
- **Reduced motion:** static coloured gems.
- Commit, push, and deploy to the test site.

## Question
Are the colours in the table right, or should Round and Emerald stay white diamonds, with colour only on the shapes that are coloured in stock (Pear, Radiant and Heart)? [Default: the table above.]
