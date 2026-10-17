import { describe, expect, it } from "vitest";
import { documentPrompt, grievancePrompt, safetyPrompt, schemesPrompt } from "./prompts";

describe("feature prompts", () => {
  it("grounds safety advice on the verified helpline list", () => {
    const p = safetyPrompt({ workType: "delivery", situation: "night shift", language: "hi" });
    expect(p.system).toContain("1091");
    expect(p.system).toContain("Hindi");
    expect("prompt" in p && p.prompt).toContain("<user_input>");
  });

  it("only passes schemes that match the profile", () => {
    const p = schemesPrompt({ profile: { workType: "delivery", age: 55 }, language: "en" });
    expect(p.system).not.toContain("Atal Pension");
    expect(p.system).toContain("PMSBY");
  });

  it("asks for a bilingual letter in non-English languages", () => {
    const base = { issueType: "unpaid_payout", against: "Swiggy", details: "Not paid" } as const;
    expect(grievancePrompt({ ...base, language: "pa" }).system).toContain("then the same letter in English");
    expect(grievancePrompt({ ...base, language: "en" }).system).not.toContain("then the same letter in English");
  });

  it("includes earnings evidence when attached", () => {
    const p = grievancePrompt({
      issueType: "wage_theft",
      against: "Contractor",
      details: "Paid less",
      earningsEvidence: "2026-10-01 | gross ₹500",
      language: "en",
    });
    expect("prompt" in p && p.prompt).toContain("gross ₹500");
  });

  it("sends the uploaded file as a multimodal part", () => {
    const p = documentPrompt({ mediaType: "image/png", data: "aGVsbG8=", language: "en" });
    expect("messages" in p && p.messages[0].content).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "file", mediaType: "image/png" })]),
    );
  });
});
