import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { GrievanceView } from "@/features/grievance/GrievanceView";

export const metadata: Metadata = { title: "Complaint drafter" };

export default function Page() {
  return (
    <>
      <PageIntro title="grievance.title" desc="grievance.desc" />
      <GrievanceView />
    </>
  );
}
