import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import styles from '../../page.module.css'
import { FuelPriceBlock, FuelPriceBlockFallback } from '@/components/fuel/FuelPriceBlock'
import { FuelPriceRail } from '@/components/fuel/FuelPriceRail'
import { AmenityBadges } from '@/components/locations/AmenityBadges'
import { InsideLinks } from '@/components/locations/InsideLinks'
import { LiveHours } from '@/components/locations/LiveHours'
import { LocationList } from '@/components/locations/LocationList'
import { PromoSlot } from '@/components/promos/PromoRegion'
import { getLocation, getLocations } from '@/lib/locations'
import { JsonLd, locationJsonLd } from '@/lib/structured-data'
import type { LocationSlug } from '@/lib/types'

/**
 * Every Location document, so one added in the CMS gets its page on the next
 * deploy — and before that, on demand: an address not listed here is rendered
 * when first asked for (ADR 0030).
 */
export async function generateStaticParams() {
  return (await getLocations()).map((location) => ({ slug: location.id }))
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

      </div>

      <FuelPriceRail>
        <Suspense fallback={<FuelPriceBlockFallback />}>
          <FuelPriceBlock subject={location.id} />
        </Suspense>
      </FuelPriceRail>

      {/* A promo set to "Specific pages only" can name this Location. */}
      <PromoSlot target={{ key: `locations/${location.id}` }} />

      <div className={styles.rest}>
        {/* The Location's details run the full page width, under the title,
            photo and promotions (owner, 2 Oct 2026). */}
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

        {/* Parts of this store with their own page — the Liquor Store at
            Exit 260 (Location Details → "Also inside this location"). */}
        <InsideLinks location={location} />

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
