import { pacificStamp, parseWhen } from './pacific-time.ts'

export { pacificStamp, parseWhen }

/**
 * Promotions — the rules, with no I/O (ADR 0007, ADR 0018, ADR 0023).
 *
 * Everything that decides whether a promo shows, where, and in what shape lives
 * here, as plain functions of (documents, now), so it is tested rather than
 * trusted. `lib/promo-data.ts` reads the files; `components/promos/` draws them.
 *
 * The three rules that matter most:
 *   - Live is computed per visitor, in Pacific time. Nothing is scheduled, so
 *     nothing can fail to fire: a promo ending at noon is gone at noon.
 *   - The ROW owns the layout, not the promo. A row is a capacity; when it holds
 *     fewer live promos than it has room for, it re-divides into equal columns.
 *     12 divides by 1, 2, 3 and 4, so a hole cannot appear.
 *   - Rows are capped at six per page. Promos past the available slots wait, in
 *     priority order, and take a slot as earlier ones expire.
 */

/* ===========================================================================
   Row layouts — ADR 0018, "Revision"
   =========================================================================== */

export type RowLayout = '1' | '2' | '3' | '4' | 'wn' | 'nw' | 'l3'

export const ROW_LAYOUTS: Record<RowLayout, { label: string; spans: number[] }> = {
  '1': { label: '1 across — full width', spans: [12] },
  '2': { label: '2 across — halves', spans: [6, 6] },
  '3': { label: '3 across — thirds', spans: [4, 4, 4] },
  '4': { label: '4 across — quarters', spans: [3, 3, 3, 3] },
  wn: { label: '2 across — wide + narrow', spans: [8, 4] },
  nw: { label: '2 across — narrow + wide', spans: [4, 8] },
  l3: { label: '3 across — lead + two', spans: [6, 3, 3] },
}

/** Six rows per page, at most (CLAUDE.md, ADR 0018). */
export const MAX_PROMO_ROWS = 6

/**
 * What a page uses when neither it nor Site settings chooses rows: one full
 * width, then two halves. Never "no rows" — a promo published into a site with
 * no rows configured would be live and invisible, and nobody would know why.
 */
export const DEFAULT_PROMO_ROWS: RowLayout[] = ['1', '2']

export function isRowLayout(value: unknown): value is RowLayout {
  return typeof value === 'string' && Object.hasOwn(ROW_LAYOUTS, value)
}

/* ===========================================================================
   Documents
   =========================================================================== */

export type PromoPlacement = 'home' | 'all-interior' | 'specific'

export interface PromoDoc {
  /** The file name without its extension. */
  id: string
  eyebrow?: string
  headline: string
  /** The button label. Already defaulted to "Learn more" when left blank. */
  cta: string
  image: string
  alt: string
  /** The info page's slug — its file name in content/info-pages/. */
  link: string
  startsAt?: string
  endsAt?: string
  /** Only an explicit `false` turns a promo off. */
  active: boolean
  placement: PromoPlacement
  /** Page keys, `collection-dir/file-name`: `pages/about`, `locations/exit-260`. */
  pages: string[]
  priority?: number
}

/** The owner's choice, 30 Sep 2026; it was "See details" (ADR 0023). */
export const DEFAULT_CTA = 'Learn more'

/**
 * A Tina reference is stored as a path — `content/pages/about.mdx`. Reduced to
 * `pages/about`, which is how a page identifies itself to the promo region.
 */
export function pageKeyFromRef(ref: unknown): string | null {
  if (typeof ref !== 'string') return null
  const match = ref.trim().match(/^(?:content\/)?([a-z0-9-]+)\/([^/]+?)(?:\.(?:mdx?|json))?$/i)
  return match ? `${match[1]}/${match[2]}` : null
}

