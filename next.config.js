/**
 * Next.js configuration — Lummi Bay Market.
 *
 * ---------------------------------------------------------------------------
 * DO NOT ADD `output: 'export'`.
 * ---------------------------------------------------------------------------
 * Static export looks harmless here: almost every page is prerendered and the
 * site is meant to be fully static-cacheable. It is not harmless. Four shipped
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
 *   4. Promotions are live per visitor against their date window, so an offer
 *      that ends at noon is gone at noon with nothing scheduled. ADR 0018.
 *      Export would show whatever was live at build time, for ever — expired
 *      offers included, and offer pages indexed after they end.
 *
 * Everything else stays prerendered. Keep it that way: add per-route caching,
 * not a global export.
 * ---------------------------------------------------------------------------
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // `next dev` would otherwise append its own block to CLAUDE.md on every run.
  // CLAUDE.md is this project's single source of truth, edited on purpose.
  agentRules: false,

  /**
   * Cache Components (Next's partial prerendering).
   *
   * This is how the site is BOTH static and live. Every page shell — header,
   * footer, waterline, copy — is prerendered and served from the CDN, while the
   * things that must be current stream in per request inside their own
   * <Suspense> boundaries: the fuel prices, the emergency notice, the hours
   * override and the promotions. Without it, one dynamic read makes the whole route dynamic and
   * the site stops being static-cacheable.
   */
  cacheComponents: true,

  // The site sets no cookies and loads nothing third-party (ADR 0025), so the
  // image optimiser only ever serves files from this repo. No remotePatterns.
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  /**
   * The header motif band reads its SVG files from public/ when it is drawn
   * (lib/motifs.ts) — at build, and again whenever settings revalidate, which
   * happens on the server. Vercel does not ship public/ with the server code,
   * so without this a revalidation (an emergency notice, say) would find no
   * files and drop every motif until the next deploy.
   */
  outputFileTracingIncludes: {
    '/**': ['./public/uploads/motifs/**/*.svg'],
  },

  /**
   * Staff upload SVGs (header motifs), and an SVG is a program as well as a
   * picture. The upload box and the site both refuse one containing code
   * (lib/motif-check.ts); this is the backstop for a file that reached the
   * folder some other way. Opened directly, an uploaded SVG runs no script,
   * loads nothing and is never sniffed as HTML. Used as a mask or an <img>,
   * none of this applies — browsers never run SVG script in those.
   */
  async headers() {
    return [
      {
        source: '/uploads/:path*.svg',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'none'; style-src 'unsafe-inline'; img-src data:; sandbox",
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ]
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
      // The first deploy (the scaffold on `main`, 29 Sep 2026) published the
      // Minimart at /locations/mini-mart. The settled slug is `minimart`; a
      // Location's address is exactly the kind of link that gets shared.
      {
        source: '/locations/mini-mart',
        destination: '/locations/minimart',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
