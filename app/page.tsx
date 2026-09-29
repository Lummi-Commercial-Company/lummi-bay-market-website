import LocationList from "@/components/LocationList";
import PageShell from "@/components/PageShell";

export default function HomePage() {
  return (
    <PageShell title="Fuel, food and a place to stop.">
      <p>
        Three stores around Bellingham and Ferndale, one company. Fuel and a convenience
        store at every one, and a full truck stop at Exit 260.
      </p>
      <LocationList />
    </PageShell>
  );
}
