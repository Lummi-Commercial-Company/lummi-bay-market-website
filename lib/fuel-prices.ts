import { connection } from 'next/server'
import { readContentJson } from './content'
import { LOCATION_ORDER, shortLabelOf } from './locations'
import type { FuelGrade, FuelPricesDoc, LocationDoc, PricedPlace } from './types'

/**
 * Fuel prices — the single price source for the whole site.
 *
 * All eight prices live in `content/fuel-prices.json` (ADR 0004). Nothing else
 * stores a price: not the Location files, not page copy, not a component
 * default. If you are about to type a number with a dollar sign in front of it,
 * stop.
 *
 * ADR 0024: a price is live the moment staff publish it, not at the end of the
 * next deploy. `getFuelPrices()` therefore opts the caller out of prerendering
 * with `connection()` and is meant to be called inside a <Suspense> boundary so
 * the rest of the page stays static.
 *
 * PHASE 2: the read below becomes a query against the Tina content API, which
 * is what makes "live on publish" true. Until that project exists the file in
 * this repo is both the source and the fallback, which means a price is live at
 * the end of the next deploy — roughly two minutes. That gap is the open
 * business question in `docs/roadmap.md` Phase 0 item 6.
 */

export const FUEL_PRICES_PATH = 'fuel-prices.json'

/** Grade order is fixed so the table's columns never reshuffle. */
export const FUEL_GRADES: FuelGrade[] = ['regular', 'diesel', 'def']

export const FUEL_GRADE_LABELS: Record<FuelGrade, string> = {
  regular: 'Regular',
  diesel: 'Diesel',
  def: 'DEF',
}

/** Used when the content file is missing or unreadable. Renders as em-dashes. */
const EMPTY_PRICES: FuelPricesDoc = {
  linkLocations: false,
  locations: {
    'exit-260': {},
    minimart: {},
    'fishermans-cove': {},
  },
  truckStop: {},
}

export async function getFuelPrices(): Promise<FuelPricesDoc> {
  // Per request, never baked in. See ADR 0024 and the comment in next.config.js.
  await connection()
  const doc = await readContentJson<FuelPricesDoc>(FUEL_PRICES_PATH)
  if (!doc) return EMPTY_PRICES
  return {
    // `linkLocations` records the checkbox position in the CMS and nothing
    // else. It must never decide what the site reads — the site always reads
    // the per-location entries (ADR 0004).
    linkLocations: doc.linkLocations === true,
    locations: { ...EMPTY_PRICES.locations, ...(doc.locations ?? {}) },
    truckStop: doc.truckStop ?? {},
  }
}

export interface PriceRow {
  /** Stable key: a Location slug, or 'truck-stop'. */
  key: string
  /** The tightest label that fits the band. */
  label: string
  /** Where the row links, when it links. */
  href?: string
  prices: PricedPlace
}

/** The grades actually sold by the rows on screen — the table's column set. */
export function columnsFor(rows: PriceRow[]): FuelGrade[] {
  return FUEL_GRADES.filter((grade) =>
    rows.some((row) => typeof row.prices[grade] === 'number')
  )
}

export function truckStopRow(prices: FuelPricesDoc): PriceRow {
  return {
    key: 'truck-stop',
    label: 'Truck Stop',
    href: '/truck-stop',
    prices: prices.truckStop,
  }
}

export function locationRow(location: LocationDoc, prices: FuelPricesDoc): PriceRow {
  return {
    key: location.id,
    label: shortLabelOf(location),
    href: `/locations/${location.id}`,
    prices: prices.locations[location.id] ?? {},
  }
}

/**
 * Every priced place, in the fixed site order: the Truck Stop callout first,
 * then Exit 260, Minimart, Fisherman's Cove (ADR 0005 / ADR 0009).
 */
export function allPriceRows(locations: LocationDoc[], prices: FuelPricesDoc): PriceRow[] {
  const byId = new Map(locations.map((loc) => [loc.id, loc]))
  const rows: PriceRow[] = [truckStopRow(prices)]
  for (const id of LOCATION_ORDER) {
    const loc = byId.get(id)
    if (loc) rows.push(locationRow(loc, prices))
  }
  return rows
}

/**
 * Prices are posted to the cent, and sometimes to the tenth of a cent. Keep
 * whatever precision was entered rather than rounding a posted price.
 */
const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
})

export function formatPrice(value: number | undefined): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return priceFormatter.format(value)
}

/** The most recent `updated` stamp across the rows shown. */
export function latestUpdated(rows: PriceRow[]): string | null {
  const stamps = rows
    .map((row) => row.prices.updated)
    .filter((stamp): stamp is string => typeof stamp === 'string' && stamp !== '')
    .sort()
  return stamps.length > 0 ? (stamps[stamps.length - 1] ?? null) : null
}

export function formatUpdated(stamp: string | null): string | null {
  if (!stamp) return null
  const parsed = new Date(`${stamp}T12:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return null
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed)
}
