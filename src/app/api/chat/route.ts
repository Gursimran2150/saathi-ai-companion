import { isStepCount, streamText, type ModelMessage } from "ai";
import { createChatTools } from "@/lib/ai/chat-tools";
import { aiAbortSignal, aiErrorResponse, enforceRateLimit } from "@/lib/ai/guard";
import { buildSystemPrompt, wrapUserInput } from "@/lib/ai/prompts";
import { getModel } from "@/lib/ai/provider";
import { requireUser } from "@/lib/auth/session";
import { addChatMessages, listChat } from "@/lib/db/repo";
import { parseJsonBody } from "@/lib/security/http";
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

export async function POST(request: Request) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;
  const limited = enforceRateLimit(request, auth.user.id);
  if (limited) return limited;

  const body = await parseJsonBody(request, chatRequestSchema);
  if (!body.ok) return body.response;
  const { message, language, today } = body.data;
  const userId = auth.user.id;

  try {
    const history = await listChat(userId, HISTORY_TURNS);
    const messages: ModelMessage[] = [
      ...history.map((m) => ({ role: m.role, content: m.role === "user" ? wrapUserInput(m.content) : m.content })),
      { role: "user", content: wrapUserInput(message) },
    ];

    const { model } = getModel();
    const result = streamText({
      model,
      system: buildSystemPrompt({ role: role(auth.user.name, today), language }),
      messages,
      tools: createChatTools(userId, today),
      stopWhen: isStepCount(5),
      maxRetries: 2,
      abortSignal: aiAbortSignal(request),
      onError: ({ error }) => console.error("[ai:chat]", error),
      onFinish: async ({ text }) => {
        if (text.trim()) {
          await addChatMessages(userId, [
            { role: "user", content: message },
            { role: "assistant", content: text },
          ]).catch((error) => console.error("[chat:save]", error));
        }
      },
    });
    return result.toTextStreamResponse({ headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
