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

/**
 * Normalise whatever the CMS stored to `YYYY-MM-DD`, the form every date is
 * COMPARED in (it sorts as plain text). Staff type MM/DD/YYYY; older files
 * say YYYY-MM-DD; both read the same. See `parseWhen`.
 */
export function toStoreDay(value: string | undefined | null): string | null {
  if (!value) return null
  return parseWhen(value)?.day ?? null
}

/** `2026-10-05` → `10/05/2026`, the form staff and visitors read. */
export function formatUsDay(isoDay: string | null | undefined): string | null {
  const match = isoDay?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return match ? `${match[2]}/${match[3]}/${match[1]}` : null
}

const stampFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: STORE_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

/** An instant as Pacific wall-clock time, `YYYY-MM-DD HH:mm` — sorts as a string. */
export function pacificStamp(instant: Date): string {
  const parts = Object.fromEntries(
    stampFormatter.formatToParts(instant).map((part) => [part.type, part.value])
  )
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * What staff typed, as Pacific wall-clock time. A date alone has no time; the
 * caller decides whether that means the start or the end of the day.
 *
 * The house format is MM/DD/YYYY, with an optional time (owner's direction,
 * 30 Sep 2026): `10/05/2026`, `10/5/2026`, `10/05/2026 12:00 PM`,
 * `10/05/2026 5pm`, `10/05/2026 17:00`. Also read, so nothing already saved
 * breaks: `2026-10-05` (with or without a time) and a full ISO instant with a
 * zone, which is converted to Pacific.
 *
 * Returns the day as `YYYY-MM-DD` and the time as 24-hour `HH:mm` — the forms
 * that compare correctly as text. They are never shown to anyone.
 */
export function parseWhen(value: string): { day: string; time?: string } | null {
  const v = value.trim()
  if (!v) return null

  // A full instant carries its own zone: convert it, never read it as local.
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(v) && v.includes('T')) {
    const instant = new Date(v)
    if (Number.isNaN(instant.getTime())) return null
    const stamp = pacificStamp(instant)
    return { day: stamp.slice(0, 10), time: stamp.slice(11) }
  }

  let y: number, m: number, d: number
  let rest: string
  const us = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(.*)$/)
  const iso = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(.*)$/)
  if (us) [y, m, d, rest] = [Number(us[3]), Number(us[1]), Number(us[2]), us[4] ?? '']
  else if (iso) [y, m, d, rest] = [Number(iso[1]), Number(iso[2]), Number(iso[3]), iso[4] ?? '']
  else return null

  const probe = new Date(Date.UTC(y, m - 1, d))
  if (probe.getUTCFullYear() !== y || probe.getUTCMonth() !== m - 1 || probe.getUTCDate() !== d) {
    return null // 02/30/2026
  }
  const day = `${y}-${pad(m)}-${pad(d)}`

  rest = rest.trim().replace(/^T/i, '').replace(/^at\s+/i, '')
  if (!rest) return { day }

  // 12:00 PM · 5pm · 5:30 p.m.
  const twelve = rest.match(/^(\d{1,2})(?::(\d{2}))?\s*([ap])\.?\s*m\.?$/i)
  if (twelve) {
    const hour12 = Number(twelve[1])
    const minute = Number(twelve[2] ?? '0')
    if (hour12 < 1 || hour12 > 12 || minute > 59) return null
    const pm = (twelve[3] ?? '').toLowerCase() === 'p'
    const hour = (hour12 % 12) + (pm ? 12 : 0)
    return { day, time: `${pad(hour)}:${pad(minute)}` }
  }
  // 17:00 · 17:00:00
  const clock = rest.match(/^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/)
  const hour = Number(clock?.[1])
  const minute = Number(clock?.[2])
  if (!clock || hour > 23 || minute > 59) return null
  return { day, time: `${pad(hour)}:${pad(minute)}` }
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
