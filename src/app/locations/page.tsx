import Tile from "@/components/Tile";
import { getLocations } from "@/lib/locations";
import styles from "./page.module.css";

export const metadata = { title: "Locations" };

export default function LocationsPage() {
  const locations = getLocations();

  return (
    <section className={`wrap ${styles.page}`}>
      <h1>Locations</h1>
      <p className={styles.lede}>
        Three Lummi Bay Market locations near Bellingham and Ferndale, Washington.
      </p>

      <div className={styles.grid}>
        {locations.map((loc) => (
          <Tile
            key={loc.id}
            tile={{
              photo: `${loc.navLabel} — forecourt and storefront`,
              eyebrow: `${loc.city}, ${loc.state}`,
              title: loc.navLabel,
              blurb: loc.hours,
              href: `/locations/${loc.id}`,
            }}
          />
        ))}
      </div>
    </section>
  );
}
