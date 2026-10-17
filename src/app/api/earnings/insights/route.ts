import { createStreamingHandler } from "@/lib/ai/stream-route";
import { listEarnings } from "@/lib/db/repo";
import { earningsInsightsPrompt } from "@/lib/features/prompts";
import { earningsInsightsRequestSchema } from "@/lib/features/requests";

export const maxDuration = 60;

/** Analyses the logged-in worker's own log, loaded server-side (never trusted from the client). */
export const POST = createStreamingHandler(earningsInsightsRequestSchema, {
  task: "insights",
  build: async (input, { user }) => earningsInsightsPrompt(input, await listEarnings(user.id, 120)),
});
