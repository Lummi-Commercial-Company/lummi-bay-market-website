import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LocationList from "@/components/LocationList";
import PageShell from "@/components/PageShell";
import { getLocation, getLocations } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

/** Prerender all three Locations — static-first (CLAUDE.md). */
export function generateStaticParams() {
  return getLocations().map((l) => ({ slug: l.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocation(slug);
  return { title: location?.navLabel ?? "Location" };
}

export default async function LocationPage({ params }: Props) {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) notFound();

  return (
    <PageShell title={location.name} subject={location.id}>
      <p>{location.intro}</p>

      <h2>Visit</h2>
      <p>
        {location.address}
        <br />
        {location.city}, {location.state} {location.zip}
        <br />
        {location.hours}
        <br />
        {location.phoneLabel}:{" "}
        <a href={`tel:${location.phone.replace(/\D/g, "")}`}>{location.phone}</a>
      </p>

      <h2>What&rsquo;s here</h2>
      {/* Badges are driven by the amenities list — never hand-placed per page. */}
      <ul>
        {location.amenities.map((a) => (
          <li key={a}>{a}</li>
        ))}
      </ul>

      {/* Only the Location with a truck stop carries the summary + link (ADR 0009). */}
      {location.truckStop ? (
        <>
          <h2>Truck Stop</h2>
          <p>
            A separate store for drivers: diesel lanes, DEF, showers, a driver lounge and
            truck parking. {location.truckStop.hours}. Truck Stop:{" "}
            <a href={`tel:${location.truckStop.phone.replace(/\D/g, "")}`}>
              {location.truckStop.phone}
            </a>
            .
          </p>
          <p>
            <Link href="/truck-stop">More about the Truck Stop</Link>
          </p>
        </>
      ) : null}

      <LocationList exclude={location.id} />
    </PageShell>
  );
}
