// @vitest-environment node
import { simulateReadableStream } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { beforeEach, describe, expect, it, vi } from "vitest";

const USER = { id: "6f1c2c1e-0000-4000-8000-000000000001", name: "Asha", email: "a@b.co", isDemo: true };

const getModel = vi.fn();
const requireUser = vi.fn();
const listChat = vi.fn();
const addChatMessages = vi.fn();
vi.mock("@/lib/ai/provider", () => ({ getModel: () => getModel() }));
vi.mock("@/lib/auth/session", () => ({ requireUser: (r: Request) => requireUser(r) }));
vi.mock("@/lib/db/repo", () => ({
  listChat: (...a: unknown[]) => listChat(...a),
  addChatMessages: (...a: unknown[]) => addChatMessages(...a),
  addEarning: vi.fn(),
  listEarnings: vi.fn(),
  getProfile: vi.fn(),
}));

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

function post(body: unknown) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const valid = { message: "hi", language: "hi", today: "2026-10-17" };

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("RATE_LIMIT_PER_MINUTE", "3");
    requireUser.mockResolvedValue({ ok: true, user: USER });
    listChat.mockResolvedValue([{ id: 1, role: "assistant", content: "Earlier answer" }]);
    addChatMessages.mockResolvedValue(undefined);
    getModel.mockReturnValue({ provider: "gemini", modelId: "mock", model: mockModel(["Hello", " there"]) });
  });

  it("streams the reply and saves the turn to the user's history", async () => {
    const { POST } = await import("./route");
    const res = await POST(post(valid));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Hello there");
    await vi.waitFor(() =>
      expect(addChatMessages).toHaveBeenCalledWith(USER.id, [
        { role: "user", content: "hi" },
        { role: "assistant", content: "Hello there" },
      ]),
    );
    expect(listChat).toHaveBeenCalledWith(USER.id, expect.any(Number));
  });

  it("requires a logged-in user", async () => {
    requireUser.mockResolvedValue({ ok: false, response: new Response(null, { status: 401 }) });
    const { POST } = await import("./route");
    expect((await POST(post(valid))).status).toBe(401);
    expect(getModel).not.toHaveBeenCalled();
  });

  it("rejects invalid JSON and invalid bodies with 400", async () => {
    const { POST } = await import("./route");
    expect((await POST(post("{not json"))).status).toBe(400);
    expect((await POST(post({ ...valid, message: "" }))).status).toBe(400);
    expect((await POST(post({ ...valid, today: "17-10-2026" }))).status).toBe(400);
  });

  it("rate limits per user", async () => {
    const { POST } = await import("./route");
    for (let i = 0; i < 3; i++) await POST(post(valid));
    const res = await POST(post(valid));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });

  it("returns a safe 502 when the provider fails", async () => {
    getModel.mockImplementation(() => {
      throw new Error("secret internal detail");
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { POST } = await import("./route");
    const res = await POST(post(valid));
    expect(res.status).toBe(502);
    expect(JSON.stringify(await res.json())).not.toContain("secret");
  });
});
