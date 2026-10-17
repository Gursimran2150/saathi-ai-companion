"use client";

import { useLocalStorage } from "./useLocalStorage";

const isString = (v: unknown): v is string => typeof v === "string";

/**
 * Carries a document explanation from the Document helper to the Complaint drafter,
 * so the worker doesn't have to retype it. Stored only on this device.
 */
export function useDocumentHandoff() {
  return useLocalStorage<string>("gig:document-evidence", "", isString);
}
