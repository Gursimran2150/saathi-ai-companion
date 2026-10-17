import { createStreamingHandler } from "@/lib/ai/stream-route";
import { safetyPrompt } from "@/lib/features/prompts";
import { safetyRequestSchema } from "@/lib/features/requests";

export const maxDuration = 60;

export const POST = createStreamingHandler(safetyRequestSchema, safetyPrompt);
