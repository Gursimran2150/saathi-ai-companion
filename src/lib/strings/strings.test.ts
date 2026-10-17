import { describe, expect, it } from "vitest";
import { LANGUAGE_CODES } from "@/lib/i18n";
import { en } from "./en";
import { STRINGS, translate } from "./index";

describe("UI translations", () => {
  const keys = Object.keys(en).sort();

  it.each(LANGUAGE_CODES)("%s has every key, with non-empty text", (code) => {
    const dict = STRINGS[code];
    expect(Object.keys(dict).sort()).toEqual(keys);
    for (const key of keys) expect(dict[key as keyof typeof en].trim(), `${code}:${key}`).not.toBe("");
  });

  it("translates by language", () => {
    expect(translate("en", "nav.home")).toBe("Home");
    expect(translate("hi", "app.name")).toBe("साथी");
  });
});
