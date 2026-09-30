import { parseWhen } from './pacific-time.ts'
import { promoState, type PromoState } from './promos.ts'
import type { SiteAlertDoc } from './types.ts'

/**
 * Emergency notices — the rules, with no I/O (ADR 0017, amended 30 Sep 2026).
 *
 * There is a list of them, not one. Each has a switch and an optional date
 * window, and whether it is showing is worked out on every visit, in Pacific
 * time — the same rule promotions use (lib/promos.ts `promoState`), so a
 * notice set to start at 6:00 AM on Saturday is up at 6:00 and down at its
 * end, with nobody publishing anything.
 *
 * No dates means what the single notice always meant: showing from the moment
 * it is switched on until it is switched off. So an emergency is still one
 * switch.
 *
 * The bar holds ONE notice. When several are live at once, the one highest in
 * the list shows — staff order the list, the site does not guess.
 */

export type NoticeState = PromoState

/** One saved notice to a document, or null when it has nothing to say. */
export function toNotice(raw: unknown): SiteAlertDoc | null {
  const data = (raw ?? {}) as Record<string, unknown>
  const headline = typeof data.headline === 'string' ? data.headline.trim() : ''
  if (!headline) return null
  const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : undefined)
  return {
    active: data.active === true,
    headline,
    detail: text(data.detail),
    link: text(data.link),
    updated: text(data.updated),
    startsAt: text(data.startsAt),
    endsAt: text(data.endsAt),
  }
}

/**
 * The list as saved, plus the one notice there was before the list existed
 * (`siteAlert`, a single object). Read either, so nothing already saved stops
 * showing.
 */
export function noticesFrom(settings: Record<string, unknown>): SiteAlertDoc[] {
  const list = Array.isArray(settings.alerts) ? settings.alerts : settings.siteAlert ? [settings.siteAlert] : []
  return list.map(toNotice).filter((notice): notice is SiteAlertDoc => notice !== null)
}

export function noticeState(notice: SiteAlertDoc, now: string): NoticeState {
  // A date the site cannot read keeps the notice off rather than guessing:
  // a typo in an end date must never mean "runs forever". The CMS refuses
  // such a date anyway.
  for (const when of [notice.startsAt, notice.endsAt]) {
    if (when && !parseWhen(when)) return 'off'
  }
  return promoState(notice, now)
}

/** The notice the bar shows right now, or null for no bar at all. */
export function liveNotice(notices: SiteAlertDoc[], now: string): SiteAlertDoc | null {
  return notices.find((notice) => noticeState(notice, now) === 'live') ?? null
}
