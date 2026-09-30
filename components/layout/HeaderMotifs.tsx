import styles from './SiteHeader.module.css'
import { getHeaderMotifs, type MotifInk } from '@/lib/motifs'

/**
 * The header motif band (ADR 0021, amended 30 Sep 2026).
 *
 * TODO: replace with approved Lummi art. Staff upload the motifs and arrange
 * them into groups in the CMS; the art itself must still be authentic or
 * tribe-approved before launch (CLAUDE.md).
 *
 * Decoration only, and it behaves like decoration: `aria-hidden`, no pointer
 * events, hidden entirely under `prefers-contrast: more`, and hidden entirely
 * where CSS masks are unsupported rather than falling back to solid blocks.
 * Each motif is a mask over one of three brand inks, so an upload can never
 * introduce a colour the brand does not own.
 *
 * The four rules still hold, now for any group staff build:
 *   - one row, ever, and whole motifs only: the band wraps and hides every
 *     line but the first, so a motif that does not fit drops off the end
 *     instead of being cut in half;
 *   - right-aligned, so slack falls on the nav side;
 *   - at least 20px clear of the nav (the band's margin);
 *   - masked over a token colour.
 */

const INK: Record<MotifInk, string> = {
  bone: 'var(--lb-bone)',
  teal: 'var(--lb-teal)',
  white: '#ffffff',
}

/** Enough copies of a short group to cross the widest band the header has. */
const FILL_PX = 1400
/** The motif height the fill estimate assumes: 86% of a 56px bar. */
const TYPICAL_HEIGHT_PX = 48
const MAX_ITEMS = 60

const cssUrl = (src: string) => `url("${encodeURI(src).replace(/"/g, '%22')}")`

export async function HeaderMotifs() {
  const band = await getHeaderMotifs()
  // Nothing to show still keeps the band's slot, so the pill stays right.
  if (!band) return <div className={styles.motifs} aria-hidden="true" />

  const height = (TYPICAL_HEIGHT_PX * band.scale) / 86
  const groupWidth = band.items.reduce((sum, item) => sum + item.ratio * height + band.spacing, 0)
  const copies = band.repeat ? Math.max(1, Math.ceil(FILL_PX / Math.max(groupWidth, 1))) : 1
  const items = Array.from({ length: copies }, () => band.items).flat().slice(0, MAX_ITEMS)

  return (
    <div
      className={`${styles.motifs} ${styles.motifsOn}`}
      aria-hidden="true"
      style={
        {
          '--motif-a': band.strength / 100,
          '--motif-gap': `${band.spacing}px`,
          '--motif-ink': INK[band.ink],
        } as React.CSSProperties
      }
    >
      {items.map((item, index) => (
        <span
          key={index}
          className={styles.motif}
          style={{
            // Width follows height: the slot is as tall as the bar, the shape
            // inside it `scale` percent of that.
            aspectRatio: String(item.ratio * (band.scale / 100)),
            WebkitMaskImage: cssUrl(item.src),
            maskImage: cssUrl(item.src),
          }}
        />
      ))}
    </div>
  )
}
