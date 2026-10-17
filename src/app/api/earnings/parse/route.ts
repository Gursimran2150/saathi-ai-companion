import { generateText, Output } from "ai";
import { userRoute } from "@/lib/api/route";
import { aiErrorResponse } from "@/lib/ai/guard";
import { wrapUserInput } from "@/lib/ai/prompts";
import { getModel } from "@/lib/ai/provider";
import { aiCallSettings } from "@/lib/ai/settings";
import { extractedEarningSchema } from "@/lib/features/earnings";
import { earningsParsePrompt } from "@/lib/features/prompts";
import { earningsParseRequestSchema } from "@/lib/features/requests";

export const maxDuration = 30;

/** Turns a free-text or spoken note into a structured earnings entry. */
export const POST = userRoute({ body: earningsParseRequestSchema, rateLimit: true }, async ({ request, body }) => {
  try {
    const { output } = await generateText({
      model: getModel().model,
      system: earningsParsePrompt(body),
      prompt: wrapUserInput(body.text),
      output: Output.object({ schema: extractedEarningSchema }),
      ...aiCallSettings(request, "extract"),
    });
    return Response.json({ entry: output }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return aiErrorResponse(error);
  }
});
