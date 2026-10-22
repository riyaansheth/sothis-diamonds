import { NextResponse } from "next/server";
import { allProducts, displayName } from "@/lib/products";
import { site } from "@/lib/site";

// Checkout: validates the order, prices it from the catalogue (never from the browser) and opens a
// Stripe Checkout session, charged in EUR (the Stripe account's currency). Without STRIPE_SECRET_KEY
// the response says payment isn't connected and nothing is charged.

const REQUIRED = ["email", "phone", "ship_firstName", "ship_lastName", "ship_address", "ship_postcode", "ship_city", "ship_country"];
const BILLING = ["bill_firstName", "bill_lastName", "bill_address", "bill_postcode", "bill_city", "bill_country"];
// ponytail: one cap for every method; above it the order is paid by bank transfer by arrangement.
// Raise or split per method once the client has agreed limits with Stripe.
const MAX_ONLINE_EUR = 25_000;

/** Stripe's form encoding: nested objects and arrays as a[b][0][c]=v. */
function form(value: unknown, key = "", out = new URLSearchParams()) {
  if (value === undefined) return out;
  if (value !== null && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) form(v, key ? `${key}[${k}]` : k, out);
  } else out.append(key, String(value));
  return out;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }
  const str = (k: string) => (typeof body[k] === "string" ? (body[k] as string).trim() : "");
  const missing = [...REQUIRED, ...(body.sameBilling === false ? BILLING : [])].filter((k) => !str(k));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str("email"))) missing.push("email");

  const ids = Array.isArray(body.items) ? body.items.filter((x): x is number => typeof x === "number") : [];
  const lines = ids.map((id) => allProducts.find((p) => p.id === id));
  if (!ids.length || lines.some((p) => !p || !p.in_stock || !p.price)) missing.push("items");
  if (missing.length) return NextResponse.json({ error: "Invalid order.", fields: [...new Set(missing)] }, { status: 422 });
  const products = lines as NonNullable<(typeof lines)[number]>[];

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return NextResponse.json({ connected: false });

  const cents = (usd: number) => Math.round(usd * site.eurPerUsd * 100);
  const totalEur = products.reduce((sum, p) => sum + cents(p.price!), 0) / 100;
  if (totalEur > MAX_ONLINE_EUR) return NextResponse.json({ connected: true, tooLarge: true, limit: MAX_ONLINE_EUR });

  // Back to the checkout page this order came from (a path on this site only).
  const path = str("returnPath");
  const back = path.startsWith("/") && !path.startsWith("//") ? path : "/checkout/";
  const h = request.headers;
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("x-forwarded-host") ?? h.get("host")}`;

  const address = (p: string) => [str(`${p}firstName`), str(`${p}lastName`), str(`${p}address`), `${str(`${p}postcode`)} ${str(`${p}city`)}`, str(`${p}country`)].join(", ");
  const details = {
    skus: products.map((p) => p.sku).join(", "),
    phone: str("phone"),
    shipping: address("ship_"),
    billing: body.sameBilling === false ? address("bill_") : "same as shipping",
  };

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form({
      mode: "payment",
      locale: "auto",
      customer_email: str("email"),
      line_items: products.map((p) => ({
        quantity: 1,
        price_data: { currency: "eur", unit_amount: cents(p.price!), product_data: { name: displayName(p), description: `Reference ${p.sku}` } },
      })),
      // On the session and its payment, so the order's details show in the Stripe dashboard.
      metadata: details,
      payment_intent_data: { metadata: details, description: `Sothis Diamonds: ${details.skus}` },
      success_url: `${origin}${back}?paid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${back}`,
    }),
  });
  const session = await res.json();
  if (!res.ok) {
    // The error only: never the customer's details.
    console.error(`[checkout] stripe ${res.status}: ${session?.error?.message ?? "unknown error"}`);
    return NextResponse.json({ error: "Payment could not be started." }, { status: 502 });
  }
  return NextResponse.json({ connected: true, url: session.url });
}
