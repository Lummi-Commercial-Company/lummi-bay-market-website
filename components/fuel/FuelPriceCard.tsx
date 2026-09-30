'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import styles from './FuelPriceBlock.module.css'
import type { SerialisedRow } from './FuelPriceBlock'

/**
 * The interactive face of the fuel price block (ADR 0005).
 *
 * Three rules this file exists to keep:
 *
 *  1. CONDENSING MUST MOVE THE PAGE 0px. The resting height stays reserved and
 *     the two faces swap by visibility, never by removal. A block that shrinks
 *     drags everything below it up mid-scroll.
 *
 *  2. CONDENSING CLOSES THE PANEL; IT MUST NEVER PREVENT IT. Hiding the panel
 *     with `display: none` while condensed once stopped an open panel hanging
 *     off the bar — and also made "All prices" do nothing in the one state
 *     where it is the only way to see them.
 *
 *  3. EVERY BLOCK LOADS COLLAPSED, ON EVERY PAGE. Including Home. A block that
 *     loads expanded is too tall to reserve a height for, which is what blocks
 *     Home from condensing at all.
 *
 * The trigger is a sentinel, not a scroll handler: an IntersectionObserver
 * whose root margin pulls the root's top edge down to the underside of the
 * sticky header, so "scrolled past the card" means what it says. Where the
 * rail is sticky (from 720px) the sentinel watched is the rail's mark, which
 * stays where the block rests — the block's own would travel with it.
 */
