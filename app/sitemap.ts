import type { MetadataRoute } from 'next'
import { getLocations } from '@/lib/locations'
import { SITE_URL } from '@/lib/site'

/**
 * The sitemap is derived, never hand-maintained.
 *
 * Phase 2 adds the CMS collections to it. Two rules to carry over when it does:
 * an `infoPages` document whose promo is not live keeps its URL but drops OUT of
 * the sitemap and goes `noindex` (ADR 0018), and `/privacy` is always in, is
 * never renamed and is never deleted once it is in an app store listing
 * (ADR 0026).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locations = await getLocations()

  const staticRoutes = ['', '/locations', '/truck-stop', '/rewards', '/fuel-prices']

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route}`,
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1 : 0.8,
    })),
    ...locations.map((location) => ({
      url: `${SITE_URL}/locations/${location.id}`,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ]
}
