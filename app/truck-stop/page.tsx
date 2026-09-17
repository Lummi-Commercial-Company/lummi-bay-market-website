import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import styles from '../page.module.css'
import { FuelPriceBlock, FuelPriceBlockFallback } from '@/components/fuel/FuelPriceBlock'
import { FuelPriceRail } from '@/components/fuel/FuelPriceRail'
import { getLocation, resolveHours } from '@/lib/locations'

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

  const hours = resolveHours(truckStop.hours, truckStop.hoursOverrides)

  return (
    <div className={styles.pagegrid}>
      <div className={styles.maincol}>
        <h1>Truck Stop at Exit 260</h1>
        <p className={styles.lede}>
          A fuel station for truckers, with its own small c-store — right off I-5 at
          Exit 260.
        </p>

        <dl className={styles.dl}>
          <dt>Address</dt>
          <dd>
            {exit260.address}
            <br />
            {exit260.city}, {exit260.state} {exit260.zip}
          </dd>
          <dt>Hours</dt>
          <dd>{hours.hours}</dd>
          {/* The Truck Stop's own number. A driver asking about showers or the
              diesel lanes must not land on the C-Store line. */}
          <dt>Truck Stop</dt>
          <dd>
            <a href={`tel:${truckStop.phone.replace(/[^\d+]/g, '')}`}>{truckStop.phone}</a>
          </dd>
        </dl>

        {truckStop.amenities.length >= 2 ? (
          <>
            <h2>What&rsquo;s here</h2>
            <ul className={styles.badges}>
              {truckStop.amenities.map((amenity) => (
                <li key={amenity} className={styles.badge}>
                  <span aria-hidden="true">•</span>
                  {amenity}
                </li>
              ))}
            </ul>
          </>
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

      <div className={styles.rest}>
        {/* The filter drops the page's subject — the Truck Stop — never
            everything at the page's street address, so Exit 260 is still
            listed here (ADR 0009). */}
        <h2>Also at this exit</h2>
        <ul className={styles.cards}>
          <li>
            <Link className={styles.card} href="/locations/exit-260">
              <p className={styles.cardName}>{exit260.navLabel}</p>
              <p className={styles.cardLine}>{exit260.cardLine}</p>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
