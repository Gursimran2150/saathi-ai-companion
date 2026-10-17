import { z } from "zod";
import { DEFAULT_LANGUAGE, LANGUAGE_CODES } from "@/lib/i18n";

export const MAX_MESSAGE_LENGTH = 2000;

export const languageSchema = z.enum(LANGUAGE_CODES).default(DEFAULT_LANGUAGE);

export const chatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty.")
    .max(MAX_MESSAGE_LENGTH, `Message must be under ${MAX_MESSAGE_LENGTH} characters.`),
  language: languageSchema,
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
