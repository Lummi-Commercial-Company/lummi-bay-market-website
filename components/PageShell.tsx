import FuelPriceBlock from "./FuelPriceBlock";
import styles from "./PageShell.module.css";

/**
 * The interior page frame: a content column with the fuel-price rail flush to the
 * right edge on desktop, in flow above the content on phones.
 *
 * On a phone the card is IN FLOW, never absolutely positioned — absolute, it covered
 * the promo below it completely (ADR 0005). The reserved right-hand column is
 * desktop-only.
 *
 * Reused by every page so the rail is never hand-placed twice.
 */
export default function PageShell({
  title,
  subject,
  children,
}: {
  title: string;
  subject?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`container ${styles.shell}`}>
      <div className={styles.rail}>
        <FuelPriceBlock subject={subject} />
      </div>
      <div className={styles.content}>
        <h1>{title}</h1>
        {children}
      </div>
    </div>
  );
}
