import Link from 'next/link'
import styles from './LocationList.module.css'
import { getPages } from '@/lib/pages'
import type { LocationDoc } from '@/lib/types'

/**
 * The parts of a store with a page of their own — "Also inside Exit 260:
 * Liquor Store · Tobacco & Liquor Drive-Thru" (owner, 2 Oct 2026). Set in
 * Location Details → "Also inside this location (pages)". A page that has been
 * removed is skipped, never a dead link; nothing at all renders when there are
 * none.
 */
export async function insideLinksFor(location: LocationDoc): Promise<{ href: string; label: string }[]> {
  if (!location.inside.length) return []
  const pages = await getPages()
  return location.inside
    .map((slug) => pages.find((page) => page.slug === slug))
    .filter((page): page is NonNullable<typeof page> => Boolean(page))
    .map((page) => ({ href: `/${page.slug}`, label: page.navLabel || page.title }))
}

export async function InsideLinks({ location, className }: { location: LocationDoc; className?: string }) {
  const links = await insideLinksFor(location)
  if (!links.length) return null
  return (
    <p className={`${styles.inside} ${className ?? ''}`}>
      <span className={styles.insideLabel}>Also inside {location.navLabel}</span>
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={styles.insideLink}>
          {link.label} →
        </Link>
      ))}
    </p>
  )
}