/** `content/info-pages/long-weekend.mdx` → `long-weekend`. */
export function infoSlugFromRef(ref: unknown): string | null {
  const key = pageKeyFromRef(ref)
  if (!key) return null
  const [dir, slug] = key.split('/')
  return dir === 'info-pages' ? (slug ?? null) : null
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * One promo's frontmatter to a document, or the reason it cannot be one. A
 * promo that cannot render correctly is dropped and logged rather than drawn
 * half-made: no picture, no words, or nowhere to go.
 */
export function toPromo(
  id: string,
  data: Record<string, unknown>
): { promo: PromoDoc } | { refused: string } {
  const headline = text(data.headline)
  const image = text(data.image)
  const link = infoSlugFromRef(data.link)
  if (!headline) return { refused: 'it has no headline' }
  if (!image) return { refused: 'it has no picture' }
  // Pictures come from this site's own uploads. Anything else would load a
  // third party's file on every page view — and the site loads nothing
  // third-party (ADR 0025) — and the image optimiser refuses it anyway.
  if (!image.startsWith('/') || image.startsWith('//')) {
    return { refused: 'its picture is not a file uploaded to this site' }
  }
  // The motif folder is the header band's own library (ADR 0021): a motif is
  // a shape used as a mask, not a picture for an offer.
  if (image.startsWith('/uploads/motifs/')) {
    return { refused: 'its picture is a header motif, not a promotion picture' }
  }
  if (!link) return { refused: 'it does not link to an offer page' }

  for (const field of ['startsAt', 'endsAt'] as const) {
    const value = text(data[field])
    if (value && !parseWhen(value)) {
      // A typo in an end date must never be read as "no end date": that would
      // run the offer forever. So an unreadable date keeps the promo off.
      return { refused: `"${value}" in ${field} is not a date the site can read` }
    }
  }

  const placement = data.placement
  // Two lists in the CMS — pages, and Locations — one set of keys here.
  const refs = (list: unknown, field: string) =>
    Array.isArray(list)
      ? list
          .map((row) => pageKeyFromRef((row as Record<string, unknown> | null)?.[field] ?? row))
          .filter((key): key is string => Boolean(key))
      : []
  const pages = [...refs(data.pages, 'page'), ...refs(data.locations, 'location')]

  return {
    promo: {
      id,
      eyebrow: text(data.eyebrow) || undefined,
      headline,
      cta: text(data.cta) || DEFAULT_CTA,
      image,
      alt: text(data.alt),
      link,
      startsAt: text(data.startsAt) || undefined,
      endsAt: text(data.endsAt) || undefined,
      active: data.active !== false,
      placement:
        placement === 'home' || placement === 'specific' ? placement : 'all-interior',
      pages,
      priority: typeof data.priority === 'number' ? data.priority : undefined,
    },
  }
}

/* ===========================================================================
   Time — Pacific, to the minute
   =========================================================================== */

/* ===========================================================================
   State — derived, never stored (ADR 0018 §4)
   =========================================================================== */

export type PromoState = 'live' | 'scheduled' | 'ended' | 'off'

/**
 * `startsAt` with no time starts at the beginning of that day. `endsAt` with
 * no time runs to the END of that day, inclusive — "ends Sunday" means Sunday
 * is still on. With a time, it ends at that minute: "ends 12:00" is gone at
 * noon.
 */
export function promoState(
  promo: Pick<PromoDoc, 'active' | 'startsAt' | 'endsAt'>,
  now: string
): PromoState {
  if (!promo.active) return 'off'
  const start = promo.startsAt ? parseWhen(promo.startsAt) : null
  const end = promo.endsAt ? parseWhen(promo.endsAt) : null
  if (start && now < `${start.day} ${start.time ?? '00:00'}`) return 'scheduled'
  if (end) {
    if (end.time ? now >= `${end.day} ${end.time}` : now.slice(0, 10) > end.day) return 'ended'
  }
  return 'live'
}

/** Sortable end of a window; no end sorts last. */
function endKey(promo: PromoDoc): string {
  const end = promo.endsAt ? parseWhen(promo.endsAt) : null
  return end ? `${end.day} ${end.time ?? '24:00'}` : '9999'
}

/** Priority first, then the soonest to end, then the headline (ADR 0018 §2). */
export function comparePromos(a: PromoDoc, b: PromoDoc): number {
  const pa = a.priority ?? Number.POSITIVE_INFINITY
  const pb = b.priority ?? Number.POSITIVE_INFINITY
  if (pa !== pb) return pa < pb ? -1 : 1
  const ea = endKey(a)
  const eb = endKey(b)
  if (ea !== eb) return ea < eb ? -1 : 1
  return a.headline.localeCompare(b.headline)
}

/* ===========================================================================
   Placement — which pages a promo appears on
   =========================================================================== */

/**
 * How a page identifies itself to the promo region.
 *   - `home` — the live home page.
 *   - `key` — this page's own address in the content, if it has one, so a
 *     promo set to "Specific pages only" can name it.
 *   - `allowAllInterior` — whether "Every page except home" reaches this page.
 *     A general page turns it off with "Show the promotions band"; a promo
 *     that names the page shows there regardless.
 *   - `excludeInfo` — on an offer page, never advertise the same offer back.
 */
export interface PromoTarget {
  home?: boolean
  key?: string
  allowAllInterior?: boolean
  excludeInfo?: string
}

export function promoAppliesTo(promo: PromoDoc, target: PromoTarget): boolean {
  if (target.excludeInfo && promo.link === target.excludeInfo) return false
  switch (promo.placement) {
    case 'home':
      return target.home === true
    case 'all-interior':
      return !target.home && target.allowAllInterior !== false
    case 'specific':
      return Boolean(target.key) && promo.pages.includes(target.key as string)
  }
}

/** The promos live on this page right now, in the order they take slots. */
export function livePromosFor(
  promos: PromoDoc[],
  target: PromoTarget,
  now: string
): PromoDoc[] {
  return promos
    .filter((promo) => promoState(promo, now) === 'live' && promoAppliesTo(promo, target))
    .sort(comparePromos)
}

/* ===========================================================================
   Rows
   =========================================================================== */

export interface FilledRow {
  /** Column spans on the 12-column grid, one per promo. Always sums to 12. */
  spans: number[]
  promos: PromoDoc[]
}

/**
 * Pour the live promos into the page's rows, in order. A row holding fewer
 * than its layout's capacity re-divides evenly; a row with nothing to hold does
 * not render. Past the sixth row nothing is drawn — the rest wait for a slot.
 */
export function fillRows(layouts: RowLayout[], promos: PromoDoc[]): FilledRow[] {
  const rows: FilledRow[] = []
  let cursor = 0
  for (const layout of layouts.slice(0, MAX_PROMO_ROWS)) {
    const want = ROW_LAYOUTS[layout].spans
    const take = promos.slice(cursor, cursor + want.length)
    cursor += take.length
    if (take.length === 0) break
    rows.push({
      spans: take.length === want.length ? want : take.map(() => 12 / take.length),
      promos: take,
    })
  }
  return rows
}

/* ===========================================================================
   Offer pages — ADR 0018 §3
   =========================================================================== */

export type InfoPageState =
  | { state: 'live'; lead: PromoDoc }
  | { state: 'upcoming'; lead: PromoDoc; startsOn: string }
  | { state: 'ended'; lead?: PromoDoc }

/**
 * An offer page is live while any promo pointing at it is live. Otherwise it
 * keeps its address but is not linked, not indexed and says so: "starts on" if
 * one is scheduled — with nothing of the offer shown, so it cannot be read
 * early — or "has ended".
 *
 * `lead` is the promo whose eyebrow and picture head the page.
 */
export function infoPageState(slug: string, promos: PromoDoc[], now: string): InfoPageState {
  const mine = promos.filter((promo) => promo.link === slug).sort(comparePromos)
  const live = mine.find((promo) => promoState(promo, now) === 'live')
  if (live) return { state: 'live', lead: live }

  const upcoming = mine
    .filter((promo) => promoState(promo, now) === 'scheduled')
    .map((promo) => ({ promo, start: parseWhen(promo.startsAt as string) }))
    .sort((a, b) => ((a.start?.day ?? '') < (b.start?.day ?? '') ? -1 : 1))[0]
  if (upcoming?.start) {
    return { state: 'upcoming', lead: upcoming.promo, startsOn: upcoming.start.day }
  }
  return { state: 'ended', lead: mine[0] }
}
