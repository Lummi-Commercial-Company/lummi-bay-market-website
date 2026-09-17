/**
 * Next.js configuration — Lummi Bay Market.
 *
 * ---------------------------------------------------------------------------
 * DO NOT ADD `output: 'export'`.
 * ---------------------------------------------------------------------------
 * Static export looks harmless here: almost every page is prerendered and the
 * site is meant to be fully static-cacheable. It is not harmless. Three shipped
 * features need a server at request time, and a static export does not fail the
 * build when you remove it — the features simply never fire again, silently,
 * and nobody finds out until the day one of them matters:
 *
 *   1. The emergency notice (`siteAlert`) is published by on-demand
 *      revalidation, live in under a second instead of waiting on a rebuild.
 *      ADR 0017. Export has no revalidation endpoint.
 *
 *   2. Fuel prices render per request against the content API, so a price a
 *      staff member publishes is live immediately rather than at the end of the
 *      next deploy. ADR 0024. Export bakes whatever price was current at build.
 *
 *   3. The temporary hours override is evaluated per request against the
 *      visitor's date in Pacific time, so New Year's Eve hours can be typed in
 *      November and revert on their own. ADR 0027. Export freezes the window
 *      to the build date, which means wrong opening hours that still look like
 *      opening hours.
 *
 * Everything else stays prerendered. Keep it that way: add per-route caching,
 * not a global export.
 * ---------------------------------------------------------------------------
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // The site sets no cookies and loads nothing third-party (ADR 0025), so the
  // image optimiser only ever serves files from this repo. No remotePatterns.
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  async redirects() {
    return [
      // exit260.com is 301-redirected to the Exit 260 location page at the DNS
      // / platform level (see docs/backend-setup.md). This entry covers the
      // legacy in-site paths that the old site published.
      {
        source: '/exit260',
        destination: '/locations/exit-260',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
