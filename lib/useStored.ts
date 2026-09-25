"use client";

import { useCallback, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  window.addEventListener("storage", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", fn);
  };
};

function read<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {}
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value = fallback;
  try {
    if (raw !== null) value = JSON.parse(raw);
  } catch {}
  cache.set(key, { raw, value });
  return value;
}

/** JSON value in localStorage, shared by every component using the same key. `serverValue` is used before hydration. */
export function useStored<T>(key: string, fallback: T, serverValue: T = fallback) {
  const value = useSyncExternalStore(subscribe, () => read(key, fallback), () => serverValue);
  const set = useCallback(
    (next: T) => {
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        cache.set(key, { raw: null, value: next });
      }
      listeners.forEach((fn) => fn());
    },
    [key],
  );
  return [value, set] as const;
}