export function FuelPriceCard({
  subjectKey,
  companionKey,
  card,
  panel,
  companion,
  cardColumnLabels,
  panelColumnLabels,
  updated,
}: {
  subjectKey: string
  companionKey?: string
  card: SerialisedRow[]
  panel: SerialisedRow[]
  companion?: SerialisedRow
  cardColumnLabels: string[]
  panelColumnLabels: string[]
  updated: string | null
}) {
  const [condensed, setCondensed] = useState(false)
  const [open, setOpen] = useState(false)
  const sentinel = useRef<HTMLDivElement | null>(null)
  const panelId = useId()

  useEffect(() => {
    const own = sentinel.current
    if (!own) return
    const before = own.closest('[data-rail]')?.previousElementSibling
    const mark = before instanceof HTMLElement && before.hasAttribute('data-rail-mark') ? before : null
    const sticky = window.matchMedia('(min-width: 720px)')
    let observer: IntersectionObserver | null = null

    const watch = () => {
      observer?.disconnect()
      // Read each time: the emergency notice changes the header's height.
      const headerHeight =
        parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--hd-h'),
          10
        ) || 76
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return
          setCondensed(!entry.isIntersecting)
        },
        // Pull the root's top edge to the underside of the sticky header.
        { rootMargin: `-${headerHeight}px 0px 0px 0px`, threshold: 0 }
      )
      observer.observe(sticky.matches && mark ? mark : own)
    }

    watch()
    sticky.addEventListener('change', watch)
    return () => {
      sticky.removeEventListener('change', watch)
      observer?.disconnect()
    }
  }, [])

  // Condensing closes the panel. It does not stop it being reopened.
  useEffect(() => {
    setOpen(false)
  }, [condensed])

  const subjectRow = card.find((row) => row.key === subjectKey) ?? card[0]
  const livePanelRows = condensed && companion ? [companion, ...panel] : panel
  const liveColumns = condensed || panel.length > 0 ? panelColumnLabels : cardColumnLabels

  return (
    <aside className={styles.block} aria-label="Fuel prices" data-condensed={condensed}>
      {/* Marks the point the card has scrolled past. Zero height, no paint. */}
      <div ref={sentinel} className={styles.sentinel} aria-hidden="true" />

      <div className={styles.reserve} data-open={open}>
        {/* The cue sits ABOVE the table, with a chevron — ADR 0005 draws the
            card that way. It is a real button: operated by keyboard,
            announced, and its state is `aria-expanded`. It keeps its box in
            every state, which is what lets the condensed bar be drawn over the
            reserved space without the block changing height (rule 1 above). */}
        <button
          type="button"
          className={styles.cue}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <Chevron />
          {condensed ? (
            // The bar's own control, at its right-hand end (ADR 0005).
            <span>
              All<span className={styles.cueWord}> prices</span>
            </span>
          ) : open ? (
            'Hide other prices'
          ) : (
            'View all prices'
          )}
        </button>

        {/* ---- Resting: the card ---- */}
        <div className={styles.stacked} aria-hidden={condensed}>
          <table className={styles.table}>
            <caption className="visually-hidden">Fuel prices per gallon</caption>
            <thead>
              <tr>
                <th scope="col" className={styles.placeHead}>
                  <span className="visually-hidden">Place</span>
                </th>
                {cardColumnLabels.map((label) => (
                  <th scope="col" key={label} className={styles.gradeHead}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {card.map((row) => (
                <tr key={row.key} className={row.key === companionKey ? styles.oncond : undefined}>
                  <th scope="row" className={styles.place}>
                    {row.href ? <Link href={row.href}>{row.label}</Link> : row.label}
                  </th>
                  {row.cells.map((cell, index) => (
                    <PriceCell key={cardColumnLabels[index] ?? index} value={cell} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ---- Condensed: the one-line bar, pinned to the card's width ---- */}
        {/* "Exit 260 │ REG 4.89  DIESEL 6.99" — the page's own place and only
            what it sells; a not-sold grade is the panel's business, not the
            bar's (ADR 0005 draws it this way). */}
        <div className={styles.oneline} aria-hidden={!condensed}>
          <span className={styles.onelinePlace}>{subjectRow?.label}</span>
          <span className={styles.onelineSep} aria-hidden="true" />
          <span className={styles.onelinePrices}>
            {subjectRow?.cells.map((cell, index) =>
              cell ? (
                <span key={cardColumnLabels[index] ?? index} className={styles.onelineCell}>
                  <span className={styles.onelineGrade}>{shortGrade(cardColumnLabels[index])}</span>
                  <span className={styles.onelineValue}>{cell}</span>
                </span>
              ) : null
            )}
          </span>
        </div>

        {/* ---- Expanded: the panel ----
            Never `display: none` — it is hidden by the `data-open` state on the
            wrapper so that it stays openable in every state, condensed
            included. It butts onto the card: the card gives up its bottom
            border and the panel squares its top corners, so the two read as one
            object rather than two stacked cards. */}
        <div className={styles.panel} id={panelId} role="group" aria-label="Prices at our other places">
          <table className={styles.table}>
            <thead className={condensed ? undefined : styles.panelHeadAtRest}>
              <tr>
                <th scope="col" className={styles.placeHead}>
                  <span className="visually-hidden">Place</span>
                </th>
                {liveColumns.map((label) => (
                  <th scope="col" key={label} className={styles.gradeHead}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {livePanelRows.map((row) => (
                <tr key={row.key}>
                  <th scope="row" className={styles.place}>
                    {row.href ? <Link href={row.href}>{row.label}</Link> : row.label}
                  </th>
                  {row.cells.map((cell, index) => (
                    <PriceCell key={liveColumns[index] ?? index} value={cell} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <p className={styles.stamp}>
            {updated ? <>Updated {updated}. </> : null}
            Prices subject to change.
          </p>
          <Link className={styles.allLink} href="/fuel-prices">
            All prices
          </Link>
        </div>
      </div>
    </aside>
  )
}

/** The bar is one line: "Regular" is "Reg" there, as ADR 0005 draws it. */
function shortGrade(label: string | undefined): string {
  return label === 'Regular' ? 'Reg' : (label ?? '')
}

/** The disclosure chevron. Points down when shut, up when open. */
function Chevron() {
  return (
    <svg
      className={styles.cueChevron}
      viewBox="0 0 10 6"
      width="10"
      height="6"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 1.5 5 4.5 9 1.5" />
    </svg>
  )
}

function PriceCell({ value }: { value: string | null }) {
  return <td className={value ? styles.price : styles.priceNa}>{value ?? <NotSold />}</td>
}

/** Not sold here. An em-dash, never a blank cell and never a zero. */
function NotSold() {
  return (
    <>
      <span aria-hidden="true">—</span>
      <span className="visually-hidden">not sold here</span>
    </>
  )
}
