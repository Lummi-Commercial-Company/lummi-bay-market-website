'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './SiteHeader.module.css'

/**
 * The primary navigation. THREE ITEMS. Not four (ADR 0008).
 *
 * Fuel Prices is deliberately absent — `/fuel-prices` is reached from the
 * footer and from the price block's "All prices" panel. Rewards is the utility
 * pill, not a nav item (ADR 0006). A new page never earns a nav slot on its own.
 *
 * On a phone the Home item is hidden and the logo carries Home, which is what
 * keeps the three items on one line without wrapping.
 */
const NAV_ITEMS = [
  { href: '/', label: 'Home', phone: false },
  { href: '/locations', label: 'Locations', phone: true },
  { href: '/truck-stop', label: 'Truck Stop', phone: true },
] as const

export function SiteNav() {
  const pathname = usePathname()

  return (
    <nav className={styles.nav} aria-label="Main">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={item.phone ? styles.navLink : `${styles.navLink} ${styles.navLinkWide}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
