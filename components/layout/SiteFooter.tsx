import { cacheLife } from 'next/cache'
import Link from 'next/link'
import styles from './SiteFooter.module.css'
import { SocialRow } from './SocialRow'
import { getLocations } from '@/lib/locations'
import { getSettings } from '@/lib/settings'

/**
 * The site footer — the four headed columns of the approved page templates
 * (docs/proofs/contact-page-template.html), chosen by the owner 29 Sep 2026
 * over the single row of links it had been (ADR 0029).
 *
 *   About · Visit · Rewards · Work with us, then the social row (ADR 0028),
 *   then the base row: © · Privacy Policy · Lummi Commercial Companies.
 *
 * Three things the template draws that are deliberately NOT here:
 *   - "Salish Village" under About. Salish Village is an LCC development, one
 *     of LCC's other businesses (CONTEXT.md), and other Lummi companies appear
 *     on this site only as the single "Lummi Commercial Companies" link. That
 *     is a hard rule; the template predates anyone checking it (ADR 0001).
 *   - "All fuel prices" under Rewards. Dropped 18 Sep 2026: the price block's
 *     "All prices" link is the page's only route in (ADR 0008, amended).
 *   - "No cookies. Visits counted anonymously." in the base row. Moved to
 *     /privacy 29 Sep 2026 (ADR 0025, amended).
 *
 * Also not here, and never: a contact form, and a per-Location hours block.
 * Hours, addresses and phones live on /contact (ADR 0015).
 *
 * "Lummi Commercial Companies" is the ONLY place any other Lummi company
 * appears anywhere on this site — not in copy, not in the nav (ADR 0001).
 */

/** Marks a link as leaving the site without naming where it goes. */
function ExternalGlyph() {
  return (
    <svg
      className={styles.extGlyph}
      viewBox="0 0 12 12"
      width="10"
      height="10"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4.5 1.5h6v6" />
      <path d="M10.5 1.5 5 7" />
      <path d="M9 7.5v3h-7.5V3h3" />
    </svg>
  )
}

/**
 * The year for the © line. Cached, because reading the clock in a prerendered
 * shell is exactly what partial prerendering forbids; the site rebuilds on
 * every content push, so the value is never more than one deploy old.
 */
async function copyrightYear() {
  'use cache'
  cacheLife('max')
  return new Date().getFullYear()
}

export async function SiteFooter() {
  const [settings, locations, year] = await Promise.all([
    getSettings(),
    getLocations(),
    copyrightYear(),
  ])
  const { careersUrl, lummiCommercialCompaniesUrl } = settings.footer

  // "Visit" is derived, never typed: the Locations in site order, then the
  // Truck Stop — the same places the Locations index lists (ADR 0009).
  const visit = [
    ...locations.map((location) => ({
      href: `/locations/${location.id}`,
      label: location.navLabel,
    })),
    ...(locations.some((location) => location.truckStop)
      ? [{ href: '/truck-stop', label: 'Truck Stop' }]
      : []),
  ]

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <nav className={styles.cols} aria-label="Footer">
          <div className={styles.group}>
            <h2 className={styles.head}>About</h2>
            <Link className={styles.link} href="/about">
              Our story
            </Link>
            <Link className={styles.link} href="/contact">
              Contact
            </Link>
          </div>

          <div className={styles.group}>
            <h2 className={styles.head}>Visit</h2>
            {visit.map((item) => (
              <Link key={item.href} className={styles.link} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className={styles.group}>
            <h2 className={styles.head}>Rewards</h2>
            <Link className={styles.link} href="/rewards">
              Get the app
            </Link>
          </div>

          {/*
            Careers. The link text is exactly "Careers" and nothing else.
            No company name, no logo, no tooltip naming the destination — the
            destination is editable in the CMS and the label must not describe
            it (ADR 0001, amended 17 Sep 2026). The arrow says "you are leaving
            this site"; it does not say where to. No URL, no column: a heading
            over nothing reads as a failed load.
          */}
          {careersUrl ? (
            <div className={styles.group}>
              <h2 className={styles.head}>Work with us</h2>
              <a
                className={styles.link}
                href={careersUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Careers
                <ExternalGlyph />
                <span className="visually-hidden">(opens in a new tab)</span>
              </a>
            </div>
          ) : null}
        </nav>

        <SocialRow links={settings.social} />

        <div className={styles.base}>
          <span className={styles.baseText}>© {year} Lummi Bay Market</span>

          {/*
            /privacy is published inside both app store listings, so it is
            never renamed or deleted (ADR 0026). The no-cookies claim that
            used to sit beside it lives on that page now (ADR 0025, amended).
          */}
          <Link className={styles.baseLink} href="/privacy">
            Privacy Policy
          </Link>

          {/* The one sanctioned reference to the wider group (ADR 0001). */}
          {lummiCommercialCompaniesUrl ? (
            <a
              className={styles.baseLink}
              href={lummiCommercialCompaniesUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Lummi Commercial Companies
              <ExternalGlyph />
              <span className="visually-hidden">(opens in a new tab)</span>
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
