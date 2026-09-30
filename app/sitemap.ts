import type { MetadataRoute } from 'next'
import { connection } from 'next/server'
import { getLocations } from '@/lib/locations'
import { getInfoPages, getPages, PRIVACY_SLUG } from '@/lib/pages'
import { getPromos } from '@/lib/promo-data'
import { infoPageState, pacificStamp } from '@/lib/promos'
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
 *   - An offer page (`infoPages`) is in only while a promo pointing at it is
 *     live. That is decided per request, so the sitemap is too: a sitemap
 *     built on Friday would still list Friday's offer on Tuesday.
 *
 * Still to add when that collection renders: `tenants`.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection()
  const [locations, pages, infoPages, promos] = await Promise.all([
    getLocations(),
    getPages(),
    getInfoPages(),
    getPromos(),
  ])
  const now = pacificStamp(new Date())

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
    ...infoPages
      .filter((page) => infoPageState(page.slug, promos, now).state === 'live')
      .map((page) => ({
        url: `${SITE_URL}/info/${page.slug}`,
        changeFrequency: 'daily' as const,
        priority: 0.6,
      })),
  ]
}
