import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AiResponse } from "./AiResponse";

describe("AiResponse", () => {
  it("shows the empty hint when idle", () => {
    render(<AiResponse text="" status="idle" error={null} emptyHint="Ask something" />);
    expect(screen.getByText("Ask something")).toBeInTheDocument();
  });

  it("marks the region busy while streaming", () => {
    render(<AiResponse text="" status="streaming" error={null} />);
    expect(screen.getByRole("region", { name: "AI response" })).toHaveAttribute("aria-busy", "true");
  });

  it("shows a shimmering thinking skeleton before the first token", () => {
    render(<AiResponse text="" status="streaming" error={null} thinkingLabel="Saathi is thinking…" />);
    const thinking = screen.getByTestId("ai-thinking");
    expect(thinking.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText("Saathi is thinking…")).toHaveClass("sr-only");
  });

  it("replaces the skeleton with text once tokens arrive", () => {
    render(<AiResponse text="Stay safe" status="streaming" error={null} />);
    expect(screen.queryByTestId("ai-thinking")).toBeNull();
    expect(screen.getByRole("region", { name: "AI response" })).toHaveTextContent("Stay safe");
  });

  it("renders streamed text in a live region", () => {
    render(<AiResponse text="Namaste" status="done" error={null} />);
    const region = screen.getByRole("region", { name: "AI response" });
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveAttribute("aria-busy", "false");
    expect(region).toHaveTextContent("Namaste");
  });

  it("announces errors as alerts", () => {
    render(<AiResponse text="" status="error" error="Failed" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Failed");
  });
});
