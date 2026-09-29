import Image from 'next/image'
import Link from 'next/link'
import styles from './SiteHeader.module.css'
import { HeaderMetrics } from './HeaderMetrics'
import { HeaderMotifs } from './HeaderMotifs'
import { SiteAlert } from './SiteAlert'
import { SiteNav } from './SiteNav'
import { getSettings } from '@/lib/settings'

const HEADER_ID = 'site-header'

/**
 * The sticky site header — on every page (ADR 0006).
 *
 * Order inside the sticky wrapper: the header row, the teal rule, then the
 * emergency notice. The fuel-price rail is NOT sticky and never joins this
 * wrapper; ADR 0006 records why.
 *
 * The lockup is the master mark and the only mark allowed here. The paddle-alone
 * icon is for small square slots — favicon, app icon — and never stands in for
 * the lockup in the header.
 */
export async function SiteHeader() {
  const settings = await getSettings()

  return (
    <div className={styles.wrap} id={HEADER_ID}>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link href="/" className={styles.lock} aria-label="Lummi Bay Market — home">
            <Image
              className={styles.lockmark}
              src="/brand/logo-market-on-dark.png"
              alt="Lummi Bay Market"
              width={336}
              height={120}
              priority
              quality={90}
            />
          </Link>

          <SiteNav />

          <HeaderMotifs />

          {/* The Rewards entry point, on every page, in the utility slot — and
              nowhere else in the header (ADR 0006). */}
          <Link href="/rewards" className={styles.pill}>
            <span className={styles.pillIn}>
              <span aria-hidden="true">★</span>
              <span className={styles.pillLong}>Get the App</span>
              <span className={styles.pillShort}>App</span>
            </span>
          </Link>
        </div>
      </header>

      {/* A solid teal rule, not the wave. The wavy waterline is the section
          divider from the spec sheet; the approved page has a flat 5px teal
          line under the nav, and the two are not interchangeable. See
          components/layout/Waterline.tsx. */}
      <div className={styles.waterline} />

      <SiteAlert alert={settings.siteAlert} />

      <HeaderMetrics targetId={HEADER_ID} />
    </div>
  )
}
