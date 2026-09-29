import Link from 'next/link'
import styles from './SiteFooter.module.css'
import { SocialRow } from './SocialRow'
import { getSettings } from '@/lib/settings'

/**
 * The site footer.
 *
 * Columns: About, Contact, Rewards, Careers, and the single
 * "Lummi Commercial Companies" link. That link is the ONLY place any other
 * Lummi company appears anywhere on this site — not in copy, not in the nav,
 * not in a page (ADR 0001).
 *
 * Deliberately NOT here: the contact form (there is no form anywhere on the
 * site) and the per-location hours/phone block. Hours, addresses, phone and a
 * per-Location synopsis live on /contact, derived from the Location data
 * (ADR 0015).
 *
 * Also deliberately NOT here: a /fuel-prices link. ADR 0008 originally named
 * the footer as a second entry point; it was dropped on 18 Sep 2026 because
 * the price block is on every page and its "All prices" panel link sits right
 * under the prices the guest is already reading. Do not re-add it.
 */

/** Marks a link as leaving the site without naming where it goes. */
function ExternalGlyph() {
  return (
    <svg
      className={styles.extGlyph}
      viewBox="0 0 12 12"
      width="11"
      height="11"
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

export async function SiteFooter() {
  const settings = await getSettings()
  const { careersUrl, lummiCommercialCompaniesUrl } = settings.footer

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <nav className={styles.cols} aria-label="Footer">
          <Link className={styles.col} href="/about">
            About
          </Link>
          <Link className={styles.col} href="/contact">
            Contact
          </Link>
          <Link className={styles.col} href="/rewards">
            Rewards
          </Link>

          {/*
            Careers. The link text is exactly "Careers" and nothing else.
            No company name, no logo, no tooltip naming the destination — the
            destination is editable in the CMS and the label must not describe
            it (ADR 0001, amended 17 Sep 2026). The arrow says "you are leaving
            this site"; it does not say where to.
          */}
          {careersUrl ? (
            <a
              className={styles.col}
              href={careersUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Careers
              <ExternalGlyph />
              <span className="visually-hidden">(opens in a new tab)</span>
            </a>
          ) : null}

          {/* The one sanctioned reference to the wider group. Spans the row. */}
          {lummiCommercialCompaniesUrl ? (
            <a
              className={`${styles.col} ${styles.colWide}`}
              href={lummiCommercialCompaniesUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Lummi Commercial Companies
              <ExternalGlyph />
              <span className="visually-hidden">(opens in a new tab)</span>
            </a>
          ) : null}
        </nav>

        <SocialRow links={settings.social} />

        <div className={styles.base}>
          {/*
            The "No cookies. Visits counted anonymously." line used to sit here
            beside this link. Removed at the owner's direction, 29 Sep 2026: the
            same statement is made in full in the "This website" section of
            /privacy, which is where it belongs (ADR 0025, amended).

            What has NOT changed is the constraint behind it. The site still
            sets no cookies, and anything added later that would set one — an
            embed, a feed, an analytics tag — now falsifies a page rather than a
            footer line. The claim moved; it did not go away.

            /privacy is never renamed or deleted once it is in a store listing
            (ADR 0026), which is also why this link stays.
          */}
          <Link className={styles.baseLink} href="/privacy">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
