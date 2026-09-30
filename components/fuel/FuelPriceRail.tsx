import styles from './FuelPriceBlock.module.css'
import { RailMetrics } from './RailMetrics'

/**
 * The rail the fuel price block sits in on desktop (ADR 0005).
 *
 * On a phone the wrapper dissolves — `display: contents` — so the block sits in
 * the normal flow at full width instead of inside a column that does not exist
 * at that size.
 *
 * The mark before it is where the block RESTS, in the page, and it stays there
 * while the sticky rail moves: the block condenses when the mark scrolls under
 * the header. The block's own sentinel cannot do that job where the rail is
 * sticky — it rides along with the block, never leaves the screen, and the
 * block never condensed (reported 30 Sep 2026; broken since the rail became
 * sticky, ADR 0006).
 */
export function FuelPriceRail({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className={styles.railMark} data-rail-mark="" aria-hidden="true" />
      <div className={styles.rail} data-rail="">
        {children}
        <RailMetrics />
      </div>
    </>
  )
}
