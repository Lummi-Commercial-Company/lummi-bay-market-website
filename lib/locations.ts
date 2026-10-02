import { cacheLife, cacheTag } from 'next/cache'
import { liveCollection } from './tina-live'
import { CACHE_TAGS } from './cache-tags'
import { readContentFile, listContentFiles } from './content'
import { splitFrontmatter } from './frontmatter'
import { isWithinWindow, storeToday, windowLengthDays } from './pacific-time'
import { compareLocations, isUsableLocationId } from './location-order'
import type { HoursOverride, LocationDoc, LocationSlug } from './types'

/**
 * The Location set: every document in content/locations/. Staff can add one in
 * the CMS (owner, 2 Oct 2026; ADR 0030) — it was a fixed three until then.
 * Every list of Locations on the site is derived from it, never authored per
 * page (ADR 0009), so a new Location appears in the Locations index and menu,
 * on /contact, in the sitemap, and in the fuel table once it has a price.
 *
 * Its id is its file name, which is its web address. Order: a Location's
 * "Position in lists" when one is set; otherwise the usual order — Exit 260
 * (the flagship), Minimart, Fisherman's Cove — then any others A–Z.
 */
export { compareLocations, isUsableLocationId, LOCATION_ORDER } from './location-order'

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

/**
 * A Location's main photo, if it is one the site can show: a file uploaded to
 * this site. Anything else would load a third party's file on every visit
 * (ADR 0025), and the image optimiser refuses it anyway; a header motif is a
 * mask shape, not a photo (ADR 0021). Shown on the Location's page and on its
 * card wherever Location cards appear (owner, 1 Oct 2026).
 */
export function sitePhoto(value: unknown): string | undefined {
  const path = asString(value)
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/uploads/motifs/')) return undefined
  return path
}

/** `inside` rows (`{ page: 'content/pages/liquor-store.mdx' }`) to page slugs. */
function asInside(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((row) => (row as Record<string, unknown> | null)?.page ?? row)
    .map((ref) => (typeof ref === 'string' ? ref.split('/').pop()?.replace(/\.mdx?$/, '') : undefined))
    .filter((slug): slug is string => Boolean(slug))
}

function asHero(value: unknown): { image?: string; alt?: string } | undefined {
  if (!value || typeof value !== 'object') return undefined
  const hero = value as Record<string, unknown>
  return { image: sitePhoto(hero.image), alt: asString(hero.alt) || undefined }
}

function toLocation(data: Record<string, unknown>, body: string, fileId: string): LocationDoc | null {
  // The file name is the id and the address. The first three also carry an
  // `id` line, which matches; a Location added in the CMS has only its name.
  const id = asString(data.id).trim() || fileId
  if (!isUsableLocationId(id)) {
    console.error(`[locations] "${id}" is not a usable web address (lowercase letters, numbers and hyphens); skipped`)
    return null
  }
  // "Show on the website" off: written but not yet open. Unset means shown.
  if (data.showOnSite === false) return null

  const truckStopRaw = data.truckStop as Record<string, unknown> | undefined

  return {
    id,
    order: typeof data.order === 'number' && Number.isFinite(data.order) ? data.order : undefined,
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
    summary: asString(data.summary) || undefined,
    lat: typeof data.lat === 'number' ? data.lat : undefined,
    lng: typeof data.lng === 'number' ? data.lng : undefined,
    amenities: asStringList(data.amenities),
    inside: asInside(data.inside),
    truckStop:
      truckStopRaw && typeof truckStopRaw === 'object'
        ? {
            phone: asString(truckStopRaw.phone),
            hours: asString(truckStopRaw.hours),
            amenities: asStringList(truckStopRaw.amenities),
            hoursOverrides: asOverrides(truckStopRaw.hoursOverrides),
            summary: asString(truckStopRaw.summary) || undefined,
            hero: asHero(truckStopRaw.hero),
          }
        : undefined,
    hero: asHero(data.hero),
    body,
  }
}

export async function getLocations(): Promise<LocationDoc[]> {
  'use cache'
  cacheTag(CACHE_TAGS.locations)
  cacheLife('max')

  const files = await listContentFiles('locations')
  const docs: LocationDoc[] = []
  for (const file of files) {
    if (file.startsWith('.')) continue
    const raw = await readContentFile(`locations/${file}`)
    if (!raw) continue
    const { data, body } = splitFrontmatter(raw)
    const doc = toLocation(data, body, file.replace(/\.mdx?$/, ''))
    if (doc) docs.push(doc)
  }
  return docs.sort(compareLocations)
}

/**
 * The Locations read live from the CMS (lib/tina-live.ts), for the parts that
 * work out the hours per visit — so temporary hours saved a moment ago show
 * within seconds. The built files are the fallback, and still supply each
 * Location's body text. The CMS calls the `id` field `slug` (tina/config.ts,
 * `nameOverride`), so it is read under either name.
 */
export async function getLiveLocations(): Promise<LocationDoc[]> {
  const docs = await liveCollection('locations')
  const built = await getLocations()
  if (!docs) return built
  const live = docs
    .map(({ values, filename }) => {
      const fileId = filename.replace(/\.mdx?$/, '')
      const id = asString(values.id) || asString(values.slug) || fileId
      return toLocation({ ...values, id }, built.find((b) => b.id === id)?.body ?? '', fileId)
    })
    .filter((doc): doc is LocationDoc => doc !== null)
  return live.length ? live.sort(compareLocations) : built
}

/**
 * Hours by the key the pages use: a Location's id (`minimart`), or its id and
 * `-truck-stop` for the Truck Stop on its property (`exit-260-truck-stop`).
 */
export function hoursFor(
  locations: LocationDoc[],
  key: string
): { hours: string; hoursOverrides?: LocationDoc['hoursOverrides'] } | undefined {
  const truck = key.endsWith('-truck-stop')
  const location = locations.find((l) => l.id === (truck ? key.slice(0, -'-truck-stop'.length) : key))
  return truck ? location?.truckStop : location
}

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
