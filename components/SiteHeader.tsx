import Link from "next/link";
import { getSiteAlert } from "@/lib/content";
import styles from "./SiteHeader.module.css";

/**
 * The sticky header, on every page (ADR 0006).
 *
 * Nav is exactly three items (ADR 0008) — Fuel Prices is reached from the footer
 * and the price block's "All prices" panel, never from here. The top-right utility
 * slot carries the Rewards pill on every page and nothing else (ADR 0006).
 *
 * The siteAlert rides inside the header so an emergency notice is on every page
 * without a second sticky element (ADR 0017).
 */
export default function SiteHeader() {
  const alert = getSiteAlert();

  return (
    <header className={styles.header}>
      {alert.active && alert.message ? (
        <div className={styles.alert} role="status">
          <div className={`container ${styles.alertInner}`}>
            <span>{alert.message}</span>
            {alert.linkHref && alert.linkLabel ? (
              <Link href={alert.linkHref} className={styles.alertLink}>
                {alert.linkLabel}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className={`container ${styles.bar}`}>
        <Link href="/" className={styles.logo} aria-label="Lummi Bay Market — home">
          {/* The logo is LOCKED. Use the art as-is; never recolour or re-typeset it.
              The filename names the background, never the ink: -on-dark holds the
              WHITE wordmark, which is the one the navy header needs. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-market-on-dark.png"
            srcSet="/brand/logo-market-on-dark.png 1x, /brand/logo-market-on-dark@3x.png 3x"
            width={101}
            height={36}
            alt="Lummi Bay Market"
          />
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          <Link href="/">Home</Link>
          <Link href="/locations">Locations</Link>
          <Link href="/truck-stop">Truck Stop</Link>
        </nav>

        <Link href="/rewards" className={styles.pill}>
          Get the App
        </Link>
      </div>
    </header>
  );
}
