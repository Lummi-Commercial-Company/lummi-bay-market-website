import { formatUsDay, formatUsTime, parseWhen } from './pacific-time.ts'
import {
  comparePromos,
  DEFAULT_PROMO_ROWS,
  fillRows,
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
  const time = formatUsTime(when.time)
  return time ? `${day} ${time}` : day
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
 * TinaCloud's content API — which the CMS screens read — rewrites every
 * picture to a full address on its asset host:
 *   /uploads/6yr-drink.jpg  →  https://assets.tina.io/<client id>/6yr-drink.jpg
 * (with `/__staging/<branch>/__file` after the id on an unmerged branch).
 * The file itself, and so the site, keeps `/uploads/…`. Read that way, a
 * picture on this site looked like an outside one, and a promotion visibly on
 * Home was tagged "Not showing" (reported 30 Sep 2026). Turned back into the
 * site path before the rules run. Anything else is left exactly as it is.
 */
export function cloudMediaToSitePath(value: unknown, mediaRoot = 'uploads'): unknown {
  if (typeof value !== 'string') return value
  const match = value.match(/^https:\/\/assets\.tina\.io\/[^/]+(\/.*)$/i)
  if (!match?.[1]) return value
  const rest = match[1].replace(/^\/__staging\/.+?\/__file(?=\/)/, '')
  return `/${mediaRoot}${rest}`
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
  const parsed = toPromo(id, { ...data, image: cloudMediaToSitePath(data.image) })
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
    return { id, headline: String(data.headline ?? id), place: Number.POSITIVE_INFINITY, ...describePromo(id, data, now, exists) }
  })

  const layouts = {
    home: options.homeRows ?? DEFAULT_PROMO_ROWS,
    'all-interior': options.pageRows ?? DEFAULT_PROMO_ROWS,
  }
  for (const placement of ['home', 'all-interior'] as const) {
    const live = described
      .filter((d) => d.tag === 'live' && d.promo?.placement === placement)
      .sort((a, b) => comparePromos(a.promo as PromoDoc, b.promo as PromoDoc))
    const places = slotNames(layouts[placement], live.length)
    live.forEach((d, index) => {
      // Home first, then the other pages; within each, the order places fill.
      d.place = (placement === 'home' ? 0 : 1000) + index
      const place = places[index]
      if (place) {
        // Where exactly: the question staff actually ask (30 Sep 2026).
        d.detail = d.detail.replace(/\.$/, ` — ${place}.`)
        return
      }
      const room = capacityOf(layouts[placement])
      d.tag = 'waiting'
      d.label = 'Live — waiting'
      d.detail = `Live, but ${WHERE[placement]} has room for ${room} and more are running. It appears when one ends, or give it a lower "Order" number, or add a row.`
    })
  }

  const rank: Record<StatusTag, number> = { live: 0, waiting: 1, scheduled: 2, problem: 3, off: 4, ended: 5 }
  return described
    .sort((a, b) => rank[a.tag] - rank[b.tag] || a.place - b.place || a.headline.localeCompare(b.headline))
    .map(({ id, headline, tag, label, detail }) => ({ id, headline, status: { tag, label, detail } }))
}

const ACROSS: Record<number, string[]> = {
  1: ['full width'],
  2: ['left', 'right'],
  3: ['left', 'middle', 'right'],
  4: ['1st from left', '2nd from left', '3rd from left', '4th from left'],
}
const WIDTH: Record<number, string> = { 12: 'full width', 8: 'wide', 6: 'half', 4: 'third', 3: 'quarter' }

/**
 * Where each of `count` live promotions lands, in order: "row 1, full width",
 * "row 2, left half". The same pouring the page does (fillRows), so a row
 * holding fewer than it has room for re-divides here as it does there.
 * Shorter than `count` when some are waiting for a place.
 */
export function slotNames(rows: RowLayout[], count: number): string[] {
  const filled = fillRows(rows, Array.from({ length: count }, () => ({}) as PromoDoc))
  return filled.flatMap((row, r) =>
    row.spans.map((span, i) => {
      const across = row.spans.length
      if (across === 1) return `row ${r + 1}, full width`
      const side = ACROSS[across]?.[i] ?? `${i + 1}`
      return `row ${r + 1}, ${side} ${WIDTH[span] ?? ''}`.trim()
    })
  )
}

export interface PreviewRow {
  spans: number[]
  items: { id: string; headline: string }[]
}

/**
 * A picture of the promotion region as visitors see it right now, row by row,
 * for the Promotion Status screen. `placement` picks the Home page or "every
 * page except home" (a page with no promotions of its own chosen for it).
 */
export function previewRows(
  docs: { id: string; data: Record<string, unknown> }[],
  now: string,
  rows: RowLayout[],
  placement: 'home' | 'all-interior',
  offerPages?: Set<string>
): PreviewRow[] {
  const live = docs
    .map(({ id, data }) => describePromo(id, data, now).promo)
    .filter((promo): promo is PromoDoc => Boolean(promo) && promo?.placement === placement)
    // A promotion whose offer page is gone does not show (describePromo).
    .filter((promo) => !offerPages || offerPages.has(promo.link))
    .filter((promo) => promoState(promo, now) === 'live')
    .sort(comparePromos)
  return fillRows(rows, live).map((row) => ({
    spans: row.spans,
    items: row.promos.map((promo) => ({ id: promo.id, headline: promo.headline })),
  }))
}
