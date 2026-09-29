import Link from "next/link";
import { getLocations, getTruckStopLocation } from "@/lib/content";
import styles from "./LocationList.module.css";

/**
 * The Location list — ADR 0009.
 *
 * DERIVED, never authored per page. The component filters out the page's own subject
 * and the heading becomes "Our other locations" when it does.
 *
 * The Truck Stop callout leads, because the Truck Stop is a second store rather than a
 * wing of Exit 260. The filter drops the page's SUBJECT, never everything at the page's
 * street address — so the Exit 260 card is still listed on /truck-stop.
 *
 * The card line carries where it is and when it is open, not what it sells. A list view
 * is for choosing between places; amenities live on the detail page.
 */
export default function LocationList({ exclude }: { exclude?: string }) {
  const locations = getLocations().filter((l) => l.id !== exclude);
  const truckStopHost = getTruckStopLocation();
  const showTruckStop = exclude !== "truck-stop" && truckStopHost;

  const heading = exclude ? "Our other locations" : "Our locations";

  return (
    <section className={styles.section} aria-labelledby="locations-heading">
      <h2 id="locations-heading">{heading}</h2>
      <ul className={styles.list}>
        {showTruckStop ? (
          <li>
            <Link href="/truck-stop" className={styles.item}>
              <span className={styles.motif} aria-hidden="true" />
              <span className={styles.body}>
                <span className={styles.name}>Truck Stop</span>
                <span className={styles.cardLine}>
                  {truckStopHost.address} &middot; {truckStopHost.truckStop?.hours}
                </span>
              </span>
              <span className={styles.chevron} aria-hidden="true">
                &rsaquo;
              </span>
            </Link>
          </li>
        ) : null}

        {locations.map((l) => (
          <li key={l.id}>
            <Link href={`/locations/${l.id}`} className={styles.item}>
              <span className={styles.motif} aria-hidden="true" />
              <span className={styles.body}>
                <span className={styles.name}>{l.navLabel}</span>
                <span className={styles.cardLine}>{l.cardLine}</span>
              </span>
              <span className={styles.chevron} aria-hidden="true">
                &rsaquo;
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
