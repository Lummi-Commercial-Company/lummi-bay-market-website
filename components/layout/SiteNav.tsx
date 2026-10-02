'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { isCurrent, NAV_ITEMS, type SubNavItem } from './nav-items'
import styles from './SiteHeader.module.css'

/**
 * The inline navigation — desktop only.
 *
 * On a phone these links are not in the header: they are behind the ☰ menu
 * (MobileMenu), because the header cannot hold the lockup, three links and the
 * Get the App pill below about 430px — which is every common phone (ADR 0029).
 *
 * "Locations" goes to /locations, as it always has, and also opens a list of
 * every place (owner, 2 Oct 2026; ADR 0008 amended): on hover for a mouse, and
 * from the small arrow beside it for a keyboard or a finger. Escape, a click
 * elsewhere or a new page closes it. The list is `position: fixed` under the
 * link — the header clips its overflow for the motif band, so anything
 * positioned inside it would be cut off (the ☰ panel does the same).
 */
export function SiteNav({ locationsMenu = [] }: { locationsMenu?: SubNavItem[] }) {
  const pathname = usePathname()

  return (
    <nav className={styles.nav} aria-label="Main">
      {NAV_ITEMS.map((item) =>
        item.href === '/locations' && locationsMenu.length ? (
          <LocationsItem key={item.href} item={item} menu={locationsMenu} pathname={pathname} />
        ) : (
          <Link
            key={item.href}
            href={item.href}
            className={styles.navLink}
            aria-current={isCurrent(item.href, pathname) ? 'page' : undefined}
          >
            {item.label}
          </Link>
        )
      )}
    </nav>
  )
}

function LocationsItem({
  item,
  menu,
  pathname,
}: {
  item: (typeof NAV_ITEMS)[number]
  menu: SubNavItem[]
  pathname: string
}) {
  const [open, setOpen] = useState(false)
  const [place, setPlace] = useState<{ top: number; left: number } | null>(null)
  const wrapRef = useRef<HTMLSpanElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  const panelId = useId()

  const show = useCallback(() => {
    window.clearTimeout(closeTimer.current)
    const box = wrapRef.current?.getBoundingClientRect()
    if (box) setPlace({ top: Math.round(box.bottom + 6), left: Math.round(box.left) })
    setOpen(true)
  }, [])
  // A short grace period, so the pointer can cross the gap into the list.
  const hideSoon = useCallback(() => {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setOpen(false), 180)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (target && (wrapRef.current?.contains(target) || panelRef.current?.contains(target))) return
      setOpen(false)
    }
    const onScroll = () => setOpen(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [open])

  const current = isCurrent(item.href, pathname) || menu.some((m) => pathname === m.href || m.children?.some((c) => pathname === c.href))

  return (
    <span
      ref={wrapRef}
      className={styles.navGroup}
      onPointerEnter={(event) => event.pointerType === 'mouse' && show()}
      onPointerLeave={(event) => event.pointerType === 'mouse' && hideSoon()}
    >
      <Link href={item.href} className={styles.navLink} aria-current={current ? 'page' : undefined}>
        {item.label}
      </Link>
      <button
        ref={buttonRef}
        type="button"
        className={styles.navToggle}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Show all locations"
        onClick={() => (open ? setOpen(false) : show())}
      >
        <svg viewBox="0 0 10 6" width="10" height="6" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 1.5 5 4.5 9 1.5" />
        </svg>
      </button>
      <div
        ref={panelRef}
        id={panelId}
        className={styles.navPanel}
        hidden={!open}
        style={place ? { top: place.top, left: place.left } : undefined}
        onPointerEnter={(event) => event.pointerType === 'mouse' && show()}
        onPointerLeave={(event) => event.pointerType === 'mouse' && hideSoon()}
      >
        <ul className={styles.navPanelList}>
          {menu.map((entry) => (
            <li key={entry.href}>
              <Link
                href={entry.href}
                className={styles.navPanelLink}
                aria-current={pathname === entry.href ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {entry.label}
              </Link>
              {entry.children?.length ? (
                <ul className={styles.navPanelSub}>
                  {entry.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className={`${styles.navPanelLink} ${styles.navPanelChild}`}
                        aria-current={pathname === child.href ? 'page' : undefined}
                        onClick={() => setOpen(false)}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </span>
  )
}
