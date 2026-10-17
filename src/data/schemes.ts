/**
 * Curated, real Government of India schemes and rights for informal and gig workers.
 * The AI is grounded on this data only, so it cannot invent schemes or links.
 */
export interface Scheme {
  id: string;
  name: string;
  summary: string;
  benefits: string;
  eligibility: string;
  howToApply: string;
  link: string;
  rules: {
    minAge?: number;
    maxAge?: number;
    maxMonthlyIncome?: number;
    excludeTaxpayer?: boolean;
    excludeEpfoEsic?: boolean;
    workTypes?: readonly string[];
  };
}

export const SCHEMES: readonly Scheme[] = [
  {
    id: "e-shram",
    name: "e-Shram registration",
    summary: "National database of unorganised workers. Registration gives you a Universal Account Number (UAN) card.",
    benefits:
      "Free e-Shram card (UAN) that is used to reach social security and welfare schemes, including in emergencies.",
    eligibility: "Unorganised or gig worker aged 16 to 59, not a member of EPFO or ESIC, and not an income-tax payer.",
    howToApply:
      "Self-register free at eshram.gov.in with Aadhaar, an Aadhaar-linked mobile number and a bank account, or visit a Common Service Centre (CSC). Helpline 14434.",
    link: "https://eshram.gov.in",
    rules: { minAge: 16, maxAge: 59, excludeTaxpayer: true, excludeEpfoEsic: true },
  },
  {
    id: "pm-sym",
    name: "PM Shram Yogi Maan-dhan (PM-SYM)",
    summary: "Voluntary pension scheme for unorganised workers.",
    benefits:
      "Assured pension of ₹3,000 per month after age 60. You pay ₹55 to ₹200 a month depending on joining age, and the government adds an equal amount.",
    eligibility:
      "Aged 18 to 40, monthly income ₹15,000 or less, not a member of EPFO, ESIC or NPS, and not an income-tax payer.",
    howToApply: "Enrol at a Common Service Centre or online at maandhan.in with Aadhaar and a savings bank account.",
    link: "https://maandhan.in",
    rules: { minAge: 18, maxAge: 40, maxMonthlyIncome: 15000, excludeTaxpayer: true, excludeEpfoEsic: true },
  },
  {
    id: "apy",
    name: "Atal Pension Yojana (APY)",
    summary: "Pension scheme through your bank or post office account.",
    benefits: "Guaranteed pension of ₹1,000 to ₹5,000 per month after age 60, depending on your contribution.",
    eligibility: "Aged 18 to 40 with a savings bank or post office account. Not open to income-tax payers.",
    howToApply: "Fill the APY form at your bank or post office branch, or through your bank's net banking or app.",
    link: "https://www.jansuraksha.gov.in",
    rules: { minAge: 18, maxAge: 40, excludeTaxpayer: true },
  },
  {
    id: "pmjjby",
    name: "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
    summary: "Low-cost life insurance through your bank account.",
    benefits: "₹2 lakh life cover for death due to any reason, for a premium of ₹436 per year auto-debited.",
    eligibility: "Aged 18 to 50 with a savings bank or post office account.",
    howToApply: "Give consent at your bank or post office, or enrol through your bank's app or net banking.",
    link: "https://www.jansuraksha.gov.in",
    rules: { minAge: 18, maxAge: 50 },
  },
  {
    id: "pmsby",
    name: "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
    summary: "Accident insurance for ₹20 a year.",
    benefits: "₹2 lakh for accidental death or full disability, ₹1 lakh for partial disability. Premium ₹20 per year.",
    eligibility: "Aged 18 to 70 with a savings bank or post office account.",
    howToApply: "Give consent at your bank or post office, or enrol through your bank's app or net banking.",
    link: "https://www.jansuraksha.gov.in",
    rules: { minAge: 18, maxAge: 70 },
  },
  {
    id: "pm-jay",
    name: "Ayushman Bharat PM-JAY",
    summary: "Free hospital treatment for eligible families.",
    benefits: "Health cover up to ₹5 lakh per family per year for hospital treatment at empanelled hospitals.",
    eligibility:
      "Families listed under the scheme's deprivation and occupation criteria, and all citizens aged 70 and above. Check your name online.",
    howToApply: "Check eligibility and get an Ayushman card at beneficiary.nha.gov.in or at an empanelled hospital.",
    link: "https://beneficiary.nha.gov.in",
    rules: {},
  },
  {
    id: "pm-svanidhi",
    name: "PM SVANidhi",
    summary: "Small working-capital loans for street vendors.",
    benefits: "Collateral-free loans in steps, with interest subsidy and cashback on digital payments.",
    eligibility: "Street vendors with a vending certificate or a letter of recommendation from the local body.",
    howToApply: "Apply online at pmsvanidhi.mohua.gov.in or through a Common Service Centre.",
    link: "https://pmsvanidhi.mohua.gov.in",
    rules: { workTypes: ["street_vendor"] },
  },
  {
    id: "ss-code",
    name: "Code on Social Security, 2020: gig and platform worker rights",
    summary: "The first Indian law that recognises gig and platform workers.",
    benefits:
      "Provides for social security schemes for gig and platform workers (life and disability cover, accident insurance, health and maternity benefits, old-age protection), funded partly by aggregator contributions.",
    eligibility: "Gig and platform workers, such as delivery partners and app-based drivers.",
    howToApply: "Register on e-Shram so you can be covered as schemes under the Code are rolled out.",
    link: "https://labour.gov.in",
    rules: { workTypes: ["delivery", "driver"] },
  },
];
