/**
 * Shared content types. These mirror the collections in `tina/config.ts` and
 * the schema in skill `location-content-model`. When the Tina schema changes,
 * change it there first and follow it here.
 */

import type { RowLayout } from './promos.ts'

export type LocationSlug = 'exit-260' | 'minimart' | 'fishermans-cove'

/** The only three grades priced on this site (CONTEXT.md, ADR 0004). */
export type FuelGrade = 'regular' | 'diesel' | 'def'

export interface HoursOverride {
  /** The replacement hours line, e.g. "6am–4pm". Never empty. */
  hours: string
  /** Two or three words. Detail page only — the card never shows it. */
  reason?: string
  /** First day the override applies, inclusive, Pacific time. MM/DD/YYYY (older files: YYYY-MM-DD). */
  startsAt: string
  /** Last day the override applies, inclusive, Pacific time. REQUIRED. */
  endsAt: string
}

/**
 * The Truck Stop is a separate fuel station sharing the Exit 260 property, not
 * an amenity of the Exit 260 store. Present on exit-260 only.
 */
export interface TruckStopRecord {
  phone: string
  hours: string
  amenities: string[]
  hoursOverrides?: HoursOverride[]
  /** One line, in a customer's words. Shown on /contact (ADR 0015). */
  summary?: string
  /** The Truck Stop's own photo, on /truck-stop. Never the store's. */
  hero?: { image?: string; alt?: string }
}

export interface LocationDoc {
  id: LocationSlug
  name: string
  navLabel: string
  /** Tightest label, for the fuel price band. Falls back to navLabel. */
  shortLabel?: string
  aka?: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  hours: string
  hoursOverrides?: HoursOverride[]
  /** Street then hours. Truncates, never wraps (ADR 0009). */
  cardLine: string
  /**
   * One or two sentences: what makes THIS stop different, in a customer's
   * words. Rendered on /contact (ADR 0015). Optional — a Location with none
   * renders one paragraph fewer, never a placeholder line.
   */
  summary?: string
  lat?: number
  lng?: number
  amenities: string[]
  truckStop?: TruckStopRecord
  hero?: { image?: string; alt?: string }
  /** MDX body, unparsed. Not rendered in Phase 1. */
  body?: string
}

/** One place's posted prices. A grade absent here is a grade not sold. */
export interface PricedPlace {
  regular?: number
  diesel?: number
  def?: number
  /** Stamped on save, per place. MM/DD/YYYY (older files: YYYY-MM-DD). */
  updated?: string
}

export interface FuelPricesDoc {
  /**
   * Records the "price all three locations together" checkbox position only.
   * It must never decide what the site reads — the site always reads the
   * per-location entries below (ADR 0004).
   */
  linkLocations: boolean
  locations: Record<LocationSlug, PricedPlace>
  /** Never touched by `linkLocations`. Always priced on its own. */
  truckStop: PricedPlace
  /** Where this read came from: the content API, or the built file (lib/tina-live.ts). */
  source?: 'live' | 'build'
}

export interface SocialLink {
  platform: 'facebook' | 'instagram' | 'yelp'
  label: string
  url: string
}

export interface SiteAlertDoc {
  active: boolean
  headline: string
  detail?: string
  link?: string
  updated?: string
  /** MM/DD/YYYY, optional time. Blank: showing as soon as it is switched on. */
  startsAt?: string
  /** MM/DD/YYYY, optional time. Blank: showing until it is switched off. */
  endsAt?: string
}

export interface PageBackdropSettings {
  image?: string
  enabled: boolean
  /** Percent. 10 is the measured line, but it is not clamped (ADR 0020). */
  opacity: number
  side: 'left' | 'right'
  /** Percent of viewport height. */
  height: number
  crop?: 'full' | 'narrow'
}

