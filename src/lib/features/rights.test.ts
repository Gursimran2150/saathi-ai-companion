import { describe, expect, it } from "vitest";
import { RIGHTS, rightsContext } from "@/data/rights";
import { byPlatform, type EarningEntry } from "./earnings";
import { grievancePrompt, rightsPrompt } from "./prompts";
import { RIGHTS_TOPICS, rightsRequestSchema } from "./requests";

const entry = (over: Partial<EarningEntry>): EarningEntry => ({
  id: "1",
  date: "2026-10-15",
  platform: "Swiggy",
  trips: 10,
  hours: 5,
  gross: 1000,
  expenses: [],
  note: null,
  ...over,
});

describe("rights assistant", () => {
  it("has curated data for every selectable topic", () => {
    expect(RIGHTS.map((r) => r.id).sort()).toEqual([...RIGHTS_TOPICS].sort());
  });

  it("grounds answers on the curated laws and legal-aid helpline", () => {
    const p = rightsPrompt({ question: "Account blocked", topic: "deactivation", language: "ta" });
    expect(p.system).toContain(rightsContext());
    expect(p.system).toContain("15100");
    expect(p.system).toContain("Tamil");
    expect("prompt" in p && p.prompt).toContain("<user_input>");
  });

  it("validates topic and question", () => {
    expect(rightsRequestSchema.safeParse({ question: "help", topic: "wages" }).success).toBe(true);
    expect(rightsRequestSchema.safeParse({ question: "help", topic: "tax" }).success).toBe(false);
    expect(rightsRequestSchema.safeParse({ question: "" }).success).toBe(false);
  });
});

describe("connected flows", () => {
  it("adds an uploaded document's summary to the complaint as evidence", () => {
    const p = grievancePrompt({
      issueType: "account_deactivation",
      against: "Uber",
      details: "Blocked",
      documentEvidence: "Notice says account suspended on 12 Oct",
      attachEarnings: false,
      language: "en",
    });
    expect("prompt" in p && p.prompt).toContain("Notice says account suspended");
  });
});

describe("byPlatform", () => {
  it("ranks platforms by take-home per hour", () => {
    const stats = byPlatform([
      entry({ id: "a", platform: "Swiggy", gross: 1000, hours: 10, trips: 20 }),
      entry({
        id: "b",
        platform: "Zomato",
        gross: 900,
        hours: 5,
        trips: 15,
        expenses: [{ label: "fuel", amount: 100 }],
      }),
      entry({ id: "c", platform: null, gross: 300, hours: null, trips: null }),
    ]);
    expect(stats.map((s) => s.platform)).toEqual(["Zomato", "Swiggy", "Other"]);
    expect(stats[0]).toMatchObject({ net: 800, netPerHour: 160, netPerTrip: 53 });
    expect(stats[2]).toMatchObject({ netPerHour: null, netPerTrip: null });
  });
});
