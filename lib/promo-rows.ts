import { isRowLayout, MAX_PROMO_ROWS, type RowLayout } from './promos'

/**
 * A list of promo rows as the CMS stores it — `[{ layout: '2' }, …]` — to the
 * layouts the region draws. An unknown layout is dropped and logged; past six
 * rows the list is cut, because the page never draws more (ADR 0018).
 */
export function asRowLayouts(value: unknown): RowLayout[] {
  if (!Array.isArray(value)) return []
  const rows: RowLayout[] = []
  for (const entry of value) {
    const layout = (entry as Record<string, unknown> | null)?.layout ?? entry
    if (isRowLayout(layout)) rows.push(layout)
    else console.error(`[promos] unknown row layout ${JSON.stringify(layout)}; row skipped`)
  }
  if (rows.length > MAX_PROMO_ROWS) {
    console.error(`[promos] ${rows.length} promo rows set; only the first ${MAX_PROMO_ROWS} are used`)
  }
  return rows.slice(0, MAX_PROMO_ROWS)
}