export interface SiteSettings {
  rewards: { appStoreUrl: string; playStoreUrl: string }
  footer: {
    /**
     * Every link in the four columns, in order, each placed under one column
     * (ADR 0029, amended 30 Sep 2026). An empty Visit column fills itself from
     * the Location documents.
     */
    links: FooterLink[]
    /** The base row's policy link. Editable, never removable. */
    privacy: { label: string; url: string }
    /** The one sanctioned reference to the wider group; the text is fixed. */
    lummiCommercialCompaniesUrl: string
  }
  social: SocialLink[]
  map: { embedCode: string; stillImage: string }
  /** Every saved notice, in the order staff put them. The bar shows the first live one. */
  alerts: SiteAlertDoc[]
  backdrop: PageBackdropSettings
  /** Which `mainPages` document is live (ADR 0018). */
  liveMainPage?: string
  /**
   * The promo rows every page uses unless it sets its own (ADR 0018). Never
   * empty: `lib/settings.ts` falls back to DEFAULT_PROMO_ROWS.
   */
  promoRows: RowLayout[]
  /** The header motif band: on or off, and which motif group (ADR 0021). */
  /**
   * The header motif band (ADR 0021): on or off, and the motif groups kept in
   * Site settings. The live one is the first with `live` on. `group` is the
   * older pointer to a file in content/motif-groups/, read only when no group
   * in the list is live.
   */
  headerMotifs: { show: boolean; groups: Record<string, unknown>[]; group?: string }
}

/* ===========================================================================
   Page documents (ADR 0015, ADR 0016)

   A page on this site is a DOCUMENT in a TinaCMS collection, not a hand-written
   route. `app/[slug]/page.tsx` renders any document in `content/pages/`, so
   adding a page is a content action and the header, footer, waterline, fuel
   block and back-to-top come from the layout where a page cannot lose them.
   =========================================================================== */

/** One row of an `imageBanner` block. */
export interface PageImageBanner {
  _template: 'imageBanner'
  image?: string
  alt?: string
  caption?: string
}

export interface PageCtaButton {
  label: string
  href: string
}

export interface PageFaqItem {
  question: string
  answer?: string
}

/**
 * The block vocabulary, mirroring `pageBlocks` in `tina/config.ts`. It is a
 * closed list on purpose: a page assembled from arbitrary HTML is a page that
 * can lose the shell.
 */
export type PageBlock =
  | { _template: 'richText'; body?: string }
  | PageImageBanner
  | { _template: 'hoursTable'; heading?: string; includeTruckStop?: boolean }
  | { _template: 'locationList'; heading?: string }
  | { _template: 'locationContacts'; heading?: string }
  | { _template: 'locationsMap'; heading?: string }
  | { _template: 'callout'; heading?: string; text?: string }
  | { _template: 'ctaRow'; buttons: PageCtaButton[] }
  | { _template: 'faq'; heading?: string; items: PageFaqItem[] }

/** The four footer columns, by key (ADR 0029). */
export type FooterColumn = 'about' | 'visit' | 'rewards' | 'work'

/** A footer link an editor added in Site settings. */
export interface FooterLink {
  label: string
  url: string
  column: FooterColumn
}

export interface PageDoc {
  /** The file name without its extension. This IS the web address. */
  slug: string
  title: string
  navLabel?: string
  seoDescription?: string
  noindex: boolean
  noBackdrop: boolean
  showPromos: boolean
  /** This page's own promo rows. Empty means "use Site settings". */
  promoRows: RowLayout[]
  /** The Markdown body of the .mdx file — the page's own words. */
  body: string
  /** Extra sections, rendered after the body. */
  blocks: PageBlock[]
}

/**
 * A home page version (ADR 0015, ADR 0018). More than one may exist; the one
 * `settings.liveMainPage` points at is what visitors see.
 */
export interface MainPageDoc {
  /** The file name without its extension. */
  slug: string
  /** Internal name. Staff see it in the CMS; visitors never do. */
  title: string
  headline: string
  intro?: string
  seoDescription?: string
  noBackdrop: boolean
  /** This version's own promo rows. Empty means "use Site settings". */
  promoRows: RowLayout[]
  body: string
  blocks: PageBlock[]
}

/**
 * An offer page — what a promo links to (ADR 0015, ADR 0018 §3). Whether it is
 * live is not stored here: it is worked out per visitor from the promos that
 * point at it, in `lib/promos.ts`.
 */
export interface InfoPageDoc {
  /** The file name without its extension: `/info/{slug}`. */
  slug: string
  title: string
  seoDescription?: string
  body: string
  blocks: PageBlock[]
}
