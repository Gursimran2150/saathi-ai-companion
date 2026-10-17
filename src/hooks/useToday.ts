"use client";

import { useSyncExternalStore } from "react";
import { toIsoDate } from "@/lib/features/earnings";

const noopSubscribe = () => () => {};

/** Today's local date (YYYY-MM-DD) on the client; null during server prerender. */
export function useToday(): string | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => toIsoDate(new Date()),
    () => null,
  );
}
