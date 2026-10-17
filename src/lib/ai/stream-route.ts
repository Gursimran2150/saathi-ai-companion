import "server-only";
import { streamText, type ModelMessage } from "ai";
import type { z } from "zod";
import { userRoute } from "@/lib/api/route";
import type { SessionUser } from "@/lib/auth/token";
import { aiErrorResponse } from "./guard";
import { cacheKey, createAnswerCache } from "./cache";
import { getModel } from "./provider";
import { aiCallSettings, type AiTask } from "./settings";

export type StreamPrompt = { system: string } & ({ prompt: string } | { messages: ModelMessage[] });

interface StreamOptions<T> {
  task: AiTask;
  /** Cache answers that depend only on the request (not on the user's private data). */
  cacheable?: boolean;
  build: (input: T, ctx: { user: SessionUser }) => StreamPrompt | Promise<StreamPrompt>;
}

const answers = createAnswerCache();
const TEXT_HEADERS = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } as const;

/**
 * Builds a POST handler that authenticates, rate-limits per user and validates the body,
 * then streams the model's answer to the prompt produced by `build`.
 */
export function createStreamingHandler<T>(schema: z.ZodType<T>, { task, cacheable, build }: StreamOptions<T>) {
  return userRoute({ body: schema, rateLimit: true }, async ({ request, body, user }) => {
    const key = cacheable ? cacheKey(task, body) : undefined;
    const hit = key && answers.get(key);
    if (hit) return new Response(hit, { headers: { ...TEXT_HEADERS, "X-Cache": "HIT" } });

    try {
      const { model } = getModel();
      const result = streamText({
        model,
        ...(await build(body, { user })),
        ...aiCallSettings(request, task),
        onError: ({ error }) => console.error("[ai:stream]", error),
        onFinish: ({ text, finishReason }) => {
          if (key && finishReason === "stop" && text.trim()) answers.set(key, text);
        },
      });
      return result.toTextStreamResponse({ headers: TEXT_HEADERS });
    } catch (error) {
      return aiErrorResponse(error);
    }
  });
}
