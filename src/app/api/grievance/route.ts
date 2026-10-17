import { createStreamingHandler } from "@/lib/ai/stream-route";
import { listEarnings } from "@/lib/db/repo";
import { daysAgo, formatLogForPrompt } from "@/lib/features/earnings";
import { grievancePrompt } from "@/lib/features/prompts";
import { grievanceRequestSchema } from "@/lib/features/requests";

export const maxDuration = 60;

export const POST = createStreamingHandler(grievanceRequestSchema, async (input, { user }) => {
  if (!input.attachEarnings) return grievancePrompt(input);
  const since = daysAgo(29);
  const recent = (await listEarnings(user.id, 60)).filter((e) => e.date >= since);
  return grievancePrompt(input, recent.length ? formatLogForPrompt(recent, 30) : undefined);
});
