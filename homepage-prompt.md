# Homepage prompt — Sothis Diamonds

Build the homepage for **Sothis Diamonds**, an Antwerp diamond house that buys diamonds, coloured stones, watches, antique and other jewellery from private sellers across Europe, and sells certified diamonds and fine jewellery online.

## Tech
- Next.js (App Router) + TypeScript + Tailwind CSS. No WordPress, no page builders.
- Fully responsive (mobile first), accessible (semantic HTML, alt text, focus states, keyboard nav, `prefers-reduced-motion` respected).
- All text comes from a translation dictionary (EN default; FR, NL, DE, IT, ES). No hard-coded copy in components.
- Prices come from data in USD with a USD/EUR toggle.
- Lighthouse 90+ on mobile: optimised images (next/image), lazy video, no heavy libraries.

## Design direction
Dark, quiet luxury, in the spirit of groupetache.com (editorial, lots of space, one idea per screen) but with its own identity.
- Background near-black `#0A0A0A`, surfaces `#141414`, hairline dividers `#262626`.
- Text off-white `#F2EFEA`, secondary `#A8A29E`.
- One accent only: champagne gold `#C9A96E`. Use it for primary buttons and small details, nowhere else.
- Typography: an elegant display serif for headings (e.g. Cormorant Garamond, light weight, large sizes) and a clean sans for body/UI (e.g. Manrope). Generous line height, wide letter-spacing on small uppercase labels.
- Imagery: product images come only from the old site's exported media (see "Data source"). They're light/beige-background shots, so show them inside contained cards (subtle rounded frame, soft shadow) rather than bleeding into the black page. Where a product has a 360° video, the video plays on hover (cards) or leads the gallery (product page). No stock photos of people.
- Motion: subtle fade/slide-up on scroll, slow video loops, gentle hover states. Nothing flashy.
- Buttons: primary = gold fill with dark text; secondary = thin off-white outline.

## Data source
All product data and media come from the old website export in `export/`:
- `export/data/products.json`: 84 products (title, slug, sku, price in USD, stock, specs, attributes, categories, translated slugs, SEO).
- Each product's `image` (main image), `gallery` (extra images) and `video` fields are paths into `export/media/` (e.g. `media/2025/09/Gemini_Generated_Image_….png`). Use exactly these files for that product; don't substitute other images or generate new ones.
- Copy the files the site uses into `public/media/` at the same relative paths (or load them from there), so `image: "media/2025/09/x.png"` is served at `/media/2025/09/x.png`.
- Look products up by title/sku from this file for the featured stones below; never hard-code image URLs.

## Global elements
**Header (sticky, transparent over the hero, turns solid black on scroll)**
- Left: Sothis Diamonds logo.
- Right: `Sell your diamond` (primary gold button) · `Shop` · account icon · wishlist icon · cart icon with count · `Menu`.
- `Menu` opens a full-screen black overlay with:
  - Sell to Us → Diamonds · Coloured stones · Watches · Antique jewellery · Other jewellery
  - Buy from Us → Diamonds · Jewellery · Other gemstones
  - Resources → Sell an engagement ring · Sell a diamond ring · Free valuation in Belgium · Valuation calculator · Sell your diamond in Belgium · Sell without a certificate · Sell a loose diamond · Sell diamond jewellery
  - About · Contact · Blog
  - Bottom of overlay: email info@sothisdiamonds.com, phones +32 470 78 12 19 and +32 477 41 85 68, language switcher (EN FR NL DE IT ES), currency switcher (USD / EUR).

**Floating elements:** live chat bubble (Tawk.to embed slot, bottom right) and a cookie consent banner (Accept / Settings, link to cookie policy).

## Homepage sections (in this order)

1. **Hero**: full-screen. A slow looping video of a diamond turning, on black, with a dark gradient for legibility.
   - Small label: `ANTWERP · SINCE [YEAR]`
   - H1: "Europe's trusted diamond & jewellery buyers"
   - Subline: "Honest valuations, top market value and fully insured shipping, from Antwerp's diamond district."
   - Buttons: `Get a free valuation` (primary) · `Explore the collection` (secondary)
   - Trust strip under the buttons: `Free valuation · No commission · Insured FedEx/DHL pickup · Fast payment`

