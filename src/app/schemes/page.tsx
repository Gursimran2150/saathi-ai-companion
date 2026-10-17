import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { SchemesView } from "@/features/schemes/SchemesView";

export const metadata: Metadata = { title: "Rights & schemes" };

export default function Page() {
  return (
    <>
      <PageIntro title="schemes.title" desc="schemes.desc" />
      <SchemesView />
    </>
  );
}
