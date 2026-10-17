import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const money = z.number().min(0).max(1_000_000);

/** Shape the model must extract from a worker's free-text note. Nullable, not optional, for strict JSON modes. */
export const extractedEarningSchema = z.object({
  date: isoDate.describe("Date of work, YYYY-MM-DD"),
  platform: z.string().max(60).nullable().describe("App or employer, e.g. Swiggy, Uber, site contractor"),
  trips: z.number().int().min(0).max(1000).nullable().describe("Deliveries, rides or tasks completed"),
  hours: z.number().min(0).max(24).nullable().describe("Hours worked"),
  gross: money.describe("Total money earned before expenses, in rupees"),
  expenses: z
    .array(z.object({ label: z.string().max(40), amount: money }))
    .max(20)
    .describe("Costs such as fuel, food, phone recharge, commission"),
  note: z.string().max(200).nullable().describe("Anything else important, e.g. tips, incentives, unpaid amount"),
});

export type ExtractedEarning = z.infer<typeof extractedEarningSchema>;

export const earningEntrySchema = extractedEarningSchema.extend({ id: z.string().min(1).max(64) });
export type EarningEntry = z.infer<typeof earningEntrySchema>;

export function totalExpenses(entry: Pick<EarningEntry, "expenses">): number {
  return entry.expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function netEarning(entry: Pick<EarningEntry, "gross" | "expenses">): number {
  return entry.gross - totalExpenses(entry);
}

interface EarningsSummary {
  days: number;
  gross: number;
  expenses: number;
  net: number;
  trips: number;
  hours: number;
  avgNetPerDay: number;
  avgNetPerHour: number | null;
}

/** Totals for entries on or after `since` (YYYY-MM-DD), computed in a single pass. */
export function summarize(entries: readonly EarningEntry[], since?: string): EarningsSummary {
  let gross = 0;
  let expenses = 0;
  let hours = 0;
  let trips = 0;
  const dates = new Set<string>();
  for (const e of entries) {
    if (since && e.date < since) continue;
    gross += e.gross;
    expenses += totalExpenses(e);
    hours += e.hours ?? 0;
    trips += e.trips ?? 0;
    dates.add(e.date);
  }
  const days = dates.size;
  const net = gross - expenses;
  return {
    days,
    gross,
    expenses,
    net,
    trips,
    hours,
    avgNetPerDay: days ? Math.round(net / days) : 0,
    avgNetPerHour: hours ? Math.round(net / hours) : null,
  };
}

export function daysAgo(n: number, from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return toIsoDate(d);
}

export function toIsoDate(d: Date): string {
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Compact text form of the log for prompts (keeps tokens low). */
export function formatLogForPrompt(entries: readonly EarningEntry[], limit = 60): string {
  return [...entries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
    .map((e) => {
      const exp = e.expenses.map((x) => `${x.label} ₹${x.amount}`).join(", ") || "none";
      return `${e.date} | ${e.platform ?? "-"} | trips ${e.trips ?? "-"} | hours ${e.hours ?? "-"} | gross ₹${e.gross} | expenses: ${exp} | net ₹${netEarning(e)}${e.note ? ` | note: ${e.note}` : ""}`;
    })
    .join("\n");
}

export interface PlatformStats {
  platform: string;
  days: number;
  trips: number;
  hours: number;
  net: number;
  netPerTrip: number | null;
  netPerHour: number | null;
}

/** Take-home grouped by platform, best net-per-hour first, so workers can compare apps. O(n) grouping. */
export function byPlatform(entries: readonly EarningEntry[]): PlatformStats[] {
  const groups = new Map<string, EarningEntry[]>();
  for (const e of entries) {
    const key = e.platform?.trim() || "Other";
    const list = groups.get(key);
    if (list) list.push(e);
    else groups.set(key, [e]);
  }
  return Array.from(groups, ([platform, list]) => {
    const s = summarize(list);
    return {
      platform,
      days: s.days,
      trips: s.trips,
      hours: s.hours,
      net: s.net,
      netPerTrip: s.trips ? Math.round(s.net / s.trips) : null,
      netPerHour: s.avgNetPerHour,
    };
  }).sort((a, b) => (b.netPerHour ?? -Infinity) - (a.netPerHour ?? -Infinity) || b.net - a.net);
}
