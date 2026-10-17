// @vitest-environment node
import { simulateReadableStream } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { beforeEach, describe, expect, it, vi } from "vitest";

function mockModel(chunks: string[]) {
  return new MockLanguageModelV4({
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          { type: "text-start", id: "t" },
          ...chunks.map((delta) => ({ type: "text-delta" as const, id: "t", delta })),
          { type: "text-end", id: "t" },
          {
            type: "finish",
            finishReason: { unified: "stop", raw: undefined },
            usage: {
              inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined },
              outputTokens: { total: 1, text: 1, reasoning: undefined },
            },
          },
        ],
      }),
    }),
  });
}

const getModel = vi.fn();
vi.mock("@/lib/ai/provider", () => ({ getModel: () => getModel() }));

function post(body: unknown, ip = "1.1.1.1") {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("RATE_LIMIT_PER_MINUTE", "3");
    getModel.mockReturnValue({ provider: "gemini", modelId: "mock", model: mockModel(["Hello", " there"]) });
  });

  it("streams the model's text", async () => {
    const { POST } = await import("./route");
    const res = await POST(post({ message: "hi", language: "hi" }));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Hello there");
  });

  it("rejects invalid JSON and invalid bodies with 400", async () => {
    const { POST } = await import("./route");
    expect((await POST(post("{not json"))).status).toBe(400);
    const res = await POST(post({ message: "" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toHaveProperty("error");
  });

  it("rate limits a client after too many requests", async () => {
    const { POST } = await import("./route");
    for (let i = 0; i < 3; i++) await POST(post({ message: "hi" }, "9.9.9.9"));
    const res = await POST(post({ message: "hi" }, "9.9.9.9"));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });

  it("returns a safe 502 when no provider is configured", async () => {
    getModel.mockImplementation(() => {
      throw new Error("secret internal detail");
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { POST } = await import("./route");
    const res = await POST(post({ message: "hi" }));
    expect(res.status).toBe(502);
    expect(JSON.stringify(await res.json())).not.toContain("secret");
  });
});
