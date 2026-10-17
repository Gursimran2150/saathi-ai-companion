import { createStreamingHandler } from "@/lib/ai/stream-route";
import { schemesPrompt } from "@/lib/features/prompts";
import { schemesRequestSchema } from "@/lib/features/requests";

export const maxDuration = 60;

export const POST = createStreamingHandler(schemesRequestSchema, schemesPrompt);
