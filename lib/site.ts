/**
 * Canonical origin. lummibay.com is the canonical domain; exit260.com
 * 301-redirects to the Exit 260 location page and lcc-lummi.com is left alone —
 * it stays as the footer link (ADR 0001).
 *
 * Overridable for preview deployments, which have their own hostnames.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://lummibay.com'

export const SITE_NAME = 'Lummi Bay Market'
