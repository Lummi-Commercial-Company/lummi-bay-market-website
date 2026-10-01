import { connection } from 'next/server'
import { getLiveLocations, hoursFor, resolveHours } from '@/lib/locations'
import type { HoursOverride } from '@/lib/types'

/**
 * Hours, evaluated per request against the visitor's date in Pacific time
 * (ADR 0027).
 *
 * This is a tiny dynamic island on an otherwise prerendered page. Wrap it in
 * <Suspense> and give the fallback the STANDARD hours: the prerendered HTML
 * then shows the normal opening time immediately and the override swaps in when
 * the request resolves. Nobody ever sees a blank where an opening time should
 * be, and the page shell stays static.
 *
 * Why per request at all: an override typed in November for New Year's Eve has
 * to start and stop on its own. A build-time value freezes the window to the
 * build date, which produces wrong opening hours that still look like opening
 * hours — the failure nobody notices.
 */

export async function LiveHours({
  hours,
  overrides,
  showReason = false,
  className,
  of,
}: {
  hours: string
  overrides?: HoursOverride[]
  /**
   * Whose hours: a Location id, or `{id}-truck-stop`. Given, the hours are read
   * live (lib/tina-live.ts) so temporary hours saved a moment ago show within
   * seconds; `hours` and `overrides` are then only the fallback.
   */
  of?: string
  /** The detail page shows the why; the card never does. */
  showReason?: boolean
  className?: string
}) {
  await connection()
  const current = of ? hoursFor(await getLiveLocations(), of) : undefined
  const resolved = resolveHours(current?.hours || hours, current ? current.hoursOverrides : overrides)

  if (!resolved.isOverride) return <span className={className}>{resolved.hours}</span>

  return (
    <span className={className}>
      {resolved.hours}
      {showReason ? (
        <>
          {' '}
          <span data-standard-hours>
            (usually {resolved.standardHours}
            {resolved.reason ? ` — ${resolved.reason}` : ''})
          </span>
        </>
      ) : null}
    </span>
  )
}
