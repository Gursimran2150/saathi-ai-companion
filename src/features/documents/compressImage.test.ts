import { afterEach, describe, expect, it, vi } from "vitest";
import { compressImage, fitWithin } from "./compressImage";

describe("fitWithin", () => {
  it("scales the longest side down to the limit, keeping aspect ratio", () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(1000, 3200, 1600)).toEqual({ width: 500, height: 1600 });
  });

  it("never upscales small images", () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });
});

describe("compressImage", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("passes PDFs through untouched", async () => {
    const pdf = new File(["%PDF-1.4"], "notice.pdf", { type: "application/pdf" });
    const bitmap = vi.fn();
    vi.stubGlobal("createImageBitmap", bitmap);
    expect(await compressImage(pdf)).toBe(pdf);
    expect(bitmap).not.toHaveBeenCalled();
  });

  it("falls back to the original image when decoding fails", async () => {
    const img = new File(["not really a jpeg"], "photo.jpg", { type: "image/jpeg" });
    vi.stubGlobal("createImageBitmap", vi.fn().mockRejectedValue(new Error("decode")));
    expect(await compressImage(img)).toBe(img);
  });
});
