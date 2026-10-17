import { describe, expect, it } from "vitest";
import { chatRequestSchema, MAX_MESSAGE_LENGTH } from "./schemas";

describe("chatRequestSchema", () => {
  it("accepts a valid request and defaults the language", () => {
    expect(chatRequestSchema.parse({ message: "  hi  " })).toEqual({ message: "hi", language: "en" });
  });

  it.each([
    [{ message: "" }],
    [{ message: "   " }],
    [{ message: "x".repeat(MAX_MESSAGE_LENGTH + 1) }],
    [{ message: "hi", language: "fr" }],
    [{}],
  ])("rejects %j", (input) => {
    expect(chatRequestSchema.safeParse(input).success).toBe(false);
  });
});
