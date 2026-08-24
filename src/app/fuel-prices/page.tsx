import FuelPrices from "@/components/FuelPrices";
import styles from "./page.module.css";

export const metadata = { title: "Fuel prices" };

/**
 * The all-locations view. Same <FuelPrices /> as the header panel and Home —
 * one component, three uses, per the reuse contract in issue #7.
 */
export default function FuelPricesPage() {
  return (
    <section className={`wrap ${styles.page}`}>
      <h1>Fuel prices</h1>
      <p className={styles.lede}>
        Every grade at all three locations. The truck lanes at Exit 260 are priced
        separately from the car lanes.
      </p>

      <div className={styles.card}>
        <FuelPrices
          groups={[
            "exit-260",
            "exit-260-truck-stop",
            "mini-mart",
            "fishermans-cove",
          ]}
          variant="full"
        />
      </div>
    </section>
  );
}
