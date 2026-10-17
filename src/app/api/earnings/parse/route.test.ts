// @vitest-environment node
import { MockLanguageModelV4 } from "ai/test";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getModel = vi.fn();
vi.mock("@/lib/ai/provider", () => ({ getModel: () => getModel() }));

function modelReturning(json: unknown) {
  return new MockLanguageModelV4({
    doGenerate: async () => ({
      content: [{ type: "text", text: JSON.stringify(json) }],
      finishReason: { unified: "stop", raw: undefined },
      usage: {
        inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined },
        outputTokens: { total: 1, text: 1, reasoning: undefined },
      },
      warnings: [],
    }),
  });
}

const post = (body: unknown) =>
  new Request("http://localhost/api/earnings/parse", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": `ip-${Math.random()}` },
    body: JSON.stringify(body),
  });

describe("POST /api/earnings/parse", () => {
  beforeEach(() => vi.resetModules());

  it("returns the structured entry produced by the model", async () => {
    const entry = {
      date: "2026-10-17",
      platform: "Swiggy",
      trips: 14,
      hours: 9,
      gross: 920,
      expenses: [{ label: "petrol", amount: 180 }],
      note: null,
    };
    getModel.mockReturnValue({ provider: "gemini", modelId: "mock", model: modelReturning(entry) });
    const { POST } = await import("./route");
    const res = await POST(post({ text: "aaj 14 delivery, 920 mile, petrol 180", today: "2026-10-17" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ entry });
  });

  it("returns 502 when the model output does not match the schema", async () => {
    getModel.mockReturnValue({ provider: "gemini", modelId: "mock", model: modelReturning({ gross: "lots" }) });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { POST } = await import("./route");
    const res = await POST(post({ text: "something", today: "2026-10-17" }));
    expect(res.status).toBe(502);
  });

  it("validates input before calling the model", async () => {
    const { POST } = await import("./route");
    expect((await POST(post({ text: "", today: "2026-10-17" }))).status).toBe(400);
    expect(getModel).not.toHaveBeenCalled();
  });
});
