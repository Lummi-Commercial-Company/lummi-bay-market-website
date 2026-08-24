import Link from "next/link";
import { notFound } from "next/navigation";
import FuelPrices from "@/components/FuelPrices";
import { priceGroupsForLocation } from "@/lib/fuel";
import { getLocations, telHref } from "@/lib/locations";
import styles from "./page.module.css";

export function generateStaticParams() {
  return getLocations().map((loc) => ({ id: loc.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const loc = getLocations().find((l) => l.id === id);
  return { title: loc ? loc.navLabel : "Location" };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const loc = getLocations().find((l) => l.id === id);
  if (!loc) notFound();

  return (
    <section className={`wrap ${styles.page}`}>
      <h1>{loc.name}</h1>
      {loc.aka && <p className={styles.aka}>Also known as {loc.aka}</p>}

      <div className={styles.columns}>
        <div>
          <h2 className={styles.h2}>Visit</h2>
          <address className={styles.address}>
            {loc.address}
            <br />
            {loc.city}, {loc.state} {loc.zip}
          </address>
          <p className={styles.hours}>{loc.hours}</p>
          <a href={telHref(loc.phone)} className={styles.phone}>
            {loc.phone}
          </a>

          <h2 className={styles.h2}>What&rsquo;s here</h2>
          {/* Badges are driven by the amenities list — never hand-placed per page. */}
          <ul className={styles.amenities}>
            {loc.amenities.map((a) => (
              <li key={a} className={styles.amenity}>
                {a}
              </li>
            ))}
          </ul>

          {loc.truckStop && (
            <div className={styles.truckStop}>
              <h2 className={styles.h2}>Truck stop</h2>
              <p>
                Diesel and DEF lanes, showers, a driver lounge, a second store and
                truck parking.
              </p>
              <Link href="/truck-stop" className={styles.truckLink}>
                See the truck stop
              </Link>
            </div>
          )}
        </div>

        <div>
          <h2 className={styles.h2}>Fuel prices</h2>
          <div className={styles.priceCard}>
            <FuelPrices groups={priceGroupsForLocation(loc.id)} variant="full" />
          </div>
        </div>
      </div>
    </section>
  );
}
