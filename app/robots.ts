import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The CMS is staff-only and has nothing to index.
        disallow: ['/admin'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
