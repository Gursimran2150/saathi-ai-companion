import { z } from "zod";

export const WORK_TYPES = ["delivery", "driver", "construction", "domestic", "street_vendor", "other"] as const;
export type WorkType = (typeof WORK_TYPES)[number];

export const workTypeSchema = z.enum(WORK_TYPES);

/** What the worker tells us about themselves. Optional fields are "unknown", not "no". */
export const profileSchema = z.object({
  workType: workTypeSchema.default("delivery"),
  age: z.number().int().min(14).max(100).optional(),
  monthlyIncome: z.number().min(0).max(10_000_000).optional(),
  state: z.string().trim().max(60).optional(),
  isTaxpayer: z.boolean().optional(),
  hasEpfoEsic: z.boolean().optional(),
});

export type Profile = z.infer<typeof profileSchema>;

export const DEFAULT_PROFILE: Profile = { workType: "delivery" };

export function isProfile(value: unknown): value is Profile {
  return profileSchema.safeParse(value).success;
}
