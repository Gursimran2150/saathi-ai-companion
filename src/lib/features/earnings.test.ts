import { describe, expect, it } from "vitest";
import {
  daysAgo,
  formatLogForPrompt,
  isEarningsLog,
  netEarning,
  summarize,
  toIsoDate,
  type EarningEntry,
} from "./earnings";

const entry = (over: Partial<EarningEntry>): EarningEntry => ({
  id: "1",
  date: "2026-10-15",
  platform: "Swiggy",
  trips: 10,
  hours: 8,
  gross: 1000,
  expenses: [{ label: "fuel", amount: 200 }],
  note: null,
  ...over,
});

describe("earnings math", () => {
  it("computes net as gross minus all expenses", () => {
    expect(
      netEarning(
        entry({
          expenses: [
            { label: "a", amount: 100 },
            { label: "b", amount: 50 },
          ],
        }),
      ),
    ).toBe(850);
  });

  it("summarizes a range with per-day and per-hour averages", () => {
    const log = [
      entry({ id: "1", date: "2026-10-10" }),
      entry({ id: "2", date: "2026-10-15" }),
      entry({ id: "3", date: "2026-10-15", gross: 400, expenses: [], hours: 2 }),
    ];
    const s = summarize(log, "2026-10-12");
    expect(s).toMatchObject({ days: 1, gross: 1400, expenses: 200, net: 1200, hours: 10, avgNetPerDay: 1200 });
    expect(s.avgNetPerHour).toBe(120);
  });

  it("returns null per-hour when hours are unknown", () => {
    expect(summarize([entry({ hours: null })]).avgNetPerHour).toBeNull();
    expect(summarize([]).avgNetPerDay).toBe(0);
  });
});

describe("dates", () => {
  it("formats local dates and subtracts days across months", () => {
    const ref = new Date(2026, 9, 2, 12);
    expect(toIsoDate(ref)).toBe("2026-10-02");
    expect(daysAgo(3, ref)).toBe("2026-09-29");
  });
});

describe("log helpers", () => {
  it("validates stored logs", () => {
    expect(isEarningsLog([entry({})])).toBe(true);
    expect(isEarningsLog([{ date: "x" }])).toBe(false);
    expect(isEarningsLog("nope")).toBe(false);
  });

  it("formats newest first with net values", () => {
    const text = formatLogForPrompt([entry({ id: "a", date: "2026-10-01" }), entry({ id: "b", date: "2026-10-05" })]);
    expect(text.split("\n")[0]).toContain("2026-10-05");
    expect(text).toContain("net ₹800");
  });
});
