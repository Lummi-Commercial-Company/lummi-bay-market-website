import { connection } from 'next/server'
import { readContentJson } from './content'
import { fuelPricesFromLive, withOtherStores } from './live-shapes'
import { liveDocument } from './tina-live'
import { shortLabelOf } from './locations'
import { formatUsDay, toStoreDay } from './pacific-time'
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
 * Done 1 Oct 2026: the read is the TinaCloud content API (lib/tina-live.ts),
 * so a saved price is on the site within about 10–20 seconds instead of at
 * the end of the next deploy. The file in this repo is the fallback when the
 * API cannot be reached, and the source in local development.
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
  const live = await liveDocument('fuelPrices', FUEL_PRICES_PATH)
  const doc = live
    ? fuelPricesFromLive(live)
    : await readContentJson<FuelPricesDoc & { otherStores?: unknown }>(FUEL_PRICES_PATH)
  if (!doc) return EMPTY_PRICES
  return {
    // `linkLocations` records the checkbox position in the CMS and nothing
    // else. It must never decide what the site reads — the site always reads
    // the per-location entries (ADR 0004).
    linkLocations: doc.linkLocations === true,
    // Stores added after the first three are a list in the file (ADR 0030).
    locations: withOtherStores(
      { ...EMPTY_PRICES.locations, ...(doc.locations ?? {}) },
      (doc as { otherStores?: unknown }).otherStores
    ),
    truckStop: doc.truckStop ?? {},
    source: live ? 'live' : 'build',
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
 * Every priced place: the Truck Stop first, then the Locations in site order
 * (ADR 0005 / ADR 0009) — `locations` arrives sorted from getLocations().
 *
 * The first three always have a row. A Location added later has one only once
 * a price is entered for it (ADR 0030): until then it is a store with nothing
 * posted, and a row of dashes would read as "sold out".
 */
const ORIGINAL_THREE = new Set(['exit-260', 'minimart', 'fishermans-cove'])

export function allPriceRows(locations: LocationDoc[], prices: FuelPricesDoc): PriceRow[] {
  const rows: PriceRow[] = [truckStopRow(prices)]
  for (const loc of locations) {
    const own = prices.locations[loc.id]
    const priced = own && FUEL_GRADES.some((grade) => typeof own[grade] === 'number')
    if (ORIGINAL_THREE.has(loc.id) || priced) rows.push(locationRow(loc, prices))
  }
  return rows
}

/**
 * Prices are posted to the cent, and sometimes to the tenth of a cent. Keep
 * whatever precision was entered rather than rounding a posted price.
 *
 * No currency symbol: ADR 0005 draws the card and the full table as bare
 * numbers, which is also how the number reads on the sign at the pump. The
 * table's caption says what the numbers are — "Fuel prices per gallon" — so
 * the unit is announced once rather than repeated in every cell.
 */
const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
})

export function formatPrice(value: number | undefined): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return priceFormatter.format(value)
}

/** The most recent `updated` stamp across the rows shown. */
export function latestUpdated(rows: PriceRow[]): string | null {
  // Compared as YYYY-MM-DD, whatever was typed: MM/DD/YYYY does not sort as
  // text (12/01/2025 would beat 01/05/2026).
  const stamps = rows
    .map((row) => toStoreDay(row.prices.updated))
    .filter((stamp): stamp is string => stamp !== null)
    .sort()
  return stamps.length > 0 ? (stamps[stamps.length - 1] ?? null) : null
}

/** The stamp as the house date format, MM/DD/YYYY (owner's direction, 30 Sep 2026). */
export function formatUpdated(stamp: string | null): string | null {
  return formatUsDay(toStoreDay(stamp))
}
