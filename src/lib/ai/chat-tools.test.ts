// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const addEarning = vi.fn();
const listEarnings = vi.fn();
const getProfile = vi.fn();
vi.mock("@/lib/db/repo", () => ({
  addEarning: (...a: unknown[]) => addEarning(...a),
  listEarnings: (...a: unknown[]) => listEarnings(...a),
  getProfile: (...a: unknown[]) => getProfile(...a),
}));

const { createChatTools } = await import("./chat-tools");
const opts = { toolCallId: "1", messages: [] } as never;

describe("chat tools", () => {
  beforeEach(() => vi.clearAllMocks());

  it("logEarning saves to the logged-in user only and returns take-home", async () => {
    const entry = {
      date: "2026-10-17",
      platform: "Swiggy",
      trips: 14,
      hours: 9,
      gross: 920,
      expenses: [{ label: "petrol", amount: 180 }],
      note: null,
    };
    addEarning.mockResolvedValue({ ...entry, id: "e1" });
    const tools = createChatTools("user-1", "2026-10-17");
    const result = await tools.logEarning.execute!(entry, opts);
    expect(addEarning).toHaveBeenCalledWith("user-1", entry);
    expect(result).toMatchObject({ saved: true, net: 740 });
  });

  it("earningsSummary reads that user's log", async () => {
    listEarnings.mockResolvedValue([]);
    const result = await createChatTools("user-2", "2026-10-17").earningsSummary.execute!({}, opts);
    expect(listEarnings).toHaveBeenCalledWith("user-2");
    expect(result).toMatchObject({ entries: 0 });
  });

  it("findSchemes uses the saved profile and hides internal rules", async () => {
    getProfile.mockResolvedValue({ workType: "street_vendor", age: 30 });
    const result = (await createChatTools("u", "2026-10-17").findSchemes.execute!({}, opts)) as {
      schemes: { id: string }[];
    };
    expect(result.schemes.map((s) => s.id)).toContain("pm-svanidhi");
    expect(JSON.stringify(result)).not.toContain("maxAge");
  });

  it("rightsInfo returns curated facts for a topic", async () => {
    const result = await createChatTools("u", "2026-10-17").rightsInfo.execute!({ topic: "fraud" }, opts);
    expect(JSON.stringify(result)).toContain("1930");
  });
});
