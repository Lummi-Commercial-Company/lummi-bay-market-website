import type { MetadataRoute } from 'next'
import { getLocations } from '@/lib/locations'
import { getPages, PRIVACY_SLUG } from '@/lib/pages'
import { SITE_URL } from '@/lib/site'

/**
 * The sitemap is derived, never hand-maintained. Adding a page to the `pages`
 * collection adds it here, with no second list to remember.
 *
 * Two rules it has to keep:
 *   - A page marked "Hide from Google" drops OUT of the sitemap. Listing a
 *     `noindex` URL in a sitemap asks Search Console to index it and then
 *     reports the result as an error. It is also how ADR 0018 retires an
 *     `infoPages` document whose promo has ended: the URL keeps working, so
 *     shared links do not break, but it leaves the index.
 *   - `/privacy` is ALWAYS in, whatever the document says, and is never renamed
 *     or deleted once it is in an app store listing (ADR 0026). `lib/pages.ts`
 *     forces its `noindex` off for the same reason.
 *
 * Still to add when those collections render: `infoPages` (with the promo-window
 * check above) and `tenants`.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [locations, pages] = await Promise.all([getLocations(), getPages()])

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
    ...pages
      .filter((page) => !page.noindex || page.slug === PRIVACY_SLUG)
      .map((page) => ({
        url: `${SITE_URL}/${page.slug}`,
        // These change rarely: a policy, a story, a set of phone numbers.
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      })),
  ]
}
