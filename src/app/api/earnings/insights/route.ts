import { createStreamingHandler } from "@/lib/ai/stream-route";
import { earningsInsightsPrompt } from "@/lib/features/prompts";
import { earningsInsightsRequestSchema } from "@/lib/features/requests";

export const maxDuration = 60;

export const POST = createStreamingHandler(earningsInsightsRequestSchema, earningsInsightsPrompt);
