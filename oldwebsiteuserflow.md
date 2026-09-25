# Old website user flow — sothisdiamonds.com

Global (on every page)

- Top bar: email, two phone numbers (+32 470 78 12 19, +32 477 41 85 68), language switcher (EN, FR, NL, DE, IT, ES), currency switcher (USD/EUR), and a "Sell your diamond now!" prompt
- Header: logo, main menu, and icons for account, wishlist and cart
- Main menu
  - Home
  - Sell to Us → Diamonds · Coloured stones · Watches · Antique jewellery · Other jewellery
  - Buy from Us → Diamonds · Jewellery · Other gemstones
  - Resources → 8 guide pages (sell an engagement ring, sell a diamond ring, free valuation Belgium, valuation calculator, sell a diamond in Belgium, sell without a certificate, sell a loose diamond, sell diamond jewellery)
  - About · Contact
- Live chat: Tawk.to chat bubble
- Footer:
  - logo and tagline ("10+ years… across Europe")
  - Antwerp address, phone, email, social icons
  - "Top Categories" links, "Useful Links" (shipping, returns, terms, privacy, cookies, blog)
  - a small recent-products strip
  - language and currency switcher again
  - payment method logos and copyright
- Cookie consent banner

Homepage (in order)

1. Hero: "Europe's Trusted Jewellery Buyers" with Sell now and View more buttons
2. Sell with confidence: honest evaluations, top market value, fast process. Buttons: Get a free valuation and Sell now
3. Featured products: 4 diamonds from about $8K to $600K, each with add to cart, quick view, compare and wishlist
4. "Sell diamond" banner: best value, transparent. Button: Sell now
5. Featured gems: 5 stones (Asscher, Cushion). Button: Shop now
6. How it works: 6 steps (Submit → Expert review → Offer → Accept & send → Inspection → Payment). Button: Sell yours now
7. Brand intro: "Explore the exclusive collections", 10+ years, diamonds, pearls, vintage and coloured stones
8. 4 selling points: trusted buyers (55+ years), free valuation, best value, insured shipping via FedEx/DHL
9. Why choose Sothis: "new life to old jewellery", 6 benefit bullets. Buttons: Go to shop and View more
10. Instagram feed: #ShineWithSothis, 9 tiles
11. Newsletter signup: "Subscribe for exclusive offers"
12. Testimonials: "Gems of Praise", 2 reviews
13. Footer

Page types

Sell pages (5, all on the same template): diamond, coloured stones, watches, antique, other
- Hero → the 6 steps → Sell Now form → 5 values (best value, trust, no middlemen, sustainable luxury, expertise)
- The watches page even asks for carat weight

Resource / SEO pages (8): long articles (2,500+ words)
- quick answer → form in the middle of the page → education sections → comparison table → worked example → about 13 FAQs → related articles

Valuation calculator: a long form
- item type, carat, origin (natural/lab), colour, clarity, cut, shape, condition, grading report (GIA/IGI/HRD) and up to 7 photos
- It says it returns a price range, and the button is "Get my expert-reviewed valuation"

Shop / categories
- All products: 83
- Diamonds: 79
- Jewellery: 4 rings, from $2.4K to $53K
- Other gemstones: 0 (the category is empty)
- Sidebar filters: price, carat range, shape (8), cut, colour (white D–U, fancy yellows), stock
- Sorting: 6 options
- Display: 9 to 24 per page, 2 to 4 columns, pagination
- Each card: image, name, price in USD, add to cart, quick view, compare, wishlist

Product page
- large image with zoom
- title and price
- a full spec table (carat, shape, colour, clarity, cut, lab, polish, symmetry, fluorescence, measurements, depth/table %, girdle, eye-clean, certificate comment), with some "nan" values
- add to cart and buy now; compare and wishlist
- tabs for description, additional info and reviews (0)
- related products carousel
- 62 products have a turning video of the stone, and some have certificate PDFs

Shopping pages: cart · checkout (Mollie payments) · my account (login/register, Google login) · wishlist · compare

Blog: 39 posts, grid of 9 per page
- Most were published on 14–15 Aug, all about selling: resale value, scams, documents, auction vs direct sale, and so on

About: since 1970, family business, 10,000+ clients, 5,000+ pieces evaluated, mission, "refurbish old jewellery", "sustainable luxury"
- No names or photos of the team

Contact:
- phone, email, address with a map link
- contact form (name, phone, email, message)
- FAQ with dummy placeholder answers

Legal pages: shipping, refund/returns, terms, privacy, cookie policy

Forms (WPForms)

- Sell Now: name, email, phone, address, country (249 options), item type, carat/weight, up to 7 photos, notes. Used on the sell and resource pages.
- Contact form
- Newsletter signup
- All of them now send to info@

Behind the scenes

- Languages: all 6 through TranslatePress (FR and NL are Belgian French and Dutch)
- SEO: Yoast, with Google Site Kit connected
- Currency switcher: prices are stored in USD and converted to EUR
- Other: image optimisation (Imagify), security scanner (Sucuri), backups (UpdraftPlus)
- Accounts: 115 customer accounts and 1 admin

Known problems

- Conflicting claims: "10+ years", "55+ years" and "since 1970"
- Prices in USD on a Belgian business's site
- The 5 sell pages are copies of each other, and the forms are long and badly placed
- Placeholder text in the Contact FAQ, "nan" in product specs, and an empty gemstone category
- The homepage repeats itself: two sell banners, and selling points that overlap with "Why choose"
- No real people or faces anywhere on the site
