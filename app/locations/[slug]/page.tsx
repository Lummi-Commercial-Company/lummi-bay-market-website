import Image from 'next/image'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import styles from '../../page.module.css'
import { FuelPriceBlock, FuelPriceBlockFallback } from '@/components/fuel/FuelPriceBlock'
import { FuelPriceRail } from '@/components/fuel/FuelPriceRail'
import { AmenityBadges } from '@/components/locations/AmenityBadges'
import { LiveHours } from '@/components/locations/LiveHours'
import { LocationList } from '@/components/locations/LocationList'
import { PromoSlot } from '@/components/promos/PromoRegion'
import { getLocation, LOCATION_ORDER } from '@/lib/locations'
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

  return (
    <div className={styles.pagegrid}>
      <div className={styles.maincol}>
        <h1>{location.name}</h1>

        {/* The Location's main photo (Location Details → Main photo), when
            one is uploaded. Nothing — no empty frame — when it is not. */}
        {location.hero?.image ? (
          <div className={styles.locPhoto}>
            <Image
              src={location.hero.image}
              alt={location.hero.alt ?? ''}
              fill
              priority
              sizes="(min-width: 900px) 720px, 100vw"
              className={styles.locPhotoImg}
            />
          </div>
        ) : null}

        <dl className={styles.dl}>
          <dt>Address</dt>
          <dd>
            {location.address}
            <br />
            {location.city}, {location.state} {location.zip}
          </dd>

          <dt>Hours</dt>
          {/* Per request in Pacific time, so a scheduled override starts and
              reverts on its own. The fallback is the standard line, so the
              prerendered page never shows a gap where an opening time goes. */}
          <dd>
            <Suspense fallback={location.hours}>
              <LiveHours
                hours={location.hours}
                overrides={location.hoursOverrides}
                of={location.id}
                showReason
              />
            </Suspense>
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
          <AmenityBadges amenities={location.amenities} />
        ) : location.amenities.length === 1 ? (
          <p>{location.amenities[0]} available at this location.</p>
        ) : null}

        {/* Only exit-260 carries a Truck Stop record. The summary reads from
            that record and never from the store's `amenities` — the showers and
            the driver lounge are the Truck Stop's, not the store's.

            It reads the record's own `summary`, the prose field staff write.
            It used to build a sentence by lowercasing the amenity list, which
            turned "DEF" into "def". Never case-fold content to fit a sentence. */}
        {location.truckStop ? (
          <>
            <h2>Truck Stop</h2>
            <p>
              {location.truckStop.summary ||
                `A separate fuel station on the same property: ${location.truckStop.amenities.join(', ')}.`}{' '}
              <Suspense fallback={location.truckStop.hours}>
                <LiveHours
                  hours={location.truckStop.hours}
                  overrides={location.truckStop.hoursOverrides}
                  of={`${location.id}-truck-stop`}
                />
              </Suspense>
              .
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

      {/* A promo set to "Specific pages only" can name this Location. */}
      <PromoSlot target={{ key: `locations/${location.id}` }} />

      <div className={styles.rest}>
        {/* The page's own card is dropped and the label reads "Our other
            locations"; the Truck Stop callout stays on Exit 260 (ADR 0009). */}
        <LocationList subject={location.id} />
      </div>

      {/* Structured data carries the STANDARD hours, never a temporary
          override. It feeds the "open now" badge in search results, which
          nobody on our side ever sees, and a holiday exception published there
          outlives the holiday. */}
      <JsonLd data={locationJsonLd(location, location.hours)} />
    </div>
  )
}
