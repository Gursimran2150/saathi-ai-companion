import { daysAgo, netEarning, type EarningEntry } from "@/lib/features/earnings";

export interface DayTotal {
  date: string;
  net: number;
}

/** Take-home per day for the `days` days ending on `today` (oldest first). One pass over the log. */
export function dailyNet(entries: readonly EarningEntry[], today: string, days = 7): DayTotal[] {
  const ref = new Date(`${today}T12:00:00`);
  const totals = new Map<string, number>();
  for (const e of entries) totals.set(e.date, (totals.get(e.date) ?? 0) + netEarning(e));
  return Array.from({ length: days }, (_, i) => {
    const date = daysAgo(days - 1 - i, ref);
    return { date, net: totals.get(date) ?? 0 };
  });
}

export const rupee = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** Short axis label such as "₹1.2K" for chart bars. */
export const compactRupee = (n: number) =>
  `₹${new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(Math.round(n))}`;

/** Localised date label, e.g. "Mon 14" or "14 Mar". Parsed at noon to avoid timezone day-shifts. */
export function formatDate(date: string, locale: string, options: Intl.DateTimeFormatOptions): string {
  const d = new Date(`${date}T12:00:00`);
  return Number.isNaN(d.getTime()) ? date : new Intl.DateTimeFormat(locale, options).format(d);
}
