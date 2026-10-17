import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { SafetyView } from "@/features/safety/SafetyView";

export const metadata: Metadata = { title: "Safety coach" };

export default function Page() {
  return (
    <>
      <PageIntro title="safety.title" desc="safety.desc" />
      <SafetyView />
    </>
  );
}
