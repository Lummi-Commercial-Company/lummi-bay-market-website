import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Suspense } from 'react'
import styles from '../page.module.css'
import { FuelPriceBlock, FuelPriceBlockFallback } from '@/components/fuel/FuelPriceBlock'
import { FuelPriceRail } from '@/components/fuel/FuelPriceRail'
import { AmenityBadges } from '@/components/locations/AmenityBadges'
import { LiveHours } from '@/components/locations/LiveHours'
import { LocationList } from '@/components/locations/LocationList'
import { PromoSlot } from '@/components/promos/PromoRegion'
import { getLocation } from '@/lib/locations'

export const metadata: Metadata = {
  title: 'Truck Stop',
  description:
    'Diesel lanes, DEF, a small c-store, driver lounge, showers and truck parking at Exit 260, open 24 hours.',
  alternates: { canonical: '/truck-stop' },
}

/**
 * The Truck Stop is a separate fuel station sharing the Exit 260 property, not
 * a wing of the store. It has its own phone, its own hours, its own amenities
 * and its own hours overrides — the store closing early on a holiday while the
 * diesel lanes stay open all night is the normal outcome, not an edge case.
 */
export default async function TruckStopPage() {
  const exit260 = await getLocation('exit-260')
  const truckStop = exit260?.truckStop
  if (!exit260 || !truckStop) notFound()

  return (
    <div className={styles.pagegrid}>
      <div className={styles.maincol}>
        <h1>Truck Stop at Exit 260</h1>
        <p className={styles.lede}>
          A fuel station for truckers, with its own small c-store — right off I-5 at
          Exit 260.
        </p>

        {/* The Truck Stop's own main photo (Location Details → Truck Stop →
            Truck Stop main photo). Nothing when none is uploaded. */}
        {truckStop.hero?.image ? (
          <div className={styles.locPhoto}>
            <Image
              src={truckStop.hero.image}
              alt={truckStop.hero.alt ?? ''}
              fill
              priority
              sizes="(min-width: 900px) 720px, 100vw"
              className={styles.locPhotoImg}
            />
          </div>
        ) : null}

      </div>

      {/* The Truck Stop leads the table here, so diesel and DEF are the first
          numbers a driver hits, and Exit 260 becomes the row that moves into
          the panel on condense. */}
      <FuelPriceRail>
        <Suspense fallback={<FuelPriceBlockFallback />}>
          <FuelPriceBlock subject="truck-stop" />
        </Suspense>
      </FuelPriceRail>

      <PromoSlot target={{}} />

      <div className={styles.rest}>
        {/* The details run the full page width, under the title, photo and
            promotions (owner, 2 Oct 2026). */}
        <dl className={styles.dl}>
          <dt>Address</dt>
          <dd>
            {exit260.address}
            <br />
            {exit260.city}, {exit260.state} {exit260.zip}
          </dd>
          <dt>Hours</dt>
          <dd>
            <Suspense fallback={truckStop.hours}>
              <LiveHours
                hours={truckStop.hours}
                overrides={truckStop.hoursOverrides}
                of={`${exit260.id}-truck-stop`}
                showReason
              />
            </Suspense>
          </dd>
          {/* The Truck Stop's own number. A driver asking about showers or the
              diesel lanes must not land on the C-Store line. */}
          <dt>Truck Stop</dt>
          <dd>
            <a href={`tel:${truckStop.phone.replace(/[^\d+]/g, '')}`}>{truckStop.phone}</a>
          </dd>
        </dl>

        {/* The Truck Stop's badges come from its own record, never merged
            with the store's (docs/proofs/amenity-badges.html). */}
        <AmenityBadges amenities={truckStop.amenities} />

        {/* The page's subject is the Truck Stop, so the callout is dropped —
            and ONLY the callout. Exit 260 is a different store at the same
            address and stays, with the other Locations (ADR 0009). */}
        <LocationList subject="truck-stop" />
      </div>
    </div>
  )
}
