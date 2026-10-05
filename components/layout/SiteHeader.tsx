import Image from 'next/image'
import Link from 'next/link'
import styles from './SiteHeader.module.css'
import { HeaderMetrics } from './HeaderMetrics'
import { HeaderMotifs } from './HeaderMotifs'
import { MobileMenu } from './MobileMenu'
import { SiteAlertSlot } from './SiteAlert'
import { SiteNav } from './SiteNav'
import { getLocations } from '@/lib/locations'
import { getPages } from '@/lib/pages'
import { getSettings } from '@/lib/settings'
import type { SubNavItem } from './nav-items'

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
  const [settings, locationsMenu] = await Promise.all([getSettings(), locationsMenuItems()])

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

          <SiteNav locationsMenu={locationsMenu} />

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

          {/* Phone only: the three nav items, behind the ☰ (ADR 0029). */}
          <MobileMenu locationsMenu={locationsMenu} />
        </div>
      </header>

      {/* A solid teal rule, not the wave. The wavy waterline is the section
          divider from the spec sheet; the approved page has a flat 5px teal
          line under the nav, and the two are not interchangeable. See
          components/layout/Waterline.tsx. */}
      <div className={styles.waterline} />

      <SiteAlertSlot />

      <HeaderMetrics targetId={HEADER_ID} />
    </div>
  )
}

/**
 * The Locations menu: each Location with the parts of it that have their own
 * page. The Truck Stop sits under the Location whose property it shares
 * (Exit 260), first, ahead of the pages picked in "Also inside this location".
 */
async function locationsMenuItems(): Promise<SubNavItem[]> {
  const [locations, pages] = await Promise.all([getLocations(), getPages()])
  return locations.map((location) => ({
    href: `/locations/${location.id}`,
    label: location.navLabel,
    children: [
      ...(location.truckStop ? [{ href: '/truck-stop', label: 'Truck Stop' }] : []),
      ...location.inside
        .map((slug) => pages.find((page) => page.slug === slug))
        .filter((page): page is NonNullable<typeof page> => Boolean(page))
        .map((page) => ({ href: `/${page.slug}`, label: page.navLabel || page.title })),
    ],
  }))
}
