import styles from './FuelPriceBlock.module.css'

/**
 * The rail the fuel price block sits in on desktop (ADR 0005).
 *
 * On a phone the wrapper dissolves — `display: contents` — so the block sits in
 * the normal flow at full width instead of inside a column that does not exist
 * at that size.
 */
export function FuelPriceRail({ children }: { children: React.ReactNode }) {
  return <div className={styles.rail}>{children}</div>
}
