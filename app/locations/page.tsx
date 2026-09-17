import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import styles from '../page.module.css'
import { FuelPriceBlock, FuelPriceBlockFallback } from '@/components/fuel/FuelPriceBlock'
import { FuelPriceRail } from '@/components/fuel/FuelPriceRail'
import { getLocations, resolveCardLine } from '@/lib/locations'

export const metadata: Metadata = {
  title: 'Locations',
  description:
    'Lummi Bay Market at Exit 260, the Minimart on Haxton Way and Fisherman’s Cove on Lummi View Drive.',
}

/** The index is derived from the Location files — never authored (ADR 0009). */
export default async function LocationsPage() {
  const locations = await getLocations()

  return (
    <div className={styles.pagegrid}>
      <div className={styles.maincol}>
        <h1>Locations</h1>
        <p className={styles.lede}>Three places to stop, all on Lummi Nation.</p>
      </div>

      <FuelPriceRail>
        <Suspense fallback={<FuelPriceBlockFallback />}>
          <FuelPriceBlock subject="exit-260" />
        </Suspense>
      </FuelPriceRail>

      <div className={styles.rest}>
        <ul className={styles.cards}>
          {locations.map((location) => (
            <li key={location.id}>
              <Link className={styles.card} href={`/locations/${location.id}`}>
                <p className={styles.cardName}>{location.navLabel}</p>
                <p className={styles.cardLine}>{resolveCardLine(location)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
