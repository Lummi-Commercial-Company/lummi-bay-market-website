import Link from "next/link";
import FuelPrices from "./FuelPrices";
import PrimaryNav from "./PrimaryNav";
import Logo from "./Logo";
import styles from "./SiteHeader.module.css";

/**
 * Primary nav is LOCKED to these four (see CLAUDE.md, owned by
 * ux-navigation-architect). Rewards sits in the utility slot, not the primary nav.
 * Ask before adding a nav item.
 */
const NAV = [
  { href: "/", label: "Home" },
  { href: "/locations", label: "Locations" },
  { href: "/truck-stop", label: "Truck Stop" },
  { href: "/fuel-prices", label: "Fuel Prices" },
];

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.utility}>
        <div className={`wrap ${styles.utilityRow}`}>
          <Link href="/careers" className={styles.utilityLink}>
            Careers
          </Link>
          <Link href="/rewards" className={styles.utilityLink}>
            Rewards
          </Link>
        </div>
      </div>

      <div className={`wrap ${styles.masthead}`}>
        <Link href="/" className={styles.logoLink} aria-label="Lummi Bay Market — home">
          <Logo />
        </Link>

        <div className={styles.prices}>
          <FuelPrices groups={["exit-260", "exit-260-truck-stop"]} variant="panel" />
          <Link href="/fuel-prices" className={styles.allPrices}>
            All locations &amp; grades
          </Link>
        </div>
      </div>

      <PrimaryNav items={NAV} />

    </header>
  );
}
