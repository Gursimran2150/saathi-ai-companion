import { describe, expect, it } from "vitest";
import {
  documentRequestSchema,
  earningsParseRequestSchema,
  grievanceRequestSchema,
  MAX_DOCUMENT_BYTES,
  safetyRequestSchema,
} from "./requests";

describe("request schemas", () => {
  it("validates the earnings parse request", () => {
    expect(earningsParseRequestSchema.safeParse({ text: "920 mile", today: "2026-10-17" }).success).toBe(true);
    expect(earningsParseRequestSchema.safeParse({ text: "x", today: "17/10/2026" }).success).toBe(false);
  });

  it("rejects unknown work types", () => {
    expect(safetyRequestSchema.safeParse({ workType: "pilot", situation: "x" }).success).toBe(false);
  });

  it("only accepts allowed document types within the size cap", () => {
    const ok = { mediaType: "application/pdf", data: "aGVsbG8=" };
    expect(documentRequestSchema.safeParse(ok).success).toBe(true);
    expect(documentRequestSchema.safeParse({ ...ok, mediaType: "text/html" }).success).toBe(false);
    expect(documentRequestSchema.safeParse({ ...ok, data: "<script>" }).success).toBe(false);
    const huge = "A".repeat(Math.ceil((MAX_DOCUMENT_BYTES * 4) / 3) + 8);
    expect(documentRequestSchema.safeParse({ ...ok, data: huge }).success).toBe(false);
  });

  it("requires complaint details and target", () => {
    expect(grievanceRequestSchema.safeParse({ issueType: "other", against: "", details: "x" }).success).toBe(false);
  });
});
