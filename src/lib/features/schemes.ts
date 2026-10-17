import { SCHEMES, type Scheme } from "@/data/schemes";
import type { Profile } from "@/lib/profile";

/**
 * Deterministic pre-filter: drops schemes the profile clearly fails.
 * Unknown profile fields never exclude a scheme.
 */
export function matchSchemes(profile: Profile, schemes: readonly Scheme[] = SCHEMES): Scheme[] {
  return schemes.filter(({ rules }) => {
    const { age, monthlyIncome, isTaxpayer, hasEpfoEsic, workType } = profile;
    if (age !== undefined && rules.minAge !== undefined && age < rules.minAge) return false;
    if (age !== undefined && rules.maxAge !== undefined && age > rules.maxAge) return false;
    if (monthlyIncome !== undefined && rules.maxMonthlyIncome !== undefined && monthlyIncome > rules.maxMonthlyIncome)
      return false;
    if (rules.excludeTaxpayer && isTaxpayer === true) return false;
    if (rules.excludeEpfoEsic && hasEpfoEsic === true) return false;
    if (rules.workTypes && !rules.workTypes.includes(workType)) return false;
    return true;
  });
}

export function describeProfile(profile: Profile): string {
  const unknown = "not given";
  return [
    `Work type: ${profile.workType.replace("_", " ")}`,
    `Age: ${profile.age ?? unknown}`,
    `Monthly income (₹): ${profile.monthlyIncome ?? unknown}`,
    `State: ${profile.state || unknown}`,
    `Income-tax payer: ${profile.isTaxpayer === undefined ? unknown : profile.isTaxpayer ? "yes" : "no"}`,
    `EPFO/ESIC member: ${profile.hasEpfoEsic === undefined ? unknown : profile.hasEpfoEsic ? "yes" : "no"}`,
  ].join("\n");
}

export function schemesContext(schemes: readonly Scheme[]): string {
  return JSON.stringify(
    schemes.map(({ rules: _rules, ...rest }) => rest),
    null,
    1,
  );
}