2. **Sell with confidence**: two columns. Left: short story ("We buy diamonds, coloured stones, watches, antique and designer jewellery. Every piece is assessed by certified gemmologists and you get a clear offer, with no obligation."). Right: 5 elegant tiles linking to the sell pages: Diamonds · Coloured stones · Watches · Antique jewellery · Other jewellery.

3. **How it works**: 6 numbered steps on a horizontal line (vertical on mobile): Submit your piece → Expert review → Receive an offer → Accept & send (free insured pickup) → Inspection & verification → Fast payment. Button: `Start your valuation`.

4. **Quick valuation**: an inline mini form (step 1 of the full valuation flow): What are you selling? (dropdown: Diamond, Coloured diamond, Ring, Necklace, Bracelet, Earrings, Watch, Other) + approximate carat/weight + email → `Continue`. Takes the user to the full valuation page with these values pre-filled.

5. **Exceptional stones**: 4 featured stones: the product's own `image` from `products.json` (its `video` plays on hover when it has one), name, key specs, price, wishlist, quick view, compare, add to cart. Use these real items:
   - ASSCHER 7.79ct Fancy Vivid Yellow Even VVS1: $599,836
   - RD 12.38ct E SI1: $382,702
   - RD 7.06ct F SI2: $71,758
   - CUSHION 2.02ct Fancy Intense Yellow Even VS2: $15,598
   Button: `View all diamonds`. Quick view opens a modal with video, specs and add to cart.

6. **Our story**: full-width editorial block with a large image on one side. "Explore the exclusive collections." A family business in Antwerp, specialists in diamonds, pearls, vintage pieces and coloured gemstones. "We give new life to old jewellery through refurbishment and reuse." Button: `About us`.

7. **Why Sothis**: 6 short points in a 3×2 grid with thin line icons (merges the old "selling points" and "why choose" sections):
   - Certified gemmologists with decades of experience
   - Free, transparent valuations
   - Top market offers, no middlemen or commission
   - Free, fully insured FedEx/DHL pickup
   - Quick valuations and fast payment
   - Authentic, certified diamonds and jewellery for sale

8. **Testimonials** ("Gems of praise"): a carousel of quotes in large serif:
   - "Good and straightforward service if you want to sell or buy a good gem. Highly recommended." — Mako Franz
   - "Sothis Diamonds offers flawless service — fast, simple, and highly recommended!" — Aklank Jain
   (Built to hold more reviews later, e.g. Google reviews.)

9. **Instagram**: "#ShineWithSothis". 6–9 square tiles in a grid linking to Instagram (data comes from a feed; show placeholders for now).

10. **Newsletter**: "Subscribe for exclusive offers & diamond news." Email field + `Subscribe` + consent checkbox (GDPR).

11. **Final call to action**: dark block with a large serif line: "Thinking of selling? Get an expert valuation, free and without obligation." Buttons: `Get a free valuation` · `Contact us`.

## Footer
- Logo + one-line tagline + short brand line.
- Address: Hoveniersstraat 2 / Bus 210, 2018 Antwerpen, Belgium (with map link). Phones: +32 470 78 12 19 · +32 477 41 85 68. Email: info@sothisdiamonds.com. Social icons.
- Columns: **Sell** (Diamonds, Coloured stones, Watches, Antique jewellery, Other jewellery) · **Shop** (Diamonds, Jewellery, Other gemstones) · **Resources** (Valuation calculator, Free valuation Belgium, Blog) · **Company** (About, Contact, Shipping policy, Refund & returns, Terms & conditions, Privacy policy, Cookie policy).
- Small "Recently added" strip of the 3 newest published products from `products.json`, with their own images.
- Language and currency switchers.
- Payment method logos (Mollie methods: Bancontact, iDEAL, cards, bank transfer).
- © [current year] Sothis Diamonds. All rights reserved.

## Content rules
- No placeholder text, "nan" values or empty sections in the final build. If data is missing, hide the field.
- Keep the "years in business" claim as a single variable `[YEAR]` until the client confirms it.
- SEO: one H1, proper H2/H3 structure, meta title "Sell & Buy Diamonds in Antwerp | Sothis Diamonds", meta description, Organization + LocalBusiness (JewelryStore) structured data, hreflang for all 6 languages.
