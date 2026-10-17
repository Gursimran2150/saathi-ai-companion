import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PROFILE_SAVE_DEBOUNCE_MS, useProfileEditor } from "./useProfileEditor";

const save = vi.fn<(p: unknown) => Promise<void>>();

vi.mock("@/hooks/useAppData", () => ({
  useProfile: () => ({ profile: { workType: "delivery" }, isLoading: false, save }),
}));
vi.mock("@/components/LanguageProvider", () => ({ useLanguage: () => ({ t: (k: string) => k }) }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

describe("useProfileEditor", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    save.mockReset().mockResolvedValue(undefined);
  });
  afterEach(() => vi.useRealTimers());

  it("saves discrete changes immediately", async () => {
    const { result } = renderHook(() => useProfileEditor());
    await act(async () => result.current.update({ workType: "driver" }));
    expect(save).toHaveBeenCalledWith({ workType: "driver" });
  });

  it("debounces typed changes into a single save with the latest value", async () => {
    const { result } = renderHook(() => useProfileEditor());
    act(() => result.current.update({ state: "Pun" }, { debounce: true }));
    act(() => result.current.update({ state: "Punjab" }, { debounce: true }));
    expect(save).not.toHaveBeenCalled();
    expect(result.current.profile.state).toBe("Punjab");
    await act(async () => vi.advanceTimersByTime(PROFILE_SAVE_DEBOUNCE_MS));
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith({ workType: "delivery", state: "Punjab" });
  });

  it("never sends invalid values and flags the field", async () => {
    const { result } = renderHook(() => useProfileEditor());
    act(() => result.current.update({ age: 2 }, { debounce: true }));
    await act(async () => vi.advanceTimersByTime(PROFILE_SAVE_DEBOUNCE_MS * 2));
    expect(save).not.toHaveBeenCalled();
    expect(result.current.isInvalid("age")).toBe(true);
    expect(result.current.isInvalid("state")).toBe(false);
  });

  it("flushes a pending edit on unmount", () => {
    const { result, unmount } = renderHook(() => useProfileEditor());
    act(() => result.current.update({ age: 30 }, { debounce: true }));
    unmount();
    expect(save).toHaveBeenCalledWith({ workType: "delivery", age: 30 });
  });
});
