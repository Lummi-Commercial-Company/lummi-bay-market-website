import type { LocationDoc, LocationSlug } from './types'

/**
 * Which Locations come first, and what a Location id may be (ADR 0030). Kept
 * free of Next.js so it is tested directly (lib/location-order.test.ts).
 */

/** The usual order of the first three: the flagship, then the Minimart, then the Cove. */
export const LOCATION_ORDER: LocationSlug[] = ['exit-260', 'minimart', 'fishermans-cove']

/** Lowercase letters, digits and hyphens: what a web address can safely be. */
const SAFE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isUsableLocationId(id: string): boolean {
  return SAFE_ID.test(id)
}

/**
 * A Location's "Position in lists" when one is set; otherwise the usual
 * order — the first three are 1, 2 and 3 — then any others A–Z. A set
 * position wins a tie with the usual one, so a new store given 2 is second.
 */
export function compareLocations(
  a: Pick<LocationDoc, 'id' | 'order' | 'name'>,
  b: Pick<LocationDoc, 'id' | 'order' | 'name'>
): number {
  const rank = (l: Pick<LocationDoc, 'id' | 'order'>) => {
    if (typeof l.order === 'number') return l.order
    const usual = LOCATION_ORDER.indexOf(l.id)
    return usual >= 0 ? usual + 1 : Number.POSITIVE_INFINITY
  }
  const set = (l: Pick<LocationDoc, 'order'>) => (typeof l.order === 'number' ? 0 : 1)
  return rank(a) - rank(b) || set(a) - set(b) || a.name.localeCompare(b.name)
}
