import Link from "next/link";
import { getLocations, telHref } from "@/lib/locations";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  const locations = getLocations();

  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.grid}`}>
        <section className={styles.locations} aria-labelledby="footer-locations">
          <h2 id="footer-locations" className={styles.heading}>
            Our locations
          </h2>
          <ul className={styles.locationList}>
            {locations.map((loc) => (
              <li key={loc.id}>
                <Link href={`/locations/${loc.id}`} className={styles.locationName}>
                  {loc.navLabel}
                </Link>
                <address className={styles.address}>
                  {loc.address}
                  <br />
                  {loc.city}, {loc.state} {loc.zip}
                </address>
                <p className={styles.hours}>{loc.hours}</p>
                <a href={telHref(loc.phone)} className={styles.phone}>
                  {loc.phone}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <nav className={styles.links} aria-labelledby="footer-links">
          <h2 id="footer-links" className={styles.heading}>
            More
          </h2>
          <ul className={styles.linkList}>
            <li>
              <Link href="/about">About us</Link>
            </li>
            <li>
              <Link href="/rewards">Rewards</Link>
            </li>
            <li>
              <Link href="/careers">Careers</Link>
            </li>
            <li>
              <Link href="/contact">Contact us</Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className={styles.baseline}>
        <div className={`wrap ${styles.baselineRow}`}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} Lummi Bay Market
          </p>
          {/*
            The ONLY place other Lummi companies appear anywhere on this site.
            See ADR 0001 — do not add this link, or any sibling company, to page copy
            or navigation.
          */}
          <a
            href="https://lcc-lummi.com"
            className={styles.lccLink}
            rel="noopener noreferrer"
          >
            Lummi Commercial Companies
          </a>
        </div>
      </div>
    </footer>
  );
}
