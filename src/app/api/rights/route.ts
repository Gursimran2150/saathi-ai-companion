import { createStreamingHandler } from "@/lib/ai/stream-route";
import { rightsPrompt } from "@/lib/features/prompts";
import { rightsRequestSchema } from "@/lib/features/requests";

export const maxDuration = 60;

export const POST = createStreamingHandler(rightsRequestSchema, rightsPrompt);
