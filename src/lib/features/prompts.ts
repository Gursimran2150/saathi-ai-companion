import type { z } from "zod";
import { helplinesContext } from "@/data/helplines";
import { rightsContext } from "@/data/rights";
import { buildSystemPrompt, wrapUserInput } from "@/lib/ai/prompts";
import type { StreamPrompt } from "@/lib/ai/stream-route";
import { byPlatform, daysAgo, formatLogForPrompt, summarize } from "@/lib/features/earnings";
import type {
  documentRequestSchema,
  earningsInsightsRequestSchema,
  earningsParseRequestSchema,
  grievanceRequestSchema,
  rightsRequestSchema,
  safetyRequestSchema,
  schemesRequestSchema,
} from "@/lib/features/requests";
import { describeProfile, matchSchemes, schemesContext } from "@/lib/features/schemes";
import { getLanguage } from "@/lib/i18n";

const PERSONA =
  "You are Saathi, a caring assistant for gig and informal workers in India (delivery partners, drivers, daily-wage workers).";

export function earningsParsePrompt({ today, language }: z.infer<typeof earningsParseRequestSchema>) {
  return buildSystemPrompt({
    role: `${PERSONA} Extract one day's earnings record from the worker's note. Today is ${today}. Resolve words like "today", "aaj", "kal"/"yesterday" to dates. Amounts are in rupees. Put fuel, food, commission, recharge, rent etc. in expenses. Use null when a value is not mentioned. Never invent numbers. Write the note field in ${getLanguage(language).label}.`,
    language,
  });
}

export function earningsInsightsPrompt({
  entries,
  today,
  language,
}: z.infer<typeof earningsInsightsRequestSchema>): StreamPrompt {
  const week = summarize(entries, daysAgo(6, new Date(`${today}T12:00:00`)));
  const all = summarize(entries);
  return {
    system: buildSystemPrompt({
      role: `${PERSONA} Analyse the worker's earnings log and give: (1) a 2-line summary of how they are doing, (2) which platform or kind of day pays best per hour and per trip, if the data shows it, (3) 3 specific, practical tips to increase take-home pay or cut costs, based only on patterns in the data, (4) one warning if anything looks wrong (e.g. very low hourly pay, rising fuel cost, unpaid amounts). Use short bullet points. Quote real numbers from the data.`,
      language,
    }),
    prompt: `Today: ${today}\nLast 7 days: ${JSON.stringify(week)}\nAll time: ${JSON.stringify(all)}\nBy platform: ${JSON.stringify(byPlatform(entries))}\n\nLog (newest first):\n${formatLogForPrompt(entries)}`,
  };
}

export function safetyPrompt({ workType, situation, language }: z.infer<typeof safetyRequestSchema>): StreamPrompt {
  return {
    system: buildSystemPrompt({
      role: `${PERSONA} Give safety guidance for a ${workType.replace("_", " ")} worker. Reply with: a one-line most important action, then a short checklist (max 7 points) of practical steps, then which helpline to call if it is an emergency. If the situation sounds like immediate danger, say to call 112 first. Only use helpline numbers from the reference data.`,
      language,
      context: helplinesContext(),
    }),
    prompt: wrapUserInput(situation),
  };
}

export function schemesPrompt({ profile, question, language }: z.infer<typeof schemesRequestSchema>): StreamPrompt {
  const matched = matchSchemes(profile);
  return {
    system: buildSystemPrompt({
      role: `${PERSONA} Explain which welfare schemes and rights fit this worker. For each relevant scheme: why it fits (or what to check), the main benefit, and exact steps to apply with the official link. Start with the most useful one. If a profile detail is "not given", say what they should check. Keep it simple and short.`,
      language,
      context: schemesContext(matched),
    }),
    prompt: `Worker profile:\n${describeProfile(profile)}\n\n${wrapUserInput(question || "Which schemes should I apply for, and how?")}`,
  };
}

export function documentPrompt({
  mediaType,
  data,
  question,
  language,
}: z.infer<typeof documentRequestSchema>): StreamPrompt {
  return {
    system: buildSystemPrompt({
      role: `${PERSONA} The worker uploaded a document (notice, contract, payslip, form, ID, bill). Explain it in very simple words: 1) what this document is, 2) the key points (amounts, dates, names), 3) any deadline or risk, 4) what they should do next. If a form, explain how to fill each important field. If the image is unreadable or not a document, say so. Do not repeat full ID, Aadhaar or bank numbers; mask them.`,
      language,
    }),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: wrapUserInput(question || "Please explain this document.") },
          { type: "file", mediaType, data },
        ],
      },
    ],
  };
}

export function grievancePrompt(input: z.infer<typeof grievanceRequestSchema>): StreamPrompt {
  const lang = getLanguage(input.language);
  const bilingual = input.language !== "en";
  const facts = [
    `Issue type: ${input.issueType.replaceAll("_", " ")}`,
    `Complaint against: ${input.against}`,
    `Worker name: ${input.workerName || "[Your name]"}`,
  ].join("\n");
  return {
    system: buildSystemPrompt({
      role: `${PERSONA} Draft a formal, polite but firm complaint the worker can send. Structure: Subject line, To (suggest the right recipient: the platform's grievance officer/support, and as escalation the local Labour Commissioner, or police/cyber cell 1930 if relevant), body with facts in order, the specific resolution requested with a deadline (e.g. 7 days), and sign-off. Use only facts provided; put placeholders like [Date] or [Partner ID] for anything missing. ${bilingual ? `Write the full letter in ${lang.label} first, then a line "---", then the same letter in English.` : "Write it in English."} After the letter, add 2 short tips on where to send it and what proof to attach.`,
      language: input.language,
    }),
    prompt: `${facts}\n\nWhat happened:\n${wrapUserInput(input.details)}${input.earningsEvidence ? `\n\nEarnings records from the worker's log (evidence):\n${wrapUserInput(input.earningsEvidence)}` : ""}${input.documentEvidence ? `\n\nSummary of a related document the worker uploaded (evidence):\n${wrapUserInput(input.documentEvidence)}` : ""}`,
  };
}

export function rightsPrompt({ topic, question, state, language }: z.infer<typeof rightsRequestSchema>): StreamPrompt {
  return {
    system: buildSystemPrompt({
      role: `${PERSONA} Explain the worker's rights for their problem. Structure: (1) "Your rights" in 2–4 short points, naming the law, (2) "What to do now" as numbered steps in order, (3) "Where to complain" with the exact authority and helpline. Use only the reference data. If the law depends on the state, say so and name the state rule only if it is in the reference data. End with: this is general information, not legal advice; for free legal help call 15100.`,
      language,
      context: rightsContext(),
    }),
    prompt: `${topic ? `Topic: ${topic}\n` : ""}State: ${state || "not given"}\n\n${wrapUserInput(question)}`,
  };
}
