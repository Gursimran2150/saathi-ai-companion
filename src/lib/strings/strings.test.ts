import { describe, expect, it } from "vitest";
import { LANGUAGE_CODES } from "@/lib/i18n";
import { en } from "./en";
import { loadDictionary, translate } from "./index";

describe("UI translations", () => {
  const keys = Object.keys(en).sort();

  it.each(LANGUAGE_CODES)("%s has every key, with non-empty text", async (code) => {
    const dict = await loadDictionary(code);
    expect(Object.keys(dict).sort()).toEqual(keys);
    for (const key of keys) expect(dict[key as keyof typeof en].trim(), `${code}:${key}`).not.toBe("");
  });

  it("falls back to English while a dictionary is loading", async () => {
    expect(translate(undefined, "nav.home")).toBe("Home");
    expect(translate(await loadDictionary("hi"), "app.name")).toBe("साथी");
  });
});
