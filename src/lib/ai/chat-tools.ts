import "server-only";
import { tool } from "ai";
import { z } from "zod";
import { HELPLINES } from "@/data/helplines";
import { RIGHTS } from "@/data/rights";
import { addEarning, getProfile, listEarnings } from "@/lib/db/repo";
import { byPlatform, daysAgo, extractedEarningSchema, netEarning, summarize } from "@/lib/features/earnings";
import { RIGHTS_TOPICS } from "@/lib/features/requests";
import { matchSchemes } from "@/lib/features/schemes";

/**
 * Tools the assistant can call on behalf of the logged-in worker.
 * Every tool is scoped to `userId`; the model never chooses whose data it touches.
 */
export function createChatTools(userId: string, today: string) {
  return {
    logEarning: tool({
      description:
        "Save one day's earnings when the worker reports work done or money earned (e.g. 'aaj 14 delivery, 920 mile, petrol 180'). Use null for anything not mentioned. Never invent numbers.",
      inputSchema: extractedEarningSchema,
      execute: async (entry) => {
        const saved = await addEarning(userId, entry);
        return { saved: true, date: saved.date, gross: saved.gross, net: netEarning(saved) };
      },
    }),
    earningsSummary: tool({
      description: "Get the worker's saved earnings: last 7 days, all time, and per-platform take-home.",
      inputSchema: z.object({}),
      execute: async () => {
        const entries = await listEarnings(userId);
        const ref = new Date(`${today}T12:00:00`);
        return {
          entries: entries.length,
          last7Days: summarize(entries, daysAgo(6, ref)),
          allTime: summarize(entries),
          byPlatform: byPlatform(entries),
        };
      },
    }),
    findSchemes: tool({
      description: "List real government welfare schemes that match the worker's saved profile, with official links.",
      inputSchema: z.object({}),
      execute: async () => {
        const profile = await getProfile(userId);
        return {
          profile,
          schemes: matchSchemes(profile).map(({ rules: _rules, ...s }) => s),
        };
      },
    }),
    rightsInfo: tool({
      description: "Get verified facts about a worker's legal rights and where to complain for a topic.",
      inputSchema: z.object({ topic: z.enum(RIGHTS_TOPICS) }),
      execute: async ({ topic }) => RIGHTS.find((r) => r.id === topic),
    }),
    helplines: tool({
      description: "Get verified Indian emergency and support helpline numbers.",
      inputSchema: z.object({}),
      execute: async () => HELPLINES,
    }),
  };
}
