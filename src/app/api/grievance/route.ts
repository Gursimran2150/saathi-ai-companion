import { createStreamingHandler } from "@/lib/ai/stream-route";
import { grievancePrompt } from "@/lib/features/prompts";
import { grievanceRequestSchema } from "@/lib/features/requests";

export const maxDuration = 60;

export const POST = createStreamingHandler(grievanceRequestSchema, grievancePrompt);
