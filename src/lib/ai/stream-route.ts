import "server-only";
import { streamText, type ModelMessage } from "ai";
import type { z } from "zod";
import { aiAbortSignal, aiErrorResponse, enforceRateLimit } from "@/lib/ai/guard";
import { getModel } from "@/lib/ai/provider";
import { requireUser } from "@/lib/auth/session";
import type { SessionUser } from "@/lib/auth/token";
import { parseJsonBody } from "@/lib/security/http";

export type StreamPrompt = { system: string } & ({ prompt: string } | { messages: ModelMessage[] });

export interface RouteContextData {
  user: SessionUser;
}

/**
 * Builds a POST handler that authenticates, rate-limits per user, validates the body
 * with `schema`, then streams the model's answer to the prompt produced by `build`.
 */
export function createStreamingHandler<T>(
  schema: z.ZodType<T>,
  build: (input: T, ctx: RouteContextData) => StreamPrompt | Promise<StreamPrompt>,
) {
  return async function POST(request: Request): Promise<Response> {
    const auth = await requireUser(request);
    if (!auth.ok) return auth.response;

    const limited = enforceRateLimit(request, auth.user.id);
    if (limited) return limited;

    const body = await parseJsonBody(request, schema);
    if (!body.ok) return body.response;

    try {
      const { model } = getModel();
      const prompt = await build(body.data, { user: auth.user });
      const result = streamText({
        model,
        ...prompt,
        maxRetries: 2,
        abortSignal: aiAbortSignal(request),
        onError: ({ error }) => console.error("[ai:stream]", error),
      });
      return result.toTextStreamResponse({ headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      return aiErrorResponse(error);
    }
  };
}
