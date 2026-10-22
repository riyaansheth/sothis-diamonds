// Photos people attach to the contact and valuation forms: the same limits on both, checked in the
// browser for quick feedback and again on the server.
export const MAX_PHOTOS = 7;
export const MAX_BYTES = 10 * 1024 * 1024;
export const PHOTO_TYPES = /\.(jpe?g|png|heic|heif|webp)$/i;
export const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif";

/** The attached photos and what's wrong with them (empty if nothing). */
export function checkPhotos(form: FormData) {
  const photos = form.getAll("photos").filter((p): p is File => p instanceof File && p.size > 0);
  const errors: string[] = [];
  if (photos.length > MAX_PHOTOS) errors.push("photos: too many");
  for (const p of photos) {
    if (p.size > MAX_BYTES) errors.push(`photos: ${p.name} too large`);
    if (!PHOTO_TYPES.test(p.name)) errors.push(`photos: ${p.name} not an image`);
  }
  return { photos, errors };
}
