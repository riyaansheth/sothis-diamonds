import { NextResponse } from "next/server";

// Contact messages. Validated server-side; delivery isn't wired yet, and the response says so.

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected a form submission." }, { status: 400 });
  }
  const str = (k: string, max = 200) => String(form.get(k) ?? "").trim().slice(0, max);
  const errors = ["name", "phone", "message"].filter((k) => !str(k));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str("email"))) errors.push("email");
  if (errors.length) return NextResponse.json({ error: "Invalid request.", fields: errors }, { status: 422 });

  // TODO(delivery): email the message to the shop inbox once the provider is chosen, then return
  // delivered: true. Log only non-personal details.
  console.info(`[contact] message length=${str("message", 4000).length} contactBy=${str("contactBy")}`);
  return NextResponse.json({ delivered: false });
}
