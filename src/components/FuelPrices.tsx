import { formatPrice, formatUpdated, getPriceGroup, GROUP_LABELS } from "@/lib/fuel";
import type { PriceGroupId } from "@/lib/fuel";
import styles from "./FuelPrices.module.css";

/**
 * The one fuel-price component on the site. Written once, used twice:
 *  - variant="panel" — the compact block in the header and on Home.
 *  - variant="full"  — the all-locations view on /fuel-prices.
 * Adding a third place to show prices means another <FuelPrices />, never a copy.
 */

type Props = {
  groups: PriceGroupId[];
  variant?: "panel" | "full";
  showUpdated?: boolean;
};

export default function FuelPrices({
  groups,
  variant = "panel",
  showUpdated = true,
}: Props) {
  const data = groups.map((id) => ({ id, ...getPriceGroup(id) }));
  const updated = data[0]?.updated;

  return (
    <div className={variant === "panel" ? styles.panel : styles.full}>
      {data.map((group) => (
        <div key={group.id} className={styles.group}>
          <span className={styles.groupLabel}>{GROUP_LABELS[group.id]}</span>
          <ul className={styles.grades}>
            {group.prices.map((row) => (
              <li key={row.grade} className={styles.grade}>
                <span className={styles.gradeLabel}>{row.label}</span>
                <span className={styles.price}>
                  <span className={styles.dollar}>$</span>
                  {formatPrice(row.value)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {showUpdated && updated && (
        <p className={styles.updated}>Prices updated {formatUpdated(updated)}</p>
      )}
    </div>
  );
}
