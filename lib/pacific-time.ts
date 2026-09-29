/**
 * Date windows are computed per visitor in Pacific time — no scheduler, no
 * cron, no rebuild. Promos (ADR 0018) and hours overrides (ADR 0027) both use
 * this. Dates are whole days and both ends are inclusive.
 *
 * The store is in Washington. "Today" therefore means today in
 * America/Los_Angeles, not today on the server and not today in the visitor's
 * own zone — a visitor in Tokyo must still see Bellingham's hours.
 */

export const STORE_TIME_ZONE = 'America/Los_Angeles'

const ymdFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: STORE_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Today in the store's time zone, as `YYYY-MM-DD`. */
export function storeToday(now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD, which sorts and compares as a plain string.
  return ymdFormatter.format(now)
}

/** Normalise whatever the CMS stored (date or ISO datetime) to `YYYY-MM-DD`. */
export function toStoreDay(value: string | undefined | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) return null
  return ymdFormatter.format(parsed)
}

/**
 * Is `day` inside [startsAt, endsAt]? Both ends inclusive; either end may be
 * omitted, which means "open on that side".
 */
export function isWithinWindow(
  day: string,
  startsAt?: string | null,
  endsAt?: string | null
): boolean {
  const start = toStoreDay(startsAt)
  const end = toStoreDay(endsAt)
  if (start && day < start) return false
  if (end && day > end) return false
  return true
}

/** Inclusive length of a window in days. Used to break overlaps. */
export function windowLengthDays(startsAt: string, endsAt: string): number {
  const start = Date.parse(`${toStoreDay(startsAt)}T00:00:00Z`)
  const end = Date.parse(`${toStoreDay(endsAt)}T00:00:00Z`)
  if (Number.isNaN(start) || Number.isNaN(end)) return Number.MAX_SAFE_INTEGER
  return Math.floor((end - start) / 86_400_000) + 1
}
