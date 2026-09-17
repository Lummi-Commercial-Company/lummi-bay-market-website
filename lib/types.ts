/**
 * Shared content types. These mirror the collections in `tina/config.ts` and
 * the schema in skill `location-content-model`. When the Tina schema changes,
 * change it there first and follow it here.
 */

export type LocationSlug = 'exit-260' | 'minimart' | 'fishermans-cove'

/** The only three grades priced on this site (CONTEXT.md, ADR 0004). */
export type FuelGrade = 'regular' | 'diesel' | 'def'

export interface HoursOverride {
  /** The replacement hours line, e.g. "6am–4pm". Never empty. */
  hours: string
  /** Two or three words. Detail page only — the card never shows it. */
  reason?: string
  /** First day the override applies, inclusive, Pacific time. YYYY-MM-DD. */
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
  /** Stamped on save, per place. YYYY-MM-DD. */
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
  footer: { careersUrl: string; lummiCommercialCompaniesUrl: string }
  social: SocialLink[]
  map: { embedCode: string; stillImage: string }
  siteAlert: SiteAlertDoc
  backdrop: PageBackdropSettings
  /** Which `mainPages` document is live (ADR 0018). */
  liveMainPage?: string
}
