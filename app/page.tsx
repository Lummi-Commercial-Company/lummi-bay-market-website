import { Suspense } from 'react'
import Link from 'next/link'
import styles from './page.module.css'
import { FuelPriceBlock, FuelPriceBlockFallback } from '@/components/fuel/FuelPriceBlock'
import { FuelPriceRail } from '@/components/fuel/FuelPriceRail'
import { LiveCardLine } from '@/components/locations/LiveCardLine'
import { getLocations } from '@/lib/locations'

/**
 * Home — the layout shell with live data in it.
 *
 * PHASE 3 replaces the copy and the hero. What is real here is the structure:
 * the rail, the fuel block inside a Suspense boundary, and the Location list
 * derived from `content/locations/` rather than written out by hand (ADR 0009).
 */
export default async function HomePage() {
  const locations = await getLocations()

  return (
    <div className={styles.pagegrid}>
      <div className={styles.maincol}>
        <h1>Fuel, food and a place to stop.</h1>
        <p className={styles.lede}>
          Three Lummi Bay Market locations, plus a truck stop at Exit 260 with diesel
          lanes, showers and parking.
        </p>
      </div>

      {/* Dissolves on a phone so the block sits in the normal flow. */}
      <FuelPriceRail>
        {/* Prices resolve per request; the shell around them stays static. */}
        <Suspense fallback={<FuelPriceBlockFallback />}>
          <FuelPriceBlock subject="exit-260" />
        </Suspense>
      </FuelPriceRail>

      <div className={styles.rest}>
        <h2>Our locations</h2>
        <ul className={styles.cards}>
          {locations.map((location) => (
            <li key={location.id}>
              <Link className={styles.card} href={`/locations/${location.id}`}>
                <p className={styles.cardName}>{location.navLabel}</p>
                <p className={styles.cardLine}>
                  <Suspense fallback={location.cardLine}>
                    <LiveCardLine location={location} />
                  </Suspense>
                </p>
              </Link>
            </li>
          ))}
        </ul>

        <p className={styles.note}>
          Phase 1 shell. Copy, hero art and the promo region are Phase 3 — see
          docs/roadmap.md.
        </p>
      </div>
    </div>
  )
}
