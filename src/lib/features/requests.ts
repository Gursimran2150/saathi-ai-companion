import { z } from "zod";
import { profileSchema, workTypeSchema } from "@/lib/profile";
import { languageSchema } from "@/lib/validation/schemas";

const text = (max: number) => z.string().trim().min(1, "This field is required.").max(max);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const earningsParseRequestSchema = z.object({
  text: text(1000),
  today: isoDate,
  language: languageSchema,
});

export const earningsInsightsRequestSchema = z.object({
  today: isoDate,
  language: languageSchema,
});

export const safetyRequestSchema = z.object({
  workType: workTypeSchema,
  situation: text(1000),
  language: languageSchema,
});

export const schemesRequestSchema = z.object({
  profile: profileSchema,
  question: z.string().trim().max(500).optional(),
  language: languageSchema,
});

export const RIGHTS_TOPICS = ["deactivation", "wages", "accident", "harassment", "fraud", "legalAid"] as const;

export const rightsRequestSchema = z.object({
  topic: z.enum(RIGHTS_TOPICS).optional(),
  question: text(1000),
  state: z.string().trim().max(60).optional(),
  language: languageSchema,
});

export const DOCUMENT_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;
/** 3 MB file ≈ 4 MB base64, under Vercel's 4.5 MB request limit. */
export const MAX_DOCUMENT_BYTES = 3 * 1024 * 1024;

export const documentRequestSchema = z.object({
  mediaType: z.enum(DOCUMENT_MEDIA_TYPES),
  data: z
    .string()
    .min(1)
    .max(Math.ceil((MAX_DOCUMENT_BYTES * 4) / 3) + 4, "File is larger than 3 MB.")
    .regex(/^[A-Za-z0-9+/]+=*$/, "File data must be base64."),
  question: z.string().trim().max(500).optional(),
  language: languageSchema,
});

export const GRIEVANCE_TYPES = [
  "unpaid_payout",
  "account_deactivation",
  "accident_or_injury",
  "wage_theft",
  "harassment",
  "other",
] as const;

export const grievanceRequestSchema = z.object({
  issueType: z.enum(GRIEVANCE_TYPES),
  against: text(100),
  details: text(2000),
  attachEarnings: z.boolean().default(false),
  documentEvidence: z.string().max(4000).optional(),
  workerName: z.string().trim().max(80).optional(),
  language: languageSchema,
});

export type GrievanceRequest = z.infer<typeof grievanceRequestSchema>;
