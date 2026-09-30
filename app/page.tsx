import type { Metadata } from 'next'
import { Suspense } from 'react'
import styles from './page.module.css'
import { FuelPriceBlock, FuelPriceBlockFallback } from '@/components/fuel/FuelPriceBlock'
import { FuelPriceRail } from '@/components/fuel/FuelPriceRail'
import { LocationList } from '@/components/locations/LocationList'
import { PageBlocks } from '@/components/pages/PageBlocks'
import { PromoSlot } from '@/components/promos/PromoRegion'
import sectionStyles from '@/components/pages/PageSections.module.css'
import { Markdown } from '@/lib/markdown'
import { getLiveMainPage } from '@/lib/pages'
import { getSettings } from '@/lib/settings'

/**
 * Home — the version Settings points at (ADR 0015, ADR 0018).
 *
 * Nothing on this page is typed into the code. The headline, the intro and the
 * sections below are a `mainPages` document in content/main-pages/, so staff
 * edit Home in the CMS like any other page, and a replacement Home can be built
 * in full and switched over by changing one setting.
 *
 * Drawn from docs/proofs/home-review.html: headline and intro, the price rail,
 * any live promos, the divider band, then the location list with the Truck
 * Stop callout first.
 */

async function liveHome() {
  const { liveMainPage } = await getSettings()
  return getLiveMainPage(liveMainPage)
}

export async function generateMetadata(): Promise<Metadata> {
  const home = await liveHome()
  return {
    ...(home?.seoDescription ? { description: home.seoDescription } : {}),
    alternates: { canonical: '/' },
  }
}

export default async function HomePage() {
  const home = await liveHome()

  return (
    <div className={styles.pagegrid}>
      <div className={styles.maincol}>
        {home ? (
          <>
            <h1>{home.headline}</h1>
            {home.intro ? <p className={styles.lede}>{home.intro}</p> : null}
            {home.body.trim() ? (
              <Markdown source={home.body} className={sectionStyles.prose} />
            ) : null}
          </>
        ) : (
          // No home page version exists at all. The site still says who it is
          // and where the stores are, rather than serving an empty page.
          <h1>Lummi Bay Market</h1>
        )}
      </div>

      {/* Dissolves on a phone so the block sits in the normal flow. */}
      <FuelPriceRail>
        {/* Prices resolve per request; the shell around them stays static. */}
        <Suspense fallback={<FuelPriceBlockFallback />}>
          <FuelPriceBlock subject="exit-260" />
        </Suspense>
      </FuelPriceRail>

      {/* Promos set to "Home page", in this version's rows or Site settings'.
          Above the band, as the approved Home draws it. */}
      <PromoSlot target={{ home: true }} rows={home?.promoRows} />

      <div className={styles.rest}>
        {/* TODO: replace with approved Lummi art. The flat teal-to-navy band
            the approved Home draws between the top of the page and the list —
            not the wavy waterline, which is a different element. */}
        <div className={styles.band} aria-hidden="true" />

        {home ? <PageBlocks blocks={home.blocks} /> : <LocationList />}
      </div>
    </div>
  )
}
