import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <PageShell title="About">
      {/* TODO: copy-editor to write the brand story, grounded in the Lummi values with
          a light community note. LCC corporate/enterprise content stays out. */}
      <p>Placeholder. The brand story goes here.</p>
    </PageShell>
  );
}
