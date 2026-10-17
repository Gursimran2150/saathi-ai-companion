import { createStreamingHandler } from "@/lib/ai/stream-route";
import { listEarnings } from "@/lib/db/repo";
import { daysAgo, formatLogForPrompt } from "@/lib/features/earnings";
import { grievancePrompt } from "@/lib/features/prompts";
import { grievanceRequestSchema } from "@/lib/features/requests";

export const maxDuration = 60;

export const POST = createStreamingHandler(grievanceRequestSchema, {
  task: "grievance",
  build: async (input, { user }) => {
    if (!input.attachEarnings) return grievancePrompt(input);
    const recent = await listEarnings(user.id, 30, daysAgo(29));
    return grievancePrompt(input, recent.length ? formatLogForPrompt(recent, 30) : undefined);
  },
});
