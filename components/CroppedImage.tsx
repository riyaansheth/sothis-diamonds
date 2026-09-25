import Image from "next/image";

/** Square window of the photo, in fractions of its width: centre (cx, cy), side d. */
export type Crop = { cx: number; cy: number; d: number };

/**
 * Fills its (positioned) parent with just the `crop` window of the photo, like object-cover but
 * around a chosen point. Used on the homepage to keep the stone and leave out the certificate card,
 * filename and watermark the old product photos carry. Without a crop it's a plain cover image.
 */
export function CroppedImage({ src, alt = "", crop, sizes, className = "" }: { src: string; alt?: string; crop?: Crop; sizes: string; className?: string }) {
  if (!crop) return <Image src={src} alt={alt} fill sizes={sizes} className={`object-cover ${className}`} />;
  // The photo is scaled so the window covers the parent; container units size it to the parent.
  const side = `calc(max(100cqw, 100cqh) / ${crop.d})`;
  return (
    <div className="absolute inset-0 overflow-hidden [container-type:size]">
      <div
        className={`absolute ${className}`}
        style={{ width: side, height: side, left: `calc(50cqw - ${side} * ${crop.cx})`, top: `calc(50cqh - ${side} * ${crop.cy})` }}
      >
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      </div>
    </div>
  );
}
