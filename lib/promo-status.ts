import { formatUsDay, parseWhen } from './pacific-time.ts'
import {
  comparePromos,
  DEFAULT_PROMO_ROWS,
  isRowLayout,
  MAX_PROMO_ROWS,
  promoState,
  ROW_LAYOUTS,
  toPromo,
  type PromoDoc,
  type PromoState,
  type RowLayout,
} from './promos.ts'

/**
 * What the CMS tells staff about a promotion: Live, Scheduled, Ended or Off,
 * and in plain words where it is showing or why it is not (ADR 0018 §4 — the
 * state is derived, never stored).
 *
 * The same rules the site uses (lib/promos.ts), so the tag in the CMS and the
 * page a visitor sees cannot disagree. Pure: it runs in the editor's browser.
 */

export type StatusTag = PromoState | 'problem' | 'waiting'

export interface PromoStatus {
  tag: StatusTag
  /** Two or three words for the tag itself. */
  label: string
  /** One sentence: where it shows, or what to fix. */
  detail: string
}

const WHERE: Record<PromoDoc['placement'], string> = {
  home: 'the Home page',
  'all-interior': 'every page except Home',
  specific: 'the pages chosen',
}

function whenText(value: string | undefined): string {
  const when = value ? parseWhen(value) : null
  if (!when) return ''
  const day = formatUsDay(when.day) ?? when.day
  if (!when.time) return day
  const [h, m] = when.time.split(':').map(Number)
  const hour = h ?? 0
  const suffix = hour < 12 ? 'AM' : 'PM'
  return `${day} ${hour % 12 === 0 ? 12 : hour % 12}:${String(m ?? 0).padStart(2, '0')} ${suffix}`
}

/** The slots a set of rows holds. */
export function capacityOf(rows: RowLayout[]): number {
  return rows.slice(0, MAX_PROMO_ROWS).reduce((sum, row) => sum + ROW_LAYOUTS[row].spans.length, 0)
}

/** CMS row values → layouts, falling back as the site does. */
export function rowsFrom(value: unknown, fallback: RowLayout[] = DEFAULT_PROMO_ROWS): RowLayout[] {
  const rows = Array.isArray(value)
    ? value.map((row) => (row as Record<string, unknown> | null)?.layout ?? row).filter(isRowLayout)
    : []
  return rows.length ? rows : fallback
}

/**
 * One promotion's status on its own — for the banner in its form, where the
 * other promotions are not in view.
 *
 * `offerPageExists` is passed when known; unknown (undefined) is not treated
 * as a fault.
 */
export function describePromo(
  id: string,
  data: Record<string, unknown>,
  now: string,
  offerPageExists?: boolean
): PromoStatus & { promo?: PromoDoc } {
  const parsed = toPromo(id, data)
  if ('refused' in parsed) {
    return { tag: 'problem', label: 'Not showing', detail: `Not showing: ${parsed.refused}.` }
  }
  const promo = parsed.promo
  if (offerPageExists === false) {
    return {
      tag: 'problem',
      label: 'Not showing',
      detail: 'Not showing: the offer page it links to no longer exists. Choose another in "Page this links to".',
      promo,
    }
  }
  if (promo.placement === 'specific' && promo.pages.length === 0) {
    return {
      tag: 'problem',
      label: 'Not showing',
      detail: 'Not showing: "Specific pages only" is chosen, but no pages or locations are picked.',
      promo,
    }
  }

  const state = promoState(promo, now)
  const where = WHERE[promo.placement]
  const until = promo.endsAt ? ` until ${whenText(promo.endsAt)}` : ''
  switch (state) {
    case 'live':
      return { tag: 'live', label: 'Live', detail: `Showing on ${where}${until}.`, promo }
    case 'scheduled':
      return {
        tag: 'scheduled',
        label: 'Scheduled',
        detail: `Starts ${whenText(promo.startsAt)} on ${where}${until}.`,
        promo,
      }
    case 'ended':
      return {
        tag: 'ended',
        label: 'Ended',
        detail: `Ended ${whenText(promo.endsAt)}. Move the end date later to bring it back.`,
        promo,
      }
    case 'off':
      return {
        tag: 'off',
        label: 'Off',
        detail: '"Running" is switched off, so it is not showing, whatever the dates say.',
        promo,
      }
  }
}

/**
 * Every promotion's status, with the one thing a single form cannot know:
 * whether a live promotion actually has a place, or is waiting because more
 * are live than the rows hold. Ordered as the site orders them.
 */
export function describeAll(
  docs: { id: string; data: Record<string, unknown> }[],
  now: string,
  options: { offerPages?: Set<string>; homeRows?: RowLayout[]; pageRows?: RowLayout[] } = {}
): { id: string; headline: string; status: PromoStatus }[] {
  const described = docs.map(({ id, data }) => {
    const link = typeof data.link === 'string' ? data.link.split('/').pop()?.replace(/\.mdx?$/, '') : undefined
    const exists = options.offerPages && link ? options.offerPages.has(link) : undefined
    return { id, headline: String(data.headline ?? id), ...describePromo(id, data, now, exists) }
  })

  const capacity = {
    home: capacityOf(options.homeRows ?? DEFAULT_PROMO_ROWS),
    'all-interior': capacityOf(options.pageRows ?? DEFAULT_PROMO_ROWS),
  }
  for (const placement of ['home', 'all-interior'] as const) {
    const live = described
      .filter((d) => d.tag === 'live' && d.promo?.placement === placement)
      .sort((a, b) => comparePromos(a.promo as PromoDoc, b.promo as PromoDoc))
    live.slice(capacity[placement]).forEach((d) => {
      d.tag = 'waiting'
      d.label = 'Live — waiting'
      d.detail = `Live, but ${WHERE[placement]} has room for ${capacity[placement]} and more are running. It appears when one ends, or give it a lower "Order" number, or add a row.`
    })
  }

  const rank: Record<StatusTag, number> = { live: 0, waiting: 1, scheduled: 2, problem: 3, off: 4, ended: 5 }
  return described
    .sort((a, b) => rank[a.tag] - rank[b.tag] || a.headline.localeCompare(b.headline))
    .map(({ id, headline, tag, label, detail }) => ({ id, headline, status: { tag, label, detail } }))
}
