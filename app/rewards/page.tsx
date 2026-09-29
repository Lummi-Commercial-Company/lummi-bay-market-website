import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = { title: "Rewards" };

export default function RewardsPage() {
  return (
    <PageShell title="Rewards">
      {/* TODO: app-promo content and the store badges. */}
      <p>Placeholder. The rewards app promo goes here.</p>
    </PageShell>
  );
}
