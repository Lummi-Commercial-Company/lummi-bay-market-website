import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import styles from '../../page.module.css'
import { FuelPriceBlock, FuelPriceBlockFallback } from '@/components/fuel/FuelPriceBlock'
import { FuelPriceRail } from '@/components/fuel/FuelPriceRail'
import { getLocation, getLocations, LOCATION_ORDER, resolveHours } from '@/lib/locations'
import { JsonLd, locationJsonLd } from '@/lib/structured-data'
import type { LocationSlug } from '@/lib/types'

export function generateStaticParams() {
  return LOCATION_ORDER.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const location = await getLocation(slug as LocationSlug)
  if (!location) return {}
  return {
    title: location.navLabel,
    description: `${location.name} — ${location.address}, ${location.city} ${location.state}. ${location.hours}.`,
    alternates: { canonical: `/locations/${location.id}` },
  }
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const location = await getLocation(slug as LocationSlug)
  if (!location) notFound()

  // Evaluated per request against the visitor's date in Pacific time, so a
  // scheduled override reverts on its own (ADR 0027).
  const hours = resolveHours(location.hours, location.hoursOverrides)
  const others = (await getLocations()).filter((other) => other.id !== location.id)

  return (
    <div className={styles.pagegrid}>
      <div className={styles.maincol}>
        <h1>{location.name}</h1>

        <dl className={styles.dl}>
          <dt>Address</dt>
          <dd>
            {location.address}
            <br />
            {location.city}, {location.state} {location.zip}
          </dd>

          <dt>Hours</dt>
          <dd>
            {hours.hours}
            {hours.isOverride ? (
              <>
                {' '}
                <span className={styles.overrideNote}>
                  (usually {hours.standardHours}
                  {hours.reason ? ` — ${hours.reason}` : ''})
                </span>
              </>
            ) : null}
          </dd>

          <dt>{location.id === 'exit-260' ? 'C-Store' : 'Phone'}</dt>
          <dd>
            <a href={`tel:${location.phone.replace(/[^\d+]/g, '')}`}>{location.phone}</a>
          </dd>
        </dl>

        {/* The badge row is driven by the amenities list — never hand-placed.
            Under two amenities it does not render; a single badge under a
            "What's here" heading reads as a failed load, not a short list. */}
        {location.amenities.length >= 2 ? (
          <>
            <h2>What&rsquo;s here</h2>
            <ul className={styles.badges}>
              {location.amenities.map((amenity) => (
                <li key={amenity} className={styles.badge}>
                  <span aria-hidden="true">•</span>
                  {amenity}
                </li>
              ))}
            </ul>
          </>
        ) : location.amenities.length === 1 ? (
          <p>{location.amenities[0]} available at this location.</p>
        ) : null}

        {/* Only exit-260 carries a Truck Stop record. The summary reads from
            that record and never from `amenities` — the showers and the driver
            lounge are the Truck Stop's, not the store's. */}
        {location.truckStop ? (
          <>
            <h2>Truck Stop</h2>
            <p>
              A separate fuel station for truckers on the same property:{' '}
              {location.truckStop.amenities.join(', ').toLowerCase()}.{' '}
              {location.truckStop.hours}.
            </p>
            <p>
              <Link href="/truck-stop">More about the Truck Stop</Link>
            </p>
          </>
        ) : null}
      </div>

      <FuelPriceRail>
        <Suspense fallback={<FuelPriceBlockFallback />}>
          <FuelPriceBlock subject={location.id} />
        </Suspense>
      </FuelPriceRail>

      <div className={styles.rest}>
        <h2>Our other locations</h2>
        <ul className={styles.cards}>
          {others.map((other) => (
            <li key={other.id}>
              <Link className={styles.card} href={`/locations/${other.id}`}>
                <p className={styles.cardName}>{other.navLabel}</p>
                <p className={styles.cardLine}>{other.cardLine}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <JsonLd data={locationJsonLd(location, hours.hours)} />
    </div>
  )
}
