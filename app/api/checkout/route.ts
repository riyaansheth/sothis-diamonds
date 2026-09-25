import { NextResponse } from "next/server";
import { allProducts } from "@/lib/products";

// Checkout: validates the order and prices it from the catalogue (never from the browser).
// Payment isn't connected yet, so the response says so and nothing is charged or recorded.

const REQUIRED = ["email", "phone", "ship_firstName", "ship_lastName", "ship_address", "ship_postcode", "ship_city", "ship_country"];
const BILLING = ["bill_firstName", "bill_lastName", "bill_address", "bill_postcode", "bill_city", "bill_country"];

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

  const totalUsd = lines.reduce((sum, p) => sum + (p?.price ?? 0), 0);

  // TODO(mollie): create the Mollie payment here (amount from totalUsd in the chosen currency,
  // redirectUrl back to an order page, webhook to confirm) and return its checkout URL.
  console.info(`[checkout] items=${ids.length} totalUsd=${totalUsd} (payments not connected)`);
  return NextResponse.json({ connected: false, totalUsd });
}
