import styles from './SiteFooter.module.css'
import type { SocialLink } from '@/lib/types'

/**
 * The footer social row (ADR 0028).
 *
 * LINKS ONLY, NEVER EMBEDS. A feed, a follow button or an official share widget
 * loads third-party code and sets cookies before anyone clicks it, which would
 * make the "This website" section of /privacy false — it says the site sets no
 * cookies, and that is a checkable claim, so this row is constrained by it
 * (ADR 0025, amended 29 Sep 2026: the claim moved there from the footer).
 *
 * When the list is empty this renders NOTHING: no placeholder, no greyed icon,
 * and never `href="#"`. An account we do not have is not a disabled button.
 *
 * Glyphs are inline SVG — no icon font, nothing fetched at runtime — and are
 * filled with bone, never the platform's own brand colour.
 *
 * TODO: replace these simplified glyphs with each platform's official brand
 * mark before launch. They are geometric stand-ins, not the trademarked art.
 */

const GLYPHS: Record<SocialLink['platform'], React.ReactNode> = {
  facebook: (
    <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.63A22 22 0 0 0 14.3 3.5c-2.4 0-4 1.46-4 4.14V9.9H7.6V13h2.7v8z" />
  ),
  instagram: (
    <>
      <path d="M12 4.6c2.4 0 2.69.01 3.64.05.88.04 1.35.19 1.67.31.42.16.72.36 1.03.67s.51.61.67 1.03c.12.32.27.79.31 1.67.04.95.05 1.24.05 3.64s-.01 2.69-.05 3.64c-.04.88-.19 1.35-.31 1.67-.16.42-.36.72-.67 1.03s-.61.51-1.03.67c-.32.12-.79.27-1.67.31-.95.04-1.24.05-3.64.05s-2.69-.01-3.64-.05c-.88-.04-1.35-.19-1.67-.31a2.8 2.8 0 0 1-1.03-.67 2.8 2.8 0 0 1-.67-1.03c-.12-.32-.27-.79-.31-1.67C4.61 14.69 4.6 14.4 4.6 12s.01-2.69.05-3.64c.04-.88.19-1.35.31-1.67.16-.42.36-.72.67-1.03s.61-.51 1.03-.67c.32-.12.79-.27 1.67-.31C9.31 4.61 9.6 4.6 12 4.6m0-1.6c-2.44 0-2.75.01-3.71.05-.96.05-1.61.2-2.19.42-.6.23-1.1.55-1.6 1.05s-.82 1-1.05 1.6c-.22.58-.37 1.23-.42 2.19C3 9.25 3 9.56 3 12s.01 2.75.05 3.71c.05.96.2 1.61.42 2.19.23.6.55 1.1 1.05 1.6s1 .82 1.6 1.05c.58.22 1.23.37 2.19.42.96.04 1.27.05 3.71.05s2.75-.01 3.71-.05c.96-.05 1.61-.2 2.19-.42.6-.23 1.1-.55 1.6-1.05s.82-1 1.05-1.6c.22-.58.37-1.23.42-2.19.04-.96.05-1.27.05-3.71s-.01-2.75-.05-3.71c-.05-.96-.2-1.61-.42-2.19a4.4 4.4 0 0 0-1.05-1.6 4.4 4.4 0 0 0-1.6-1.05c-.58-.22-1.23-.37-2.19-.42C14.75 3.01 14.44 3 12 3" />
      <path d="M12 7.38A4.62 4.62 0 1 0 16.62 12 4.62 4.62 0 0 0 12 7.38m0 7.62A3 3 0 1 1 15 12a3 3 0 0 1-3 3" />
      <circle cx="16.8" cy="7.2" r="1.08" />
    </>
  ),
  yelp: (
    <>
      <path d="M10.3 11.4 5.6 9.2a1.1 1.1 0 0 1-.5-1.6 6.4 6.4 0 0 1 2-2.1 1.1 1.1 0 0 1 1.6.6l2.1 4.8a.8.8 0 0 1-.5 1.1.8.8 0 0 1-.1-.6z" />
      <path d="M11.2 3.1a11 11 0 0 1 2.7.6c.5.2.8.6.8 1.1v6.4c0 .6-.7.9-1.1.5L10 7.3a1.1 1.1 0 0 1-.2-1.3l.6-2.2c.1-.4.4-.7.8-.7" />
      <path d="M13.9 13.2a.9.9 0 0 1 .9-.4l4.5.7a1.1 1.1 0 0 1 .9 1.4 6.4 6.4 0 0 1-1.1 2.3 1.1 1.1 0 0 1-1.7.1l-3.3-3.1a.9.9 0 0 1-.2-1z" />
      <path d="M13.6 15.6a.9.9 0 0 1 1 .1l2.7 2.6a1.1 1.1 0 0 1-.2 1.7 6.4 6.4 0 0 1-2.4.9 1.1 1.1 0 0 1-1.3-1.1l.1-3.4a.9.9 0 0 1 .1-.8" />
      <path d="M11.5 15.4a.9.9 0 0 1 .3.8l-.6 3.6a1.1 1.1 0 0 1-1.5.9 6.4 6.4 0 0 1-2.3-1.5 1.1 1.1 0 0 1 .2-1.7l3-2.2a.9.9 0 0 1 .9.1" />
    </>
  ),
}

export function SocialRow({ links }: { links: SocialLink[] }) {
  if (links.length === 0) return null

  return (
    <ul className={styles.social}>
      {links.map((link) => (
        <li key={link.platform}>
          <a
            className={styles.socialLink}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              className={styles.socialGlyph}
              viewBox="0 0 24 24"
              width="20"
              height="20"
              aria-hidden="true"
              focusable="false"
              fill="currentColor"
            >
              {GLYPHS[link.platform]}
            </svg>
            <span className="visually-hidden">{link.label} (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  )
}
