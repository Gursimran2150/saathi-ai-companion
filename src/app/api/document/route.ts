import { createStreamingHandler } from "@/lib/ai/stream-route";
import { documentPrompt } from "@/lib/features/prompts";
import { documentRequestSchema } from "@/lib/features/requests";

export const maxDuration = 60;

export const POST = createStreamingHandler(documentRequestSchema, documentPrompt);
