import type { Metadata } from 'next'
import { Suspense } from 'react'
import styles from '../page.module.css'
import { FuelPriceBlock, FuelPriceBlockFallback } from '@/components/fuel/FuelPriceBlock'
import { FuelPriceRail } from '@/components/fuel/FuelPriceRail'
import { LocationList } from '@/components/locations/LocationList'

export const metadata: Metadata = {
  title: 'Locations',
  description:
    'Lummi Bay Market at Exit 260, the Minimart on Haxton Way and Fisherman’s Cove on Lummi View Drive.',
}

/**
 * The index is derived from the Location files — never authored (ADR 0009).
 * It is the full list, Truck Stop callout first, like Home.
 */
export default async function LocationsPage() {
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
        <LocationList />
      </div>
    </div>
  )
}
