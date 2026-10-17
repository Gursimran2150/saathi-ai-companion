import { streamText } from "ai";
import { getModel } from "@/lib/ai/provider";
import { buildSystemPrompt, wrapUserInput } from "@/lib/ai/prompts";
import { aiErrorResponse, enforceRateLimit } from "@/lib/ai/guard";
import { parseJsonBody } from "@/lib/security/http";
import { chatRequestSchema } from "@/lib/validation/schemas";

export const maxDuration = 60;

const ROLE =
  "You are Saathi, a caring assistant for gig and informal workers in India. Help with earnings, safety, rights, welfare schemes, documents and complaints. Be practical and brief.";

export async function POST(request: Request) {
  const limited = enforceRateLimit(request);
  if (limited) return limited;

  const body = await parseJsonBody(request, chatRequestSchema);
  if (!body.ok) return body.response;
  const { message, language } = body.data;

  try {
    const { model } = getModel();
    const result = streamText({
      model,
      system: buildSystemPrompt({ role: ROLE, language }),
      prompt: wrapUserInput(message),
      maxRetries: 2,
      abortSignal: request.signal,
      onError: ({ error }) => console.error("[ai:stream]", error),
    });
    return result.toTextStreamResponse({ headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
