"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * JSON value persisted in localStorage, shared across components.
 * Falls back to `initial` when storage is unavailable or the value is invalid.
 */
export function useLocalStorage<T>(key: string, initial: T, validate?: (value: unknown) => value is T) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => null,
  );

  // Parse only when the stored string changes, not on every render.
  const value = useMemo(() => {
    if (raw === null) return initial;
    try {
      const parsed: unknown = JSON.parse(raw);
      return !validate || validate(parsed) ? (parsed as T) : initial;
    } catch {
      return initial;
    }
  }, [raw, initial, validate]);

  const setValue = useCallback(
    (next: T) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // storage full or blocked: ignore, state is best-effort
      }
      listeners.forEach((l) => l());
    },
    [key],
  );

  return [value, setValue] as const;
}
