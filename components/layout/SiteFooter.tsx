import { cacheLife } from 'next/cache'
import Link from 'next/link'
import styles from './SiteFooter.module.css'
import { SocialRow } from './SocialRow'
import { isExternalUrl } from '@/lib/footer-links'
import { getLocations } from '@/lib/locations'
import { getSettings } from '@/lib/settings'
import type { FooterColumn, FooterLink } from '@/lib/types'

/**
 * The site footer — the four headed columns of the approved page templates
 * (docs/proofs/contact-page-template.html), chosen by the owner 29 Sep 2026
 * over the single row of links it had been (ADR 0029).
 *
 *   About · Visit · Rewards · Work with us, then the social row (ADR 0028),
 *   then the base row: © · Privacy Policy · Lummi Commercial Companies.
 *
 * Every link in the columns is editable, in Site settings → Footer links
 * (ADR 0029, amended 30 Sep 2026): one ordered list, each row placed under a
 * column. A column with no links does not render — a heading over nothing
 * reads as a failed load — except Visit, which then fills itself from the
 * Location documents. The column headings are the template's and are fixed.
 *
 * Checked on the way in (lib/footer-links), so it holds even for a saved
 * link: nothing whose text names another Lummi business, and no address that
 * could run code. That keeps out the template's own "Salish Village" link —
 * an LCC development (ADR 0001) — however it is typed.
 *
 * Also not here, and never: a contact form, and a per-Location hours block.
 * Hours, addresses and phones live on /contact (ADR 0015).
 *
 * "Lummi Commercial Companies" is the ONLY place any other Lummi company
 * appears anywhere on this site — not in copy, not in the nav (ADR 0001). Its
 * address is editable; its text is not.
 */

const COLUMNS: { key: FooterColumn; heading: string }[] = [
  { key: 'about', heading: 'About' },
  { key: 'visit', heading: 'Visit' },
  { key: 'rewards', heading: 'Rewards' },
  { key: 'work', heading: 'Work with us' },
]

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

/** One footer link: a new tab for another site, a client-side link for ours. */
function FooterLinkItem({ link }: { link: FooterLink }) {
  if (isExternalUrl(link.url)) {
    return (
      <a className={styles.link} href={link.url} target="_blank" rel="noopener noreferrer">
        {link.label}
        <ExternalGlyph />
        <span className="visually-hidden">(opens in a new tab)</span>
      </a>
    )
  }
  if (link.url.startsWith('/')) {
    return (
      <Link className={styles.link} href={link.url}>
        {link.label}
      </Link>
    )
  }
  // tel: and mailto: — ordinary links, no new tab.
  return (
    <a className={styles.link} href={link.url}>
      {link.label}
    </a>
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
  const { links, privacy, lummiCommercialCompaniesUrl } = settings.footer

  // An empty Visit column is derived, never typed: the Locations in site
  // order, then the Truck Stop — the same places the Locations index lists
  // (ADR 0009).
  const fromLocations: FooterLink[] = [
    ...locations.map((location) => ({
      label: location.navLabel,
      url: `/locations/${location.id}`,
      column: 'visit' as const,
    })),
    ...(locations.some((location) => location.truckStop)
      ? [{ label: 'Truck Stop', url: '/truck-stop', column: 'visit' as const }]
      : []),
  ]

  const columns = COLUMNS.map(({ key, heading }) => {
    const own = links.filter((link) => link.column === key)
    return { key, heading, links: key === 'visit' && own.length === 0 ? fromLocations : own }
  }).filter((column) => column.links.length > 0)

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <nav className={styles.cols} aria-label="Footer">
          {columns.map((column) => (
            <div className={styles.group} key={column.key}>
              <h2 className={styles.head}>{column.heading}</h2>
              {column.links.map((link) => (
                <FooterLinkItem key={`${link.label}|${link.url}`} link={link} />
              ))}
            </div>
          ))}
        </nav>

        <SocialRow links={settings.social} />

        <div className={styles.base}>
          <span className={styles.baseText}>© {year} Lummi Bay Market</span>

          {/*
            The policy page itself is published inside both app store listings,
            so the PAGE is never renamed or deleted (ADR 0026). This link's text
            and address are editable, but it cannot be removed: a blank value
            falls back to /privacy. The no-cookies claim that used to sit beside
            it lives on that page now (ADR 0025, amended).
          */}
          {privacy.url.startsWith('/') ? (
            <Link className={styles.baseLink} href={privacy.url}>
              {privacy.label}
            </Link>
          ) : (
            <a className={styles.baseLink} href={privacy.url}>
              {privacy.label}
            </a>
          )}

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
