'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isCurrent, NAV_ITEMS } from './nav-items'
import styles from './SiteHeader.module.css'

/**
 * The inline navigation — desktop only.
 *
 * On a phone these links are not in the header: they are behind the ☰ menu
 * (MobileMenu), because the header cannot hold the lockup, three links and the
 * Get the App pill below about 430px — which is every common phone (ADR 0029).
 */
export function SiteNav() {
  const pathname = usePathname()

  return (
    <nav className={styles.nav} aria-label="Main">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={styles.navLink}
          aria-current={isCurrent(item.href, pathname) ? 'page' : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
