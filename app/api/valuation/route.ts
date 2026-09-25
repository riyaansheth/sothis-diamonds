import { NextResponse } from "next/server";

// Valuation requests from the sell pages and the calculator. Validates everything server-side.
// Delivery (email to the gemmologists) isn't wired yet: the response says so, and the form tells the
// visitor plainly that nothing was sent.

const TYPES = new Set(["diamond", "coloured", "watch", "antique", "other"]);
const MAX_PHOTOS = 7;
const MAX_BYTES = 10 * 1024 * 1024;
const PHOTO = /\.(jpe?g|png|heic|heif|webp)$/i;
const TEXT_FIELDS = ["carat", "shape", "colour", "clarity", "report", "stone", "origin", "brand", "model", "reference", "year", "boxPapers", "piece", "era", "mainStones", "hallmarks", "metal", "cut", "condition", "notes", "name", "email", "phone", "country", "contactBy", "lang", "calculator"];

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected a form submission." }, { status: 400 });
  }

  const str = (k: string, max = 200) => String(form.get(k) ?? "").trim().slice(0, max);
  const type = str("type");
  const errors: string[] = [];
  if (!TYPES.has(type)) errors.push("type");
  if (!str("name")) errors.push("name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str("email"))) errors.push("email");
  if (!str("phone")) errors.push("phone");

  const photos = form.getAll("photos").filter((p): p is File => p instanceof File && p.size > 0);
  if (photos.length > MAX_PHOTOS) errors.push("photos: too many");
  for (const p of photos) {
    if (p.size > MAX_BYTES) errors.push(`photos: ${p.name} too large`);
    if (!PHOTO.test(p.name)) errors.push(`photos: ${p.name} not an image`);
  }
  if (errors.length) return NextResponse.json({ error: "Invalid request.", fields: errors }, { status: 422 });

  const request_ = Object.fromEntries(TEXT_FIELDS.map((k) => [k, str(k, k === "notes" ? 2000 : 200)]).filter(([, v]) => v));
  const ref = `SD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  // TODO(delivery): email `request_` and the photos to the gemmologists (provider and inbox to be
  // decided with the client), then return delivered: true. Until then nothing leaves the server.
  // Log only non-personal details.
  console.info(`[valuation] ${ref} type=${type} photos=${photos.length} fields=${Object.keys(request_).length}`);

  return NextResponse.json({ ref, delivered: false });
}
