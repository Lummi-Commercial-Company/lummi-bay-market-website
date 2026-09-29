import Link from "next/link";
import styles from "./SiteFooter.module.css";

/**
 * Footer links (CLAUDE.md). /fuel-prices and /about are reached from here, not from
 * the nav — the nav stays three items (ADR 0008).
 *
 * "Lummi Commercial Companies" is the ONE place other Lummi companies appear on this
 * site. Never in copy, never in nav (ADR 0001).
 *
 * No form anywhere on the site. Hours, addresses and phones live on /contact,
 * derived from Location data (ADR 0015).
 */
export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <nav className={styles.links} aria-label="Footer">
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/rewards">Rewards</Link>
          <Link href="/fuel-prices">Fuel prices</Link>
          <Link href="/careers">Careers</Link>
          <a href="https://lcc-lummi.com" target="_blank" rel="noopener noreferrer">
            Lummi Commercial Companies
          </a>
        </nav>
        <p className={styles.legal}>
          &copy; {new Date().getFullYear()} Lummi Bay Market. Prices subject to change.
        </p>
      </div>
    </footer>
  );
}
