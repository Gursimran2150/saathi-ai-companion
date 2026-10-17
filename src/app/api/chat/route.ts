import { isStepCount, streamText, type ModelMessage } from "ai";
import { createChatTools } from "@/lib/ai/chat-tools";
import { userRoute } from "@/lib/api/route";
import { aiErrorResponse } from "@/lib/ai/guard";
import { buildSystemPrompt, wrapUserInput } from "@/lib/ai/prompts";
import { getModel } from "@/lib/ai/provider";
import { aiCallSettings } from "@/lib/ai/settings";
import { addChatMessages, listChat } from "@/lib/db/repo";
import { chatRequestSchema } from "@/lib/validation/schemas";

export const maxDuration = 60;

const HISTORY_TURNS = 12;

function role(name: string, today: string) {
  return [
    `You are Saathi, a warm assistant for gig and informal workers in India (delivery partners, drivers, daily-wage workers). The worker's name is ${name}. Today is ${today}.`,
    "You help with: tracking earnings, safety, rights, welfare schemes, documents and complaints.",
    "Use your tools: call logEarning whenever the worker reports a day's work or money (then confirm what was saved and the take-home); earningsSummary for questions about their income; findSchemes for schemes; rightsInfo for legal rights; helplines for emergency numbers.",
    "For uploading documents, drafting a formal complaint, or a detailed safety checklist, briefly answer and point them to the Documents, Complaint or Safety tool in the menu.",
    "Keep answers short, practical and warm. Use simple bullet points when listing steps.",
  ].join("\n");
}

export const POST = userRoute({ body: chatRequestSchema, rateLimit: true }, async ({ request, body, user }) => {
  const { message, language, today } = body;
  try {
    const history = await listChat(user.id, HISTORY_TURNS);
    const messages: ModelMessage[] = [
      ...history.map((m) => ({ role: m.role, content: m.role === "user" ? wrapUserInput(m.content) : m.content })),
      { role: "user", content: wrapUserInput(message) },
    ];

    const result = streamText({
      model: getModel().model,
      system: buildSystemPrompt({ role: role(user.name, today), language }),
      messages,
      tools: createChatTools(user.id, today),
      stopWhen: isStepCount(5),
      ...aiCallSettings(request, "chat"),
      onError: ({ error }) => console.error("[ai:chat]", error),
      onFinish: async ({ text }) => {
        if (!text.trim()) return;
        await addChatMessages(user.id, [
          { role: "user", content: message },
          { role: "assistant", content: text },
        ]).catch((error) => console.error("[chat:save]", error));
      },
    });
    return result.toTextStreamResponse({ headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return aiErrorResponse(error);
  }
});
