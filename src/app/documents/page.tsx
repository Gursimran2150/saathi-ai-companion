import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { DocumentsView } from "@/features/documents/DocumentsView";

export const metadata: Metadata = { title: "Document helper" };

export default function Page() {
  return (
    <>
      <PageIntro title="documents.title" desc="documents.desc" />
      <DocumentsView />
    </>
  );
}
