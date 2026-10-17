"use client";

import { isEarningsLog, type EarningEntry } from "@/lib/features/earnings";
import { DEFAULT_PROFILE, isProfile, type Profile } from "@/lib/profile";
import { useLocalStorage } from "./useLocalStorage";

const EMPTY_LOG: EarningEntry[] = [];

/** Worker profile shared by Safety, Schemes and Home. Stored only on this device. */
export function useProfile() {
  return useLocalStorage<Profile>("gig:profile", DEFAULT_PROFILE, isProfile);
}

/** Earnings log shared by Earnings and Complaint. Stored only on this device. */
export function useEarningsLog() {
  return useLocalStorage<EarningEntry[]>("gig:earnings", EMPTY_LOG, isEarningsLog);
}
