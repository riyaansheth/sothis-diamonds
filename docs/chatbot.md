# Chatbot knowledge

The Tawk.to widget was removed on 14 Oct 2026 to make way for our own chatbot. This file keeps what it
knew and how it was set up.

## Where the business facts live

Point the new bot at these sources rather than copying facts into it, so the bot and the site never disagree:

- `lib/site.ts`: name, email, phones, address, map link, opening hours (not set yet)
- `/llms.txt` (`app/llms.txt/route.ts`): key facts (stock counts, payment, delivery, returns, natural-only,
  metals, languages) and a link list of every sell page, guide and the shop
- `lib/dictionaries/en.ts`: the buy FAQ (`buy.faq`) and the sell FAQ (`sellPage.faq`)
- `export/data/products.json`: the stock, with grades, prices and report numbers
- `export/data/pages.json`: legal pages (returns, privacy, terms, shipping)

As of 14 Oct 2026:

- Sothis Diamonds, Hoveniersstraat 2 / Bus 210, 2018 Antwerpen, Belgium (Antwerp diamond district)
- info@sothisdiamonds.com, +32 470 78 12 19, +32 477 41 85 68
- Two companies: Sothis Diamonds (loose diamonds) and SKD International (jewellery and mountings)
- Sells: certified natural diamonds (GIA, HRD, IGI) and fine jewellery in 18k gold and platinum
- Buys: diamonds, coloured stones, watches, antique and designer jewellery. Free valuation, no commission,
  insured pickup
- Natural diamonds only, no lab-grown or simulants; no silver or copper
- Payment: Bancontact, iDEAL, Visa, Mastercard, bank transfer
- Delivery: insured and tracked (DHL Express, FedEx, UPS). Europe 3–7 business days, US and Canada 5–10,
  Australia 7–12
- Returns: 14 days from delivery, unworn and with certificates; refunds within 7–10 business days

## How the Tawk widget was set up

From its public settings (property "Sothis Diamonds", ID 68e53f3be9dc6219554ac132/1j6vp97nq):

- Opening message from "Customer Support": "👋 Hi! How can we help?", with two buttons,
  "I have a question" and "Tell me more"
- Online: "Hi there 👋 Need help? Search our help center for answers or start a conversation",
  "We typically reply in a few minutes"
- Offline: "Please fill out the form below and we will get back to you as soon as possible", with name,
  email and message (all required)
- A "Help Center" knowledge base search, file uploads, chat rating, transcripts by email
- Colours: header #7c2939, agent messages #702533
- Loaded only after cookie consent, 4 seconds after the page was ready

## Still in the Tawk dashboard

Only visible after logging in at dashboard.tawk.to; export these before the account is closed:

- Help Center (knowledge base) articles
- Shortcuts (canned replies) and the bot's answers behind "I have a question" and "Tell me more"
- AI Assist data sources, if set up

Past chat transcripts are customer data: keep them in Tawk, not in this repo.
