"use client";

import { useEffect, useRef } from "react";

/** Muted looping stone video. Paused (first frame) when the visitor prefers reduced motion. */
export function StoneVideo({ src, poster, className, playOnHover }: { src: string; poster?: string; className?: string; playOnHover?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!playOnHover && !reduce) ref.current?.play().catch(() => {});
  }, [playOnHover]);

  const hover = playOnHover
    ? {
        onMouseEnter: () => ref.current?.play().catch(() => {}),
        onMouseLeave: () => ref.current?.pause(),
      }
    : {};

  return (
    <video ref={ref} src={src} poster={poster} muted loop playsInline preload={playOnHover ? "none" : "metadata"} aria-hidden className={className} {...hover} />
  );
}
