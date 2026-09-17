import { cache } from 'react'
import { readContentFile, listContentFiles } from './content'
import { splitFrontmatter } from './frontmatter'
import { isWithinWindow, storeToday, windowLengthDays } from './pacific-time'
import type { HoursOverride, LocationDoc, LocationSlug } from './types'

/**
 * The Location set. Exactly three exist and there are no others in scope
 * (CONTEXT.md). Every list of Locations on the site is derived from this —
 * never authored per page (ADR 0009).
 *
 * Display order is fixed: Exit 260 (the flagship), Minimart, Fisherman's Cove.
 */
export const LOCATION_ORDER: LocationSlug[] = ['exit-260', 'minimart', 'fishermans-cove']

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
}

function asOverrides(value: unknown): HoursOverride[] {
  if (!Array.isArray(value)) return []
  const out: HoursOverride[] = []
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue
    const record = entry as Record<string, unknown>
    const hours = asString(record.hours)
    const startsAt = asString(record.startsAt)
    const endsAt = asString(record.endsAt)
    // `endsAt` is required (ADR 0027). An override with no end never reverts,
    // and a wrong opening time still looks like an opening time — so an entry
    // missing it is dropped rather than applied forever.
    if (!hours || !startsAt || !endsAt) continue
    out.push({ hours, reason: asString(record.reason) || undefined, startsAt, endsAt })
  }
  return out
}

function toLocation(data: Record<string, unknown>, body: string): LocationDoc | null {
  const id = asString(data.id) as LocationSlug
  if (!LOCATION_ORDER.includes(id)) return null

  const truckStopRaw = data.truckStop as Record<string, unknown> | undefined
  const heroRaw = data.hero as Record<string, unknown> | undefined

  return {
    id,
    name: asString(data.name),
    navLabel: asString(data.navLabel),
    shortLabel: asString(data.shortLabel) || undefined,
    aka: asString(data.aka) || undefined,
    address: asString(data.address),
    city: asString(data.city),
    state: asString(data.state),
    zip: asString(data.zip),
    phone: asString(data.phone),
    hours: asString(data.hours),
    hoursOverrides: asOverrides(data.hoursOverrides),
    cardLine: asString(data.cardLine),
    lat: typeof data.lat === 'number' ? data.lat : undefined,
    lng: typeof data.lng === 'number' ? data.lng : undefined,
    amenities: asStringList(data.amenities),
    truckStop:
      truckStopRaw && typeof truckStopRaw === 'object'
        ? {
            phone: asString(truckStopRaw.phone),
            hours: asString(truckStopRaw.hours),
            amenities: asStringList(truckStopRaw.amenities),
            hoursOverrides: asOverrides(truckStopRaw.hoursOverrides),
          }
        : undefined,
    hero: heroRaw
      ? { image: asString(heroRaw.image) || undefined, alt: asString(heroRaw.alt) || undefined }
      : undefined,
    body,
  }
}

export const getLocations = cache(async function getLocations(): Promise<LocationDoc[]> {
  const files = await listContentFiles('locations')
  const docs: LocationDoc[] = []
  for (const file of files) {
    const raw = await readContentFile(`locations/${file}`)
    if (!raw) continue
    const { data, body } = splitFrontmatter(raw)
    const doc = toLocation(data, body)
    if (doc) docs.push(doc)
  }
  return docs.sort(
    (a, b) => LOCATION_ORDER.indexOf(a.id) - LOCATION_ORDER.indexOf(b.id)
  )
})

export async function getLocation(id: LocationSlug): Promise<LocationDoc | undefined> {
  return (await getLocations()).find((loc) => loc.id === id)
}

/** exit-260 is the only Location carrying a Truck Stop record. */
export async function getTruckStop() {
  const exit260 = await getLocation('exit-260')
  return exit260?.truckStop
}

/** The label to print where horizontal room is scarce (the fuel price band). */
export function shortLabelOf(location: LocationDoc): string {
  return location.shortLabel || location.navLabel || location.name
}

export interface ResolvedHours {
  /** What to print. The override when one is live, otherwise the normal line. */
  hours: string
  /** The normal line, always. Detail pages show both. */
  standardHours: string
  /** Set only when an override is live. Detail page only — never the card. */
  reason?: string
  isOverride: boolean
}

/**
 * Resolve the hours line for a given day in Pacific time (ADR 0027).
 *
 * Evaluated per request against the visitor's date, so New Year's Eve hours are
 * typed in November and revert on their own with no scheduler and no rebuild.
 * When two windows overlap the shorter one wins — the specific exception beats
 * the broad one.
 */
export function resolveHours(
  standardHours: string,
  overrides: HoursOverride[] | undefined,
  day: string = storeToday()
): ResolvedHours {
  const live = (overrides ?? [])
    .filter((o) => isWithinWindow(day, o.startsAt, o.endsAt))
    .sort((a, b) => windowLengthDays(a.startsAt, a.endsAt) - windowLengthDays(b.startsAt, b.endsAt))

  const winner = live[0]
  if (!winner) {
    return { hours: standardHours, standardHours, isOverride: false }
  }
  return {
    hours: winner.hours,
    standardHours,
    reason: winner.reason,
    isOverride: true,
  }
}

/**
 * The card line with the hours half swapped for a live override. The street
 * half is untouched and the same length budget applies, so the override text
 * has to be as short as the line it replaces (ADR 0009, ADR 0027).
 */
export function resolveCardLine(location: LocationDoc, day: string = storeToday()): string {
  const resolved = resolveHours(location.hours, location.hoursOverrides, day)
  if (!resolved.isOverride) return location.cardLine
  if (location.cardLine.includes(location.hours)) {
    return location.cardLine.replace(location.hours, resolved.hours)
  }
  return location.cardLine
}
