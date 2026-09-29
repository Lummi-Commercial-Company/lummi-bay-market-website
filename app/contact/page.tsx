import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import { getLocations, getTruckStopLocation } from "@/lib/content";

export const metadata: Metadata = { title: "Contact" };

/**
 * There is no form anywhere on the site (ADR 0015). Hours, addresses, phones and a
 * per-Location synopsis are DERIVED from Location data, never retyped here.
 * TODO: one map with a pin per Location — embed mechanism still open (ADR 0019).
 */
export default function ContactPage() {
  const locations = getLocations();
  const truckHost = getTruckStopLocation();

  return (
    <PageShell title="Contact">
      {locations.map((l) => (
        <section key={l.id}>
          <h2>{l.navLabel}</h2>
          <p>
            {l.address}
            <br />
            {l.city}, {l.state} {l.zip}
            <br />
            {l.hours}
            <br />
            {l.phoneLabel}:{" "}
            <a href={`tel:${l.phone.replace(/\D/g, "")}`}>{l.phone}</a>
            {l.id === truckHost?.id && l.truckStop ? (
              <>
                <br />
                Truck Stop:{" "}
                <a href={`tel:${l.truckStop.phone.replace(/\D/g, "")}`}>
                  {l.truckStop.phone}
                </a>
              </>
            ) : null}
          </p>
        </section>
      ))}
    </PageShell>
  );
}
