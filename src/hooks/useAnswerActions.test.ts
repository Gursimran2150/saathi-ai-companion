import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toPlainText, useCopy, useSpeak } from "./useAnswerActions";

describe("toPlainText", () => {
  it("removes bold markers", () => {
    expect(toPlainText("Call **112** now")).toBe("Call 112 now");
  });
});

describe("useCopy", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("copies plain text and resets the flag", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    const { result } = renderHook(() => useCopy("**Hi**", 1000));
    await act(() => result.current.copy());
    expect(writeText).toHaveBeenCalledWith("Hi");
    expect(result.current.copied).toBe(true);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.copied).toBe(false);
  });
});

describe("useSpeak", () => {
  it("speaks in the selected language and toggles off", () => {
    const speak = vi.fn();
    const cancel = vi.fn();
    vi.stubGlobal("speechSynthesis", { speak, cancel });
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      class {
        lang = "";
        onend: (() => void) | null = null;
        onerror: (() => void) | null = null;
        constructor(public text: string) {}
      },
    );
    const { result } = renderHook(() => useSpeak("**Namaste**", "hi"));
    act(() => result.current.toggle());
    expect(speak).toHaveBeenCalledWith(expect.objectContaining({ text: "Namaste", lang: "hi-IN" }));
    expect(result.current.speaking).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.speaking).toBe(false);
    vi.unstubAllGlobals();
  });
});
