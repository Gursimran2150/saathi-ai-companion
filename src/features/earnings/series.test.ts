import { describe, expect, it } from "vitest";
import type { EarningEntry } from "@/lib/features/earnings";
import { dailyNet, formatDate, rupee } from "./series";

const entry = (date: string, gross: number, fuel = 0): EarningEntry => ({
  id: `${date}-${gross}`,
  date,
  platform: "Swiggy",
  trips: null,
  hours: null,
  gross,
  expenses: fuel ? [{ label: "fuel", amount: fuel }] : [],
  note: null,
});

describe("dailyNet", () => {
  it("returns 7 days oldest-first, summing take-home per day", () => {
    const days = dailyNet(
      [entry("2026-03-14", 900, 100), entry("2026-03-14", 200), entry("2026-03-10", 500)],
      "2026-03-14",
    );
    expect(days).toHaveLength(7);
    expect(days[0].date).toBe("2026-03-08");
    expect(days[6]).toEqual({ date: "2026-03-14", net: 1000 });
    expect(days[2]).toEqual({ date: "2026-03-10", net: 500 });
    expect(days[1].net).toBe(0);
  });

  it("ignores entries outside the window", () => {
    expect(dailyNet([entry("2026-01-01", 900)], "2026-03-14").every((d) => d.net === 0)).toBe(true);
  });
});

describe("formatting", () => {
  it("formats rupees in the Indian system", () => {
    expect(rupee(123456.4)).toBe("₹1,23,456");
  });

  it("falls back to the raw string for bad dates", () => {
    expect(formatDate("nope", "en-IN", { day: "numeric" })).toBe("nope");
  });
});
