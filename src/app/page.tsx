import Link from "next/link";
import Tile from "@/components/Tile";
import type { TileData } from "@/components/Tile";
import promotions from "@/data/promotions.json";
import { getLocations } from "@/lib/locations";
import styles from "./page.module.css";

/**
 * Home is a Persuade surface for the traveler already on I-5: what fuel costs,
 * whether it is open, and what is actually there — before the off-ramp.
 *
 * There is deliberately NO price table on this page. Prices live in the sticky header
 * widget, which stays on screen the whole way down, so a second copy here would be
 * redundant. /fuel-prices carries the full grade list.
 */

const promo = promotions.find((p) => p.active);

const TILES: TileData[] = [
  {
    photo: "Truck stop at night — diesel canopy and parked rigs",
    eyebrow: "Exit 260",
    title: "A full truck stop",
    blurb: "Diesel and DEF lanes, showers, driver lounge, and truck parking.",
    href: "/truck-stop",
    feature: true,
  },
  {
    photo: "Drive-thru window from a driver's seat",
    eyebrow: "Exit 260",
    title: "Tobacco & liquor drive-thru",
    blurb: "Without leaving your seat.",
    href: "/locations/exit-260",
  },
  {
    photo: "Coffee being poured at a self-serve counter",
    eyebrow: "Exit 260",
    title: "Fresh brew, 24 hours",
    href: "/locations/exit-260",
  },
  {
    photo: "Hot food counter with a served plate",
    eyebrow: "Fisherman's Cove",
    title: "The Cove Kitchen",
    href: "/locations/fishermans-cove",
  },
];

export default function HomePage() {
  const locations = getLocations();

  return (
    <>
      <section className={`wrap ${styles.intro}`}>
        <h1 className={styles.h1}>
          Fuel, food, and a full truck stop — right off I-5.
        </h1>
        <p className={styles.lede}>
          Three Lummi Bay Market locations near Bellingham and Ferndale. The
          flagship at Exit 260 is open 24 hours.
        </p>
      </section>

      <section className={`wrap ${styles.section}`} aria-labelledby="whats-here">
        <h2 id="whats-here">What&rsquo;s here</h2>
        <div className={styles.mosaic}>
          {TILES.map((tile) => (
            <Tile key={tile.title} tile={tile} />
          ))}
        </div>
      </section>

      {promo && (
        <section className={`wrap ${styles.section}`} aria-labelledby="promo">
          <div className={styles.promo}>
            <div>
              <span className={styles.promoEyebrow}>{promo.scope}</span>
              <h2 id="promo" className={styles.promoTitle}>
                {promo.title}
              </h2>
              <p className={styles.promoBlurb}>{promo.blurb}</p>
            </div>
          </div>
        </section>
      )}

      <section className={`wrap ${styles.section}`} aria-labelledby="locations">
        <h2 id="locations">Three locations</h2>
        <div className={styles.locations}>
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

      <section className={`wrap ${styles.section}`} aria-labelledby="rewards">
        <div className={styles.rewards}>
          <div>
            <h2 id="rewards" className={styles.rewardsTitle}>
              Lummi Bay Rewards
            </h2>
            {/*
              Deliberately no earning-rate claim ("points per gallon" or similar)
              until the real programme terms are confirmed. Do not add one here.
            */}
            <p className={styles.rewardsBlurb}>
              Get the Rewards app for member pricing and offers.
            </p>
            <Link href="/rewards" className={styles.rewardsCta}>
              Get the app
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
