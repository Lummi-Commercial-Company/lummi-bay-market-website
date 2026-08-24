import {
  formatPrice,
  formatUpdated,
  getPriceGroup,
  GROUP_LABELS,
  GROUP_SHORT_LABELS,
} from "@/lib/fuel";
import type { Grade, PriceGroupId } from "@/lib/fuel";
import styles from "./FuelPrices.module.css";

/**
 * The one fuel-price component on the site. Written once, used everywhere:
 *  - variant="panel" — the condensed sticky widget in the header.
 *  - variant="full"  — the all-grades view on /fuel-prices and location pages.
 * Adding another place to show prices means another <FuelPrices />, never a copy.
 *
 * `only` narrows which grades are shown without touching the data. The sticky widget
 * shows unleaded and diesel (diesel and DEF at the truck stop); midgrade, premium and
 * ethanol-free are still sold and still appear in the full views.
 */

type Props = {
  groups: PriceGroupId[];
  variant?: "panel" | "full";
  showUpdated?: boolean;
  only?: Grade[];
};

export default function FuelPrices({
  groups,
  variant = "panel",
  showUpdated = true,
  only,
}: Props) {
  const data = groups.map((id) => {
    const group = getPriceGroup(id);
    return {
      id,
      ...group,
      prices: only
        ? group.prices.filter((row) => only.includes(row.grade))
        : group.prices,
    };
  });
  const updated = data[0]?.updated;
  const labels = variant === "panel" ? GROUP_SHORT_LABELS : GROUP_LABELS;

  return (
    <div className={variant === "panel" ? styles.panel : styles.full}>
      <div className={styles.groups}>
        {data.map((group) => (
          <div key={group.id} className={styles.group}>
            <span className={styles.groupLabel}>{labels[group.id]}</span>
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
      </div>

      {showUpdated && updated && (
        <p className={styles.updated}>Prices updated {formatUpdated(updated)}</p>
      )}
    </div>
  );
}
