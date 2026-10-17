import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { EarningsView } from "@/features/earnings/EarningsView";

export const metadata: Metadata = { title: "Earnings tracker" };

export default function Page() {
  return (
    <>
      <PageIntro title="earnings.title" desc="earnings.desc" />
      <EarningsView />
    </>
  );
}
