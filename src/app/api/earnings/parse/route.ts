import { generateText, Output } from "ai";
import { aiErrorResponse, enforceRateLimit } from "@/lib/ai/guard";
import { wrapUserInput } from "@/lib/ai/prompts";
import { getModel } from "@/lib/ai/provider";
import { extractedEarningSchema } from "@/lib/features/earnings";
import { earningsParsePrompt } from "@/lib/features/prompts";
import { earningsParseRequestSchema } from "@/lib/features/requests";
import { parseJsonBody } from "@/lib/security/http";

export const maxDuration = 30;

/** Turns a free-text or spoken note into a structured earnings entry. */
export async function POST(request: Request) {
  const limited = enforceRateLimit(request);
  if (limited) return limited;

  const body = await parseJsonBody(request, earningsParseRequestSchema);
  if (!body.ok) return body.response;

  try {
    const { model } = getModel();
    const { output } = await generateText({
      model,
      system: earningsParsePrompt(body.data),
      prompt: wrapUserInput(body.data.text),
      output: Output.object({ schema: extractedEarningSchema }),
      maxRetries: 2,
      abortSignal: request.signal,
    });
    return Response.json({ entry: output }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
