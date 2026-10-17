/** Verified national helpline numbers in India. Used in the UI and to ground safety answers. */
export const HELPLINES = [
  { number: "112", label: "All emergencies (police, fire, ambulance)" },
  { number: "108", label: "Ambulance" },
  { number: "1091", label: "Women helpline" },
  { number: "1930", label: "Cyber fraud / online payment fraud" },
  { number: "1033", label: "National highway emergency" },
  { number: "14434", label: "e-Shram helpline" },
  { number: "15100", label: "Free legal aid (NALSA)" },
] as const;

export function helplinesContext(): string {
  return HELPLINES.map((h) => `${h.number}: ${h.label}`).join("\n");
}
