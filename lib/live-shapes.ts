import { cloudMediaToSitePath } from './promo-status.ts'
import type { FuelPricesDoc, PricedPlace } from './types.ts'

/**
 * The pure half of live content (lib/tina-live.ts): where the TinaCloud
 * content API is, and turning its answers back into the shapes the site's
 * files have. No Next.js here, so it is tested directly (lib/tina-live.test.ts).
 */

export const TINA_API_VERSION = '3.0'

/** The content API address, or null when this deployment has no credentials. */
export function contentApiUrl(env: Record<string, string | undefined> = process.env): string | null {
  // For testing against a local `tinacms dev` server (http://localhost:4001/graphql),
  // which answers the same queries. Never set on the host.
  if (env.TINA_LIVE_URL_FOR_TESTING) return env.TINA_LIVE_URL_FOR_TESTING
  const clientId = env.NEXT_PUBLIC_TINA_CLIENT_ID?.trim()
  const token = env.TINA_TOKEN?.trim()
  if (!clientId || !token) return null
  const branch = env.NEXT_PUBLIC_TINA_BRANCH || env.VERCEL_GIT_COMMIT_REF || 'main'
  return `https://content.tinajs.io/${TINA_API_VERSION}/content/${clientId}/github/${encodeURIComponent(branch)}`
}

/** Every TinaCloud asset address in a value, back to this site's path. */
export function toSitePaths(value: unknown): unknown {
  if (typeof value === 'string') return cloudMediaToSitePath(value)
  if (Array.isArray(value)) return value.map(toSitePaths)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, toSitePaths(inner)]))
  }
  return value
}

/**
 * The content API answers with the CMS's own field names. Two of them differ
 * from the file: Tina allows no hyphen in a field name, so the CMS calls
 * `exit-260` `exit_260` (tina/config.ts, `nameOverride`). Back to the slugs.
 */
export function fuelPricesFromLive(values: Record<string, unknown>): FuelPricesDoc {
  const locations = (values.locations ?? {}) as Record<string, PricedPlace>
  return {
    linkLocations: values.linkLocations === true,
    locations: Object.fromEntries(
      Object.entries(locations).map(([key, prices]) => [key.replace(/_/g, '-'), prices])
    ) as FuelPricesDoc['locations'],
    truckStop: (values.truckStop ?? {}) as PricedPlace,
  }
}
