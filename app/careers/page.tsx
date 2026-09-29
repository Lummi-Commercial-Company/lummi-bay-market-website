import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = { title: "Careers" };

export default function CareersPage() {
  return (
    <PageShell title="Careers">
      {/* TODO: the Careers destination is an editable link (CLAUDE.md). */}
      <p>Placeholder. Careers content goes here.</p>
    </PageShell>
  );
}
