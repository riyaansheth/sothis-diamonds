# Prompt: build the rest of the Sothis Diamonds site

Build every page other than the homepage for the new Sothis Diamonds site. The homepage is done and sets the standard. Read these before writing code:
- `app/[lang]/page.tsx`, `app/globals.css`, `components/*`
- `oldwebsiteuserflow.md`: every page and feature listed there must exist
- `node_modules/next/dist/docs/`: this is Next.js 16, which has breaking changes

## Ground rules (already decided, don't revisit)
- **No WordPress anywhere.** All content comes from the one-off export in `export/data/*.json`, read at build time. Media paths in the data (`media/...`) go through `mediaUrl()` in `lib/products.ts`.
- **Light design only** (no dark mode):
  - **Palette tokens** in `app/globals.css`: `ivory`, `ivory-deep`, `ink`, `platinum-2` (small secondary text), `line`, `burgundy` (accent text and links), `wine` (fills with `on-accent` text), `champagne` (decoration only, never text), `platinum` (non-text only).
  - **Fonts:** Bodoni Moda (display) and Manrope (text).
  - **Burgundy is used sparingly.**
  - **Buttons:** square-cornered `.btn .btn-primary / .btn-secondary`.
  - **Forms:** use the `.field` class.
- **The header and footer are shared** from `app/[lang]/layout.tsx`. **The footer is locked:** don't change its design.
- **Six languages:** en at `/`, fr/nl/de/it/es prefixed.
  - **Copy:** new UI text goes in `lib/dictionaries/en.ts` (other languages fall back to English for now).
  - **Migrated content:** has real translations in `export/data/translations_{fr,nl,de,it,es}.json` (original string → translated). Use them for that content where a string matches, and fall back to English otherwise.
- **Keep every old URL, including the translated ones.**
  - Old slugs are in each item's `slugs` field and in `export/data/old_urls.json` (1,584 URLs).
  - **Routing:** one catch-all route `app/[lang]/[...slug]/page.tsx` looks the path up in a route map built from the export (page, post, product, category, and their translated slugs) and renders the right template. Posts live at the root (`/can-you-sell-lab-grown-diamond/`), exactly like the old site.
  - Unknown paths return a styled 404.
  - `generateStaticParams` pre-renders every known URL in every language.
- **Reuse, don't rebuild:**
  - `ProductCard` (quick view, wishlist, compare, add to cart)
  - `StoneVideo`, `Diamond3DLazy`
  - `Store` (`useStore`, `Price`, `CurrencySwitch`)
  - `Forms` (`QuickValuation`, `Newsletter`)
  - `Motion` (`RevealHeading`, `InView`, `Rail`, `Quotes`)
  - `lib/products.ts` helpers (`displayName`, `keySpecs`, `diameterMm`, `mediaUrl`)
- **Motion vocabulary:** heading line-wipes on scroll, one orchestrated moment per page at most, hover responses. No scattered fade-ups. Everything respects `prefers-reduced-motion`.
- **Performance:**
  - **Static generation** everywhere possible.
  - **3D** is lazy-loaded and only renders while on screen.
  - **Canvases** are never resized by layout transitions.
  - **Images** go through `next/image` with real `sizes`.
  - **Target:** 60 fps at 2× DPR.
