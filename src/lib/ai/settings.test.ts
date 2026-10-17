// @vitest-environment node
import { describe, expect, it } from "vitest";
import { aiCallSettings } from "./settings";

describe("aiCallSettings", () => {
  const request = new Request("http://localhost/api/x", { method: "POST" });

  it("caps output and lowers reasoning effort for extraction", () => {
    const s = aiCallSettings(request, "extract");
    expect(s.maxOutputTokens).toBeLessThanOrEqual(1024);
    expect(s.providerOptions.google.thinkingConfig.thinkingLevel).toBe("minimal");
    expect(s.providerOptions.openai.reasoningEffort).toBe("minimal");
  });

  it("gives long-form letters a larger budget than chat", () => {
    expect(aiCallSettings(request, "grievance").maxOutputTokens).toBeGreaterThan(
      aiCallSettings(request, "chat").maxOutputTokens,
    );
  });

  it("aborts when the client disconnects", () => {
    const controller = new AbortController();
    const s = aiCallSettings(new Request("http://localhost/api/x", { signal: controller.signal }), "chat");
    expect(s.abortSignal.aborted).toBe(false);
    controller.abort();
    expect(s.abortSignal.aborted).toBe(true);
  });
});
