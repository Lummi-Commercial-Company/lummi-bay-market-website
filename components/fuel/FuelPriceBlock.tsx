import { FuelPriceCard } from './FuelPriceCard'
import styles from './FuelPriceBlock.module.css'
import { getLocations } from '@/lib/locations'
import {
  allPriceRows,
  columnsFor,
  FUEL_GRADE_LABELS,
  formatPrice,
  formatUpdated,
  getFuelPrices,
  latestUpdated,
} from '@/lib/fuel-prices'
import type { PriceRow } from '@/lib/fuel-prices'

/**
 * The fuel price block (ADR 0004, ADR 0005).
 *
 * One component, three states — resting card, condensed one-line bar, expanded
 * panel — on every page. It reads every number from `content/fuel-prices.json`
 * via the price layer; nothing here contains a price.
 *
 * It is async and calls `connection()` through `getFuelPrices()`, so it must be
 * rendered inside a <Suspense> boundary. That is the whole point: the page
 * shell stays static and prerendered while the prices resolve per request, so a
 * published price is live immediately (ADR 0024).
 */

export type FuelSubject = 'exit-260' | 'minimart' | 'fishermans-cove' | 'truck-stop'

export interface FuelPriceBlockProps {
  /**
   * The page's subject — not always a Location. On /truck-stop the Truck Stop
   * leads the table and Exit 260 is the row that moves into the panel.
   *
   * DECISION NEEDED: pages with no Location of their own (Home, /about,
   * /rewards) default to the flagship. ADR 0005 does not name a default and
   * this should be the client's call, not this file's.
   */
  subject?: FuelSubject
}

export async function FuelPriceBlock({ subject = 'exit-260' }: FuelPriceBlockProps) {
  const [locations, prices] = await Promise.all([getLocations(), getFuelPrices()])
  const rows = allPriceRows(locations, prices)

  const subjectRow = rows.find((row) => row.key === subject)
  if (!subjectRow) return null

  // The companion in the resting card: the Truck Stop, or Exit 260 when the
  // Truck Stop is the subject. It is the row that moves into the panel when the
  // block condenses — hence `oncond`, "in the card, not in the bar".
  const companionKey = subject === 'truck-stop' ? 'exit-260' : 'truck-stop'
  const companionRow = rows.find((row) => row.key === companionKey)

  const cardRows = companionRow ? [subjectRow, companionRow] : [subjectRow]
  // The panel adds only the places not currently on screen, never a repeat.
  // At rest that is everything outside the card; condensed it is that set plus
  // the companion, because the one-line bar carries a single place.
  const panelRows = rows.filter((row) => !cardRows.some((r) => r.key === row.key))

  // The column set is the union of grades sold by the rows on screen. A place
  // that does not sell a grade shows an em-dash, not a blank and not a zero.
  const cardColumns = columnsFor(cardRows)
  const panelColumns = columnsFor([...panelRows, ...(companionRow ? [companionRow] : [])])

  return (
    <FuelPriceCard
      subjectKey={subjectRow.key}
      companionKey={companionRow?.key}
      card={serialise(cardRows, cardColumns)}
      panel={serialise(panelRows, panelColumns)}
      companion={companionRow ? serialise([companionRow], panelColumns)[0] : undefined}
      cardColumnLabels={cardColumns.map((g) => FUEL_GRADE_LABELS[g])}
      panelColumnLabels={panelColumns.map((g) => FUEL_GRADE_LABELS[g])}
      updated={formatUpdated(latestUpdated(rows))}
    />
  )
}

export interface SerialisedRow {
  key: string
  label: string
  href?: string
  /** One cell per column, in column order. `null` means "not sold here". */
  cells: (string | null)[]
}

function serialise(rows: PriceRow[], columns: ReturnType<typeof columnsFor>): SerialisedRow[] {
  return rows.map((row) => ({
    key: row.key,
    label: row.label,
    href: row.href,
    cells: columns.map((grade) => formatPrice(row.prices[grade])),
  }))
}

/**
 * The Suspense fallback. It reserves the resting height exactly, so the page
 * does not move when the prices arrive — the same reason condensing reserves
 * its height (ADR 0005).
 */
export function FuelPriceBlockFallback() {
  return (
    <aside className={styles.block} aria-label="Fuel prices" aria-busy="true">
      <div className={styles.reserve} />
    </aside>
  )
}
