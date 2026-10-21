"use client";

import { useEffect, useRef } from "react";

/**
 * Muted looping stone video. Paused (first frame) when the visitor prefers reduced motion. With
 * `playOnHover` it plays while the pointer is over its card (the nearest `.group`), since a link
 * laid over the video would otherwise catch the hover.
 */
export function StoneVideo({ src, poster, className, playOnHover, still }: { src: string; poster?: string; className?: string; playOnHover?: boolean; still?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!playOnHover) {
      if (!reduce) video.play().catch(() => {});
      return;
    }
    const host = video.closest<HTMLElement>(".group") ?? video.parentElement;
    if (!host) return;
    const play = () => video.play().catch(() => {});
    const pause = () => video.pause();
    host.addEventListener("pointerenter", play);
    host.addEventListener("pointerleave", pause);
    return () => {
      host.removeEventListener("pointerenter", play);
      host.removeEventListener("pointerleave", pause);
    };
  }, [playOnHover]);

  // `still`: shows its first frame until played (#t makes Safari draw it; metadata is a small download).
  return <video ref={ref} src={still ? `${src}#t=0.1` : src} poster={poster} muted loop playsInline preload={playOnHover && !still ? "none" : "metadata"} aria-hidden className={className} />;
}
