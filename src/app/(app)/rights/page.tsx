import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { RightsView } from "@/features/rights/RightsView";

export const metadata: Metadata = { title: "Know your rights" };

export default function Page() {
  return (
    <>
      <PageIntro title="rights.title" desc="rights.desc" />
      <RightsView />
    </>
  );
}
