"use client";

import { useRef, useState } from "react";
import type { Dictionary } from "@/lib/dictionaries/en";
import { site } from "@/lib/site";

/**
 * Chat on WhatsApp: the visitor writes here, and Send opens WhatsApp (app or web) with the message
 * ready to the shop's number; the conversation then carries on in WhatsApp on both sides. On a product
 * page the message starts with that piece (from the page's data-product-* attributes).
 */
export function WhatsAppChat({ t }: { t: Dictionary["whatsapp"] }) {
  const [open, setOpen] = useState(false);
  const text = useRef<HTMLTextAreaElement>(null);

  const toggle = () => {
    if (!open) {
      const piece = document.querySelector<HTMLElement>("[data-product-sku]");
      requestAnimationFrame(() => {
        const box = text.current;
        if (!box) return;
        if (!box.value) box.value = piece ? t.about.replace("{name}", piece.dataset.productName ?? "").replace("{sku}", piece.dataset.productSku ?? "") : "";
        box.focus();
      });
    }
    setOpen(!open);
  };

  return (
    <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end gap-3">
      {open && (
        <form
          aria-label={t.title}
          onSubmit={(e) => {
            e.preventDefault();
            const message = text.current?.value.trim();
            if (!message) return text.current?.focus();
            window.open(`https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
            setOpen(false);
          }}
          className="w-[min(22rem,calc(100vw-2.5rem))] rounded-sm bg-ivory-deep p-5 text-sm shadow-[0_18px_40px_-20px_rgb(0_0_0/0.8)] ring-1 ring-line"
        >
          <p className="font-display text-xl">{t.title}</p>
          <p className="mt-1 text-platinum-2">{t.body}</p>
          <textarea ref={text} rows={4} maxLength={1000} placeholder={t.placeholder} aria-label={t.placeholder} className="field mt-4 py-3" />
          <button type="submit" className="btn btn-primary mt-3 w-full">{t.send}</button>
        </form>
      )}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? t.close : t.open}
        className="grid size-13 place-items-center rounded-full bg-wine text-on-accent shadow-[0_10px_30px_-10px_rgb(0_0_0/0.8)] ring-1 ring-white/15 transition-transform hover:scale-105"
      >
        {open ? (
          <svg viewBox="0 0 24 24" aria-hidden className="size-5 fill-none stroke-current [stroke-width:1.6]"><path d="M6 6l12 12M18 6L6 18" /></svg>
        ) : (
          // The WhatsApp mark, so the destination is clear before tapping.
          <svg viewBox="0 0 24 24" aria-hidden className="size-6 fill-current">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 5.83 2.42 8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z" />
          </svg>
        )}
      </button>
    </div>
  );
}
