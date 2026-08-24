import Link from "next/link";
import FuelPrices from "./FuelPrices";
import Logo from "./Logo";
import PrimaryNav from "./PrimaryNav";
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

/**
 * The nav and the price widget stay pinned as the page scrolls, so prices are on
 * screen at every point of the visit. That is why Home carries no second price table.
 *
 * The <header> itself is the sticky element, offset upward by exactly the height of
 * the utility bar: the utility bar slides out of view and everything below it pins.
 * A sticky child could not do this — it can only stick within its parent's box.
 *
 * Source order is logo → nav → prices, which is the mobile order as read. On desktop
 * the grid lifts the prices up beside the logo. One DOM, both layouts — the price
 * block is never rendered twice.
 */
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

      <div className={styles.bar}>
        {/* display:contents on phones, so the nav can sit between these two; a real
            flex row on desktop, where they share the top line. */}
        <div className={styles.mastRow}>
          <Link
            href="/"
            className={styles.logoArea}
            aria-label="Lummi Bay Market — home"
          >
            <Logo />
          </Link>

          <div className={styles.priceArea}>
            <FuelPrices
              groups={[
                "exit-260",
                "mini-mart",
                "fishermans-cove",
                "exit-260-truck-stop",
              ]}
              variant="panel"
              only={["regular", "diesel", "def"]}
            />
            {/* No "all grades" link here on purpose: the pinned nav directly above
                already carries Fuel Prices, and the widget has no room to spare. */}
          </div>
        </div>

        <PrimaryNav items={NAV} />
      </div>
    </header>
  );
}
