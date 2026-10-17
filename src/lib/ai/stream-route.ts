import "server-only";
import { streamText, type ModelMessage } from "ai";
import type { z } from "zod";
import { aiErrorResponse, enforceRateLimit } from "@/lib/ai/guard";
import { getModel } from "@/lib/ai/provider";
import { parseJsonBody } from "@/lib/security/http";

export type StreamPrompt = { system: string } & ({ prompt: string } | { messages: ModelMessage[] });

/**
 * Builds a POST handler that rate-limits, validates the body with `schema`,
 * then streams the model's answer to the prompt produced by `build`.
 */
export function createStreamingHandler<T>(schema: z.ZodType<T>, build: (input: T) => StreamPrompt) {
  return async function POST(request: Request): Promise<Response> {
    const limited = enforceRateLimit(request);
    if (limited) return limited;

    const body = await parseJsonBody(request, schema);
    if (!body.ok) return body.response;

    try {
      const { model } = getModel();
      const result = streamText({
        model,
        ...build(body.data),
        maxRetries: 2,
        abortSignal: request.signal,
        onError: ({ error }) => console.error("[ai:stream]", error),
      });
      return result.toTextStreamResponse({ headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      return aiErrorResponse(error);
    }
  };
}
