/**
 * Curated summaries of Indian laws, bodies and helplines relevant to gig and informal workers.
 * The rights assistant is grounded on this text only. Kept general on purpose: the AI must
 * point workers to the right authority, not give case-specific legal advice.
 */
interface RightsTopic {
  id: "deactivation" | "wages" | "accident" | "harassment" | "fraud" | "legalAid";
  title: string;
  facts: string[];
  whereToGo: string[];
}

export const RIGHTS: readonly RightsTopic[] = [
  {
    id: "deactivation",
    title: "Account blocked or deactivated by a platform",
    facts: [
      "The Code on Social Security, 2020 recognises gig and platform workers and provides for welfare schemes for them.",
      "Rajasthan's Platform Based Gig Workers (Registration and Welfare) Act, 2023 and Karnataka's Platform-based Gig Workers (Social Security and Welfare) law, 2025 give workers in those states a grievance redressal system against platforms.",
      "Platforms publish a grievance or support process in their partner app and terms. Ask for the reason in writing and keep screenshots of ratings, trips and messages.",
    ],
    whereToGo: [
      "First: the platform's in-app support / grievance officer, in writing.",
      "Then: the state Labour Department or Labour Commissioner office.",
      "Free legal advice: NALSA legal aid helpline 15100.",
    ],
  },
  {
    id: "wages",
    title: "Paid less than promised, late, or not at all",
    facts: [
      "Under the Code on Wages, 2019, wages must be paid on time and without unauthorised deductions, and no worker may be paid below the minimum wage notified by the government.",
      "Minimum wage rates differ by state and type of work; the state Labour Department publishes them.",
      "Keep a record of work done, payments received and any messages promising payment. These are your evidence.",
    ],
    whereToGo: [
      "First: a written complaint to the employer or platform.",
      "Then: the Labour Inspector / Labour Commissioner of your district or state.",
      "Free legal advice: NALSA legal aid helpline 15100.",
    ],
  },
  {
    id: "accident",
    title: "Injured while working",
    facts: [
      "Call 108 for an ambulance or 112 for any emergency. Under the Good Samaritan rules, people who help accident victims are protected from harassment.",
      "Road accident victims can claim compensation from the Motor Accidents Claims Tribunal (MACT) under the Motor Vehicles Act. Get an FIR and keep medical bills.",
      "If you are enrolled in PMSBY (₹20/year), you can claim ₹2 lakh for accidental death or full disability and ₹1 lakh for partial disability through your bank.",
      "Many delivery and ride platforms provide accident insurance to active partners. Check the insurance section in your partner app and inform the platform quickly.",
    ],
    whereToGo: [
      "Emergency: 112 or 108.",
      "Insurance claim: your bank (PMSBY) and the platform's insurance helpdesk.",
      "Compensation: Motor Accidents Claims Tribunal in your district.",
    ],
  },
  {
    id: "harassment",
    title: "Sexual harassment or abuse at work",
    facts: [
      "The Sexual Harassment of Women at Workplace Act, 2013 (POSH) covers women in the unorganised sector and domestic workers too.",
      "Women in small workplaces or informal work can complain to the Local Committee (LC) set up by the District Officer in every district.",
      "Threats or violence are crimes: you can file a police complaint (FIR).",
    ],
    whereToGo: [
      "Emergency: 112. Women helpline: 1091.",
      "Local Committee under the POSH Act, through the District Officer / District Collector office.",
      "Free legal advice: NALSA legal aid helpline 15100.",
    ],
  },
  {
    id: "fraud",
    title: "Cheated online or payment fraud",
    facts: [
      "Never share OTPs, UPI PINs or app passwords. Platforms and banks never ask for them.",
      "Report cyber or payment fraud immediately: quick reporting helps freeze the money.",
    ],
    whereToGo: [
      "Call 1930 (National Cyber Crime Helpline).",
      "Report online at cybercrime.gov.in.",
      "Inform your bank to block the account or card.",
    ],
  },
  {
    id: "legalAid",
    title: "Free legal help",
    facts: [
      "Under the Legal Services Authorities Act, 1987, free legal aid is available to workers in the unorganised sector, women, and people with low income, among others.",
      "District Legal Services Authorities (DLSA) in every district give free advice, lawyers and Lok Adalat settlements.",
    ],
    whereToGo: ["Call NALSA helpline 15100.", "Visit the District Legal Services Authority at your district court."],
  },
];

export function rightsContext(): string {
  return RIGHTS.map(
    (r) => `## ${r.title}\nFacts:\n- ${r.facts.join("\n- ")}\nWhere to go:\n- ${r.whereToGo.join("\n- ")}`,
  ).join("\n\n");
}
