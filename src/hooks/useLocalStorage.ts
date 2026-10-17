"use client";

import { useCallback, useSyncExternalStore } from "react";

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

  let value = initial;
  if (raw !== null) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!validate || validate(parsed)) value = parsed as T;
    } catch {
      // keep initial
    }
  }

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
