'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import { isCurrent, NAV_ITEMS, type SubNavItem } from './nav-items'
import styles from './SiteHeader.module.css'

/**
 * The phone navigation: a ☰ button at the right of the header, after the Get
 * the App pill, opening the three nav items (ADR 0029).
 *
 * The approved template draws the button but not what it opens, so the panel
 * is the minimum that works: the same three items as the desktop nav, full
 * width under the header, in the header's own colours.
 *
 * It closes on Escape (focus returns to the button), on a tap outside it, and
 * whenever the page changes — a client-side navigation keeps this component
 * mounted, so without that the menu would stay open over the new page.
 *
 * The panel is `position: fixed` at the header's live height, not a child
 * positioned inside the header: the header clips its overflow for the motif
 * band, and anything absolutely positioned inside it would be cut off.
 * Being out of flow, the panel also cannot change the height it is placed by.
 *
 * Under "Locations" it lists every place, indented, as the desktop Locations
 * list does (owner, 2 Oct 2026; ADR 0008 amended) — still three top-level items.
 */
export function MobileMenu({ locationsMenu = [] }: { locationsMenu?: SubNavItem[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const panelId = useId()
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLElement | null>(null)

  // A new page closes the menu.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return
      setOpen(false)
    }

    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.menuBtn}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Close menu' : 'Menu'}
        onClick={() => setOpen((value) => !value)}
      >
        <svg
          viewBox="0 0 20 20"
          width="20"
          height="20"
          aria-hidden="true"
          focusable="false"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          {open ? (
            <path d="M5 5l10 10M15 5 5 15" />
          ) : (
            <path d="M3 5.5h14M3 10h14M3 14.5h14" />
          )}
        </svg>
      </button>

      <nav
        ref={panelRef}
        id={panelId}
        className={styles.menuPanel}
        aria-label="Main"
        hidden={!open}
      >
        <ul className={styles.menuList}>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={styles.menuLink}
                aria-current={isCurrent(item.href, pathname) ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
              {item.href === '/locations' && locationsMenu.length ? (
                <SubList items={locationsMenu} pathname={pathname} onPick={() => setOpen(false)} />
              ) : null}
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}

function SubList({ items, pathname, onPick }: { items: SubNavItem[]; pathname: string; onPick: () => void }) {
  return (
    <ul className={styles.menuSub}>
      {items.map((entry) => (
        <li key={entry.href}>
          <Link
            href={entry.href}
            className={`${styles.menuLink} ${styles.menuSubLink}`}
            aria-current={pathname === entry.href ? 'page' : undefined}
            onClick={onPick}
          >
            {entry.label}
          </Link>
          {entry.children?.length ? <SubList items={entry.children} pathname={pathname} onPick={onPick} /> : null}
        </li>
      ))}
    </ul>
  )
}
