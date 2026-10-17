import "server-only";

/** Upper bound for one AI request, so a stalled provider call fails cleanly instead of hanging the UI. */
const AI_TIMEOUT_MS = 45_000;

export type AiTask = "chat" | "extract" | "insights" | "safety" | "rights" | "schemes" | "document" | "grievance";

type Effort = "minimal" | "low";

/**
 * Per-task budgets. Output caps stop runaway generations (time and cost), and a low
 * reasoning effort keeps latency down for tasks that are grounded or mostly formatting.
 * Caps are generous enough that a normal answer is never cut off.
 */
const TASKS: Record<AiTask, { maxOutputTokens: number; effort: Effort }> = {
  extract: { maxOutputTokens: 1024, effort: "minimal" },
  chat: { maxOutputTokens: 2048, effort: "low" },
  insights: { maxOutputTokens: 2048, effort: "low" },
  safety: { maxOutputTokens: 2048, effort: "low" },
  rights: { maxOutputTokens: 2048, effort: "low" },
  schemes: { maxOutputTokens: 2048, effort: "low" },
  document: { maxOutputTokens: 2048, effort: "low" },
  grievance: { maxOutputTokens: 4096, effort: "low" },
};

/** Aborts when the client disconnects or the time budget runs out, whichever comes first. */
function abortSignalFor(request: Request): AbortSignal {
  return AbortSignal.any([request.signal, AbortSignal.timeout(AI_TIMEOUT_MS)]);
}

/** Shared call settings for generateText/streamText. Each provider ignores the other's options. */
export function aiCallSettings(request: Request, task: AiTask) {
  const { maxOutputTokens, effort } = TASKS[task];
  return {
    maxOutputTokens,
    maxRetries: 2,
    abortSignal: abortSignalFor(request),
    providerOptions: {
      google: { thinkingConfig: { thinkingLevel: effort } },
      openai: { reasoningEffort: effort },
    },
  };
}
