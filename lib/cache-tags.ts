/**
 * Cache tags — the handles on-demand revalidation pulls.
 *
 * The page shells are prerendered and served from the CDN. Content changes
 * reach them one of two ways: a git push, which rebuilds everything, or a call
 * to the revalidation endpoint, which drops just the tagged entries and has the
 * new copy live in under a second. The emergency notice depends on the second
 * — waiting on a rebuild is exactly what ADR 0017 rejected.
 *
 * Fuel prices are NOT tagged. They are read per request (ADR 0024), so there is
 * nothing to invalidate.
 */
export const CACHE_TAGS = {
  settings: 'settings',
  locations: 'locations',
  pages: 'pages',
  promos: 'promos',
  motifs: 'motifs',
} as const

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]