- **Content fixes** while migrating:
  - drop "nan" values,
  - no placeholder text (the old Contact FAQ had dummy answers: leave those out),
  - hide the empty "Other gemstones" category's grid and show a short "enquire" message instead,
  - the founding year stays a variable until the client confirms it (don't print "10+", "55+" or "since 1970"),
  - correct "Jewelery" to "Jewellery" in visible text (keep the old `/product-category/jewelery/` URL).

## Pages

### 1. Sell pages: one template, five pages
URLs: `/sell-diamond/`, `/sell-colored-stones/`, `/sell-watches/`, `/antique-jewellery/`, `/sell-other-jewellery/`. `/sell-your-diamond/` also exists in the export; keep it as the general "sell to us" page.
- **Order:** hero (title plus one line, specific to the item type) → **the valuation form** → how it works (the 6 steps, compact) → what we buy for this type → why Sothis (5 values: best value, trust, no middlemen, sustainable luxury, expertise) → FAQ → closing call to action.
- **Each type gets its own content and fields.** No copies of the same page:
  - **Diamonds:** carat, shape, colour, clarity, lab report (GIA/IGI/HRD/none)
  - **Coloured stones:** stone type, carat, origin if known, report
  - **Watches:** brand, model, reference, year, box and papers. **No carat question.**
  - **Antique jewellery:** type of piece, era if known, main stones, hallmarks
  - **Other jewellery:** type, metal, main stones, brand
- **The valuation form** is multi-step:
  1. what you're selling (pre-selected by the page),
  2. details (the type-specific fields above),
  3. photos (up to 7, drag and drop, previews, 10 MB each, jpg/png/heic),
  4. your details (name, email, phone, country, preferred contact).
  - It shows a progress bar, validates each step inline, and keeps the draft in `sessionStorage`.
  - It reads the homepage `QuickValuation` query params (`item`, `weight`, `email`) and pre-fills from them.
  - **Submission:** POST to a route handler `app/api/valuation/route.ts` that validates on the server (zod-free, plain checks) and returns a reference number. **Email delivery is not wired yet** (provider TBD): the handler validates and logs, and the success screen says "we'll contact you within 24 hours" only once delivery exists. Until then it clearly says the preview doesn't send anything. Leave one `// TODO(delivery)` at the send point.

### 2. Valuation calculator: `/diamond-valuation-calculator/`
- **Fields:** a guided version of the old long form:
  - item type,
  - carat,
  - natural or lab-grown,
  - colour (a D–Z scale with visual swatches),
  - clarity (FL–I3 with short plain-language descriptions),
  - cut, shape (with icons), condition, report,
  - up to 7 photos.
- **No invented prices.** The old page promised a price range, but there's no pricing data behind it. The button is "Get my expert-reviewed valuation" and it submits to the same valuation endpoint.
- **Beside the form:** a live summary card of the stone being described.
- **Below the form:** the old page's educational content (migrated from `pages.json` `content_html`, restyled).

### 3. Shop and categories
URLs: `/shop/`, `/product-category/diamonds/`, `/product-category/jewelery/` (label "Jewellery"), `/product-category/other-gemstones/` (empty: enquire message), plus tag pages only where they have products.
- **Filters** in a slide-over drawer on mobile, a sidebar on desktop:
  - price range (USD/EUR-aware),
  - carat range (a two-handle slider),
  - shape (icons, from `pa_shape`), cut, colour (white D–Z and fancy colours as separate groups),
  - clarity, lab, in stock.
  - **Mechanics:** filters live in the URL query so results can be shared and survive going back. Result counts update live.
- **Sort:** 6 options, the same as the old site (default, popularity, newest, price low→high, price high→low, carat).
- **Grid:** 2–4 columns and 12/24/48 per page, with pagination (not infinite scroll), using `ProductCard`.
- **Empty results:** a clear message and a "clear filters" button.

### 4. Product page: `/product/<slug>/`
- **Gallery:** the stone's **video first** when it has one (`StoneVideo`), then the images, with zoom on click (lightbox) and thumbnails.
- **Details:**
  - title as `displayName`, price (`Price`, with the currency switch), stock state,
  - add to cart, "Enquire about this stone" (prefills contact), wishlist, compare.
- **Spec table:** the full grading data from `specs`, grouped as Report (lab, cert comment), Grading (carat, colour, clarity, cut, polish, symmetry, fluorescence), Measurements (mm, depth %, table %, girdle, culet, crown/pavilion). Only filled values appear.
- **Diagram:** a small proportion diagram (side profile from table %, crown, pavilion), drawn in SVG from the real numbers.
- **Below:** related stones (same shape or nearby carat, 4–8, using `Rail`), then "Sell a stone like this?" linking to the sell page.
- **SEO:** `Product` + `Offer` JSON-LD (price, currency, availability) and `BreadcrumbList`.

### 5. Cart, checkout, account, wishlist, compare
- **Cart `/cart/`:** built from `useStore().cart`, with line items (image, name, key specs, price), remove, currency, and a subtotal. Stones are one-of-a-kind, so there's no quantity.
- **Checkout `/checkout/`:**
  - **Form:** contact, shipping address, billing, and the insured shipping note.
  - **Order summary** alongside.
  - **Payment:** Mollie isn't connected yet. Build the full UI and a `app/api/checkout/route.ts` that validates and returns "payments not connected in this preview", with `// TODO(mollie)` where the payment is created. Never pretend an order was placed.
- **Account `/my-account/`:** sign in and register forms, plus "Continue with Google", built as UI only with `// TODO(auth)`. Also an orders empty state.
- **Wishlist `/wishlist/` and Compare `/compare/`:** from `useStore`.
  - **Compare:** up to 4 stones side by side, rows = specs, differences highlighted, remove per stone.
- **Empty states:** every one of these pages has one, with a single clear next action.

### 6. Blog: `/blog/` and posts at `/<post-slug>/`
- **Index:** a featured post, then a grid of 9 per page with pagination, and category filters (from `category`).
- **Post:**
  - **Header:** title, date, reading time, featured image.
  - **Body:** content from `posts.json` `content_html`, restyled in an editorial measure (about 68 characters per line, Bodoni headings, Manrope body, pull quotes, tables styled).
  - **After the body:** related posts (3), and a "Get a free valuation" block.
- **SEO:** `Article` JSON-LD; old slugs kept exactly.

### 7. Resource / SEO guides: 8 pages
URLs: `/sell-your-engagement-ring/`, `/sell-your-diamond-ring/`, `/free-diamond-valuation-belgium/`, `/sell-your-diamond-belgium/`, `/sell-diamond-without-certificate/`, `/sell-loose-diamond/`, `/sell-diamond-jewellery/`, plus the calculator page's article.
- **Content:** migrate the long articles (37–55k characters of HTML each, from `pages.json`) intact. These rank in search.
- **Layout:**
  - quick answer box at the top,
  - a sticky table of contents on desktop,
  - **the valuation form placed properly after the quick answer** (not buried mid-article),
  - education sections, the comparison table (styled), the worked example, FAQ (an accordion, with `FAQPage` JSON-LD), and related guides.
- **Parse the old HTML** into sections by its headings, rather than dumping raw HTML.

### 8. About: `/about-sothis-diamonds/`
- **Content:** migrated from the old page (family business, clients served, pieces evaluated, mission, refurbishing old jewellery, sustainable luxury). Use the facts only where they appear in the export, and keep the founding year a variable.
- **Layout:** an editorial story with an image from the product media, a small "in numbers" band, and values.
- **No people:** the old site has no team photos or names. Leave a clearly marked slot for them; don't invent anyone.

### 9. Contact: `/contact-us/`
- **Contact details:** address with a map link (no embedded map, since the CSP and cookies matter), both phones, and email, each with tap-to-call/mail.
- **Contact form:** name, phone, email, message, and preferred contact. It uses the same route-handler pattern (`app/api/contact/route.ts`, `// TODO(delivery)`).
- **Opening hours:** a placeholder variable until the client confirms.
- **FAQ:** only real questions and answers; drop the old dummy answers.

### 10. Legal: shipping, refund/returns, terms, privacy, cookie policy
- **Content:** migrated verbatim from `pages.json` (legal text isn't rewritten).
- **Layout:** a clean long-form layout with a table of contents and a "last updated" date from the export's `modified`.

### 11. Shared
- **404 page:** a styled message with search suggestions and links to Sell and Shop.
- **SEO:**
  - `app/sitemap.ts` (every URL in every language, with hreflang alternates),
  - `app/robots.ts`,
  - per-page `generateMetadata` (title and description from `seo` in the export where present),
  - canonical URLs and hreflang on every page.
- **Breadcrumbs:** on everything below the homepage.
- **Menus and links:** the header menu and the footer links now resolve to real pages. Check that no internal link 404s.

## Build order (commit and push after each phase)
1. **Routing:** catch-all routing, route map and 404, plus sitemap and robots. Verify all 1,584 old URLs resolve (script it).
2. **Product page, then shop and categories.**
3. **Sell template (all five pages), valuation form and API.**
4. **Valuation calculator.**
5. **Blog index, posts and the 8 resource guides.**
6. **Cart, checkout, account, wishlist and compare.**
7. **About, contact, legal, breadcrumbs, JSON-LD,** then a link check.

## Done when (each phase)
- `tsc` and `eslint` are clean, and there are no browser errors.
- Screenshots at 1440 px and 390 px look right, with no horizontal overflow.
- Every old URL for that phase resolves in all six languages.
- Nothing fake: no made-up prices, reviews, people, or "sent" messages.
- Committed and pushed to GitHub (pull first; Codex also commits here, so never force-push).

## Decisions still needed from the client (don't guess; keep as variables or TODOs)
- Email delivery for forms (provider, and which inbox receives what).
- Mollie account/keys, and whether online checkout stays live or becomes enquire-only for high-value stones.
- Accounts and Google sign-in (provider).
- Founding year, opening hours, which phone number is primary.
- Team photos and names for About.
- Media hosting for Vercel previews (Blob or R2). Until then, images only show locally.
