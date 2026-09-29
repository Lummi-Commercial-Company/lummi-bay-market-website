import type { Metadata } from "next";
import LocationList from "@/components/LocationList";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = { title: "Locations" };

export default function LocationsIndexPage() {
  return (
    <PageShell title="Locations">
      <p>Three Lummi Bay Market stores, plus the truck stop at Exit 260.</p>
      <LocationList />
    </PageShell>
  );
}
