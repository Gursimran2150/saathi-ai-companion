"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/components/LanguageProvider";
import { useProfile } from "@/hooks/useAppData";
import { isProfile, profileSchema, type Profile } from "@/lib/profile";

/** Typing pauses this long before the profile is PUT, so we don't hit the API on every keystroke. */
export const PROFILE_SAVE_DEBOUNCE_MS = 500;

export type SaveState = "idle" | "saving" | "saved";

/**
 * Local, editable copy of the stored profile.
 * - Discrete choices (selects, yes/no) save immediately; text/number fields save after a short pause.
 * - Invalid values (e.g. a half-typed age of "2") are kept locally and flagged, never sent.
 * - A pending edit is flushed if the screen unmounts mid-debounce.
 */
export function useProfileEditor() {
  const { profile, isLoading, save } = useProfile();
  const { t } = useLanguage();
  const [draft, setDraft] = useState<Profile | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendingRef = useRef<Profile | null>(null);
  const saveRef = useRef(save);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  const commit = useCallback(
    async (next: Profile) => {
      clearTimeout(timerRef.current);
      pendingRef.current = null;
      setSaveState("saving");
      try {
        await saveRef.current(next);
        setSaveState("saved");
      } catch {
        setSaveState("idle");
        toast.error(t("toast.error"));
      } finally {
        setDraft((d) => (d === next ? null : d));
      }
    },
    [t],
  );

  const current = draft ?? profile;

  const update = useCallback(
    (patch: Partial<Profile>, options?: { debounce?: boolean }) => {
      const next: Profile = { ...current, ...patch };
      setDraft(next);
      clearTimeout(timerRef.current);
      pendingRef.current = null;
      if (!isProfile(next)) return;
      if (options?.debounce) {
        pendingRef.current = next;
        timerRef.current = setTimeout(() => void commit(next), PROFILE_SAVE_DEBOUNCE_MS);
      } else {
        void commit(next);
      }
    },
    [current, commit],
  );

  useEffect(() => {
    const timers = timerRef;
    const pending = pendingRef;
    return () => {
      clearTimeout(timers.current);
      if (pending.current) saveRef.current(pending.current).catch(() => undefined);
    };
  }, []);

  /** True when the locally edited value for `key` would be rejected by the server. */
  const isInvalid = useCallback(
    (key: keyof Profile) => draft !== null && !profileSchema.shape[key].safeParse(draft[key]).success,
    [draft],
  );

  return { profile: current, isLoading, update, isInvalid, saveState };
}
