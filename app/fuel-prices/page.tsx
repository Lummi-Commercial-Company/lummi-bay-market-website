import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { getFuelPrices } from "@/lib/content";

export const metadata: Metadata = { title: "Fuel prices" };

/**
 * Reached from the footer and the price block's "All prices" panel — never from the
 * nav. The nav stays three items (ADR 0008).
 */
export default function FuelPricesPage() {
  const fuel = getFuelPrices();
  const updated = fuel.truckStop.updated;

  return (
    <PageShell title="Fuel prices">
      <p>
        Prices for all four places are in the panel above &mdash; open &ldquo;View all
        prices&rdquo;. Regular, diesel and DEF are the grades posted here.
      </p>
      <p>Last updated {updated}. Prices subject to change.</p>
    </PageShell>
  );
}
