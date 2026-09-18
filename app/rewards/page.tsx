import type { Metadata } from 'next'
import { Suspense } from 'react'
import styles from '../page.module.css'
import { FuelPriceBlock, FuelPriceBlockFallback } from '@/components/fuel/FuelPriceBlock'
import { FuelPriceRail } from '@/components/fuel/FuelPriceRail'
import { getSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Rewards',
  description: 'The Lummi Bay Market rewards app — points on fuel and in the store.',
  alternates: { canonical: '/rewards' },
}

/**
 * The Rewards app-promo page. Rewards appears in exactly three places on this
 * site: the header pill, this page, and the footer. Nowhere else (ADR 0006).
 * No loyalty logic is built here — the programme lives in the app.
 *
 * It carries the price block like every other page (ADR 0005). This page was
 * the one that did not, which since 18 Sep 2026 also left it with no route to
 * /fuel-prices at all — the panel's "All prices" link is now the only one
 * (ADR 0008, amended).
 */
export default async function RewardsPage() {
  const { rewards } = await getSettings()

  return (
    <div className={styles.pagegrid}>
      <div className={styles.maincol}>
        <h1>Lummi Bay Market Rewards</h1>
        <p className={styles.lede}>
          Earn on fuel and in the store, and get member offers at all three locations.
        </p>

        <ul className={styles.badges}>
          {rewards.appStoreUrl ? (
            <li>
              <a className={styles.badge} href={rewards.appStoreUrl} target="_blank" rel="noopener noreferrer">
                Download for iPhone
                <span className="visually-hidden">(opens in a new tab)</span>
              </a>
            </li>
          ) : null}
          {rewards.playStoreUrl ? (
            <li>
              <a className={styles.badge} href={rewards.playStoreUrl} target="_blank" rel="noopener noreferrer">
                Download for Android
                <span className="visually-hidden">(opens in a new tab)</span>
              </a>
            </li>
          ) : null}
        </ul>

        <p className={styles.note}>
          Phase 3 replaces this copy and adds the official store badges. The app terms
          and privacy policy live at /privacy, which the app stores require — ADR 0026.
        </p>
      </div>

      {/* The same price block every other page carries. Subject defaults to the
          flagship, as on Home and the general pages — this page has no Location
          of its own. FuelPriceBlockProps still carries the open question of what
          that default should be; it is the client's call, not this page's. */}
      <FuelPriceRail>
        <Suspense fallback={<FuelPriceBlockFallback />}>
          <FuelPriceBlock />
        </Suspense>
      </FuelPriceRail>
    </div>
  )
}
