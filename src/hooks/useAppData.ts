"use client";

import { useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";
import { api, fetcher } from "@/lib/api-client";
import type { SessionUser } from "@/lib/auth/token";
import type { EarningEntry, ExtractedEarning } from "@/lib/features/earnings";
import { DEFAULT_PROFILE, type Profile } from "@/lib/profile";

const EMPTY: EarningEntry[] = [];

/** The logged-in user (from the session cookie). */
export function useSession() {
  const { data, isLoading } = useSWR<{ user: SessionUser }>("/api/auth/me", fetcher, { revalidateOnFocus: false });
  return { user: data?.user ?? null, isLoading };
}

/** Worker profile stored in the database; shared by Safety, Schemes, Rights and chat tools. */
export function useProfile() {
  const { data, isLoading, mutate } = useSWR<{ profile: Profile }>("/api/profile", fetcher);
  const profile = data?.profile ?? DEFAULT_PROFILE;

  const save = useCallback(
    async (next: Profile) => {
      // Optimistic: the form updates instantly, then the server copy replaces it.
      await mutate(api.put<{ profile: Profile }>("/api/profile", next), {
        optimisticData: { profile: next },
        rollbackOnError: true,
        revalidate: false,
      });
    },
    [mutate],
  );

  return { profile, isLoading, save };
}

/** The worker's earnings log stored in the database (newest first). */
export function useEarnings() {
  const { data, isLoading, mutate } = useSWR<{ entries: EarningEntry[] }>("/api/earnings", fetcher);
  const entries = data?.entries ?? EMPTY;

  const add = useCallback(
    async (entry: ExtractedEarning) => {
      const { entry: saved } = await api.post<{ entry: EarningEntry }>("/api/earnings", entry);
      await mutate((cur) => ({ entries: [saved, ...(cur?.entries ?? [])] }), { revalidate: false });
      return saved;
    },
    [mutate],
  );

  const remove = useCallback(
    async (id: string) => {
      await mutate(
        async (cur) => {
          await api.delete(`/api/earnings/${id}`);
          return { entries: (cur?.entries ?? []).filter((e) => e.id !== id) };
        },
        {
          optimisticData: (cur) => ({ entries: (cur?.entries ?? []).filter((e) => e.id !== id) }),
          rollbackOnError: true,
          revalidate: false,
        },
      );
    },
    [mutate],
  );

  return { entries, isLoading, add, remove, refresh: () => mutate() };
}

/** Lets other features (e.g. chat tools) tell the earnings views to refetch. */
export function useRefreshEarnings() {
  const { mutate } = useSWRConfig();
  return useCallback(() => mutate("/api/earnings"), [mutate]);
}
