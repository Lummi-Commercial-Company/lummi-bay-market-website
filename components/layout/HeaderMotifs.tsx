import styles from './SiteHeader.module.css'

/**
 * The header motif band (ADR 0021).
 *
 * TODO: replace with approved Lummi art.
 *
 * Decoration only, and it behaves like decoration: `aria-hidden`, no pointer
 * events, hidden entirely under `prefers-contrast: more`, and hidden entirely
 * where CSS masks are unsupported rather than falling back to a solid block.
 * The art is a mask, so it can never introduce a colour the brand does not own.
 *
 * One row, right-aligned, and it stops at least 20px clear of the nav's right
 * edge — that is a floor, not a target. `mask-repeat: space` drops a whole tile
 * rather than clipping one, so the band never shows half a motif.
 */
export function HeaderMotifs() {
  return <div className={styles.motifs} aria-hidden="true" />
}
