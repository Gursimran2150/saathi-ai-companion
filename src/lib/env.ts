import "server-only";
import { z } from "zod";

const envSchema = z.object({
  AI_PROVIDER: z.enum(["gemini", "openai"]).default("gemini"),
  GEMINI_API_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().min(1).default("gemini-3.5-flash"),
  OPENAI_MODEL: z.string().min(1).default("gpt-5.4-mini"),
  RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(20),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/** Validated server-side environment. Throws at first use if misconfigured. */
export function getEnv(): Env {
  cached ??= envSchema.parse(process.env);
  return cached;
}
