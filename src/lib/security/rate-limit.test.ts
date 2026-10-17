import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows up to the limit, then blocks with a retry hint", () => {
    let t = 0;
    const check = createRateLimiter(2, 60_000, () => t);

    expect(check("a")).toMatchObject({ allowed: true, remaining: 1 });
    expect(check("a")).toMatchObject({ allowed: true, remaining: 0 });
    t = 15_000;
    expect(check("a")).toEqual({ allowed: false, remaining: 0, retryAfter: 45 });
  });

  it("tracks clients independently", () => {
    const check = createRateLimiter(1, 60_000, () => 0);
    expect(check("a").allowed).toBe(true);
    expect(check("b").allowed).toBe(true);
    expect(check("a").allowed).toBe(false);
  });

  it("resets after the window passes", () => {
    let t = 0;
    const check = createRateLimiter(1, 1_000, () => t);
    check("a");
    expect(check("a").allowed).toBe(false);
    t = 1_000;
    expect(check("a").allowed).toBe(true);
  });
});
