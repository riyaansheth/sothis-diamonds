"use client";

import { site } from "@/lib/site";
import { useStored } from "@/lib/useStored";

export type Currency = "USD" | "EUR";
type State = { currency: Currency; cart: number[]; wishlist: number[]; compare: number[] };
const initial: State = { currency: "USD", cart: [], wishlist: [], compare: [] };

// ponytail: cart/wishlist/compare live in localStorage until accounts and checkout are built.
export function useStore() {
  const [saved, save] = useStored<State>("sothis-store", initial);
  const state = { ...initial, ...saved };
  return {
    ...state,
    setCurrency: (currency: Currency) => save({ ...state, currency }),
    toggle: (list: "cart" | "wishlist" | "compare", id: number) =>
      save({ ...state, [list]: state[list].includes(id) ? state[list].filter((x) => x !== id) : [...state[list], id] }),
  };
}

export function Price({ usd }: { usd: number }) {
  const { currency } = useStore();
  const amount = currency === "EUR" ? usd * site.eurPerUsd : usd;
  return (
    <>{new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-IE", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount)}</>
  );
}

export function CurrencySwitch({ label }: { label: string }) {
  const { currency, setCurrency } = useStore();
  return (
    <div role="group" aria-label={label} className="flex gap-1">
      {(["USD", "EUR"] as const).map((c) => (
        <button
          key={c}
          type="button"
          aria-pressed={currency === c}
          onClick={() => setCurrency(c)}
          className="rounded-full border border-line px-3 py-1 text-sm text-platinum-2 transition-colors hover:text-ink aria-pressed:border-burgundy aria-pressed:text-ink"
        >
          {c}
        </button>
      ))}
    </div>
  );
}
