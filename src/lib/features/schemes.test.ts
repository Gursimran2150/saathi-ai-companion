import { describe, expect, it } from "vitest";
import { describeProfile, matchSchemes, schemesContext } from "./schemes";

const ids = (profile: Parameters<typeof matchSchemes>[0]) => matchSchemes(profile).map((s) => s.id);

describe("matchSchemes", () => {
  it("keeps every age-agnostic scheme when nothing is known", () => {
    expect(ids({ workType: "delivery" })).toEqual(
      expect.arrayContaining(["e-shram", "pm-sym", "apy", "pmjjby", "pmsby", "pm-jay", "ss-code"]),
    );
  });

  it("drops pension schemes above age 40 and income limit", () => {
    const result = ids({ workType: "driver", age: 45, monthlyIncome: 20000 });
    expect(result).not.toContain("pm-sym");
    expect(result).not.toContain("apy");
    expect(result).toContain("pmjjby");
  });

  it("excludes PM-SYM when income is above ₹15,000", () => {
    expect(ids({ workType: "delivery", age: 25, monthlyIncome: 16000 })).not.toContain("pm-sym");
    expect(ids({ workType: "delivery", age: 25, monthlyIncome: 15000 })).toContain("pm-sym");
  });

  it("excludes e-Shram for taxpayers and EPFO/ESIC members", () => {
    expect(ids({ workType: "delivery", isTaxpayer: true })).not.toContain("e-shram");
    expect(ids({ workType: "delivery", hasEpfoEsic: true })).not.toContain("e-shram");
  });

  it("shows work-type specific schemes only to that work type", () => {
    expect(ids({ workType: "street_vendor" })).toContain("pm-svanidhi");
    expect(ids({ workType: "delivery" })).not.toContain("pm-svanidhi");
    expect(ids({ workType: "construction" })).not.toContain("ss-code");
  });
});

describe("describeProfile / schemesContext", () => {
  it("marks unknown fields instead of assuming", () => {
    expect(describeProfile({ workType: "street_vendor" })).toContain("Age: not given");
    expect(describeProfile({ workType: "street_vendor" })).toContain("Work type: street vendor");
  });

  it("omits internal rules from the model context", () => {
    expect(schemesContext(matchSchemes({ workType: "delivery" }))).not.toContain("maxAge");
  });
});
