import type { Metadata } from "next";
import LocationList from "@/components/LocationList";
import PageShell from "@/components/PageShell";
import { getTruckStopLocation } from "@/lib/content";

export const metadata: Metadata = { title: "Truck Stop" };

/**
 * The Truck Stop is a second store, not a wing of Exit 260. It shares the property and
 * nothing else — two c-stores, two fuel needs, two sets of customers.
 *
 * The price block's subject here is "truck-stop", so diesel and DEF are the first
 * numbers a driver hits (ADR 0005).
 */
export default function TruckStopPage() {
  const host = getTruckStopLocation();
  if (!host?.truckStop) return null;

  return (
    <PageShell title="Truck Stop" subject="truck-stop">
      <p>
        A dedicated stop for drivers at Exit 260, just off I-5. Diesel lanes, DEF,
        showers, a driver lounge, a driver store and truck parking.
      </p>

      <h2>Visit</h2>
      <p>
        {host.address}
        <br />
        {host.city}, {host.state} {host.zip}
        <br />
        {host.truckStop.hours}
        <br />
        Truck Stop:{" "}
        <a href={`tel:${host.truckStop.phone.replace(/\D/g, "")}`}>
          {host.truckStop.phone}
        </a>
      </p>

      <h2>What&rsquo;s here</h2>
      <ul>
        {host.truckStop.amenities.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>

      {/* Exit 260 is still listed here: the filter drops the page's SUBJECT (the
          callout), never everything at the page's street address (ADR 0009). */}
      <LocationList exclude="truck-stop" />
    </PageShell>
  );
}
