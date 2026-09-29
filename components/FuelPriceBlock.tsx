import { getPriceRows, type PriceRow } from "@/lib/content";
import styles from "./FuelPriceBlock.module.css";

const GRADES = [
  { key: "regular", label: "Regular" },
  { key: "diesel", label: "Diesel" },
  { key: "def", label: "DEF" },
] as const;

type GradeKey = (typeof GRADES)[number]["key"];

function price(row: PriceRow, grade: GradeKey): string {
  const value = row.prices[grade];
  // A place that does not sell a grade gets an em-dash — ADR 0005.
  return typeof value === "number" ? value.toFixed(2) : "—";
}

/**
 * The fuel price block. Full contract: ADR 0005 + skill `fuel-price-update`.
 *
 * Every block loads COLLAPSED, on every page. There is no "loads expanded" variant.
 *
 * At rest the card carries the page's own subject and the Truck Stop — the same at
 * both widths. Truck prices are why a whole class of guests is on the site, and a
 * phone is what they are holding, so there is no phone-only variant.
 *
 * Opening uses the HTML popover API, so outside-click and Escape dismiss it with zero
 * JavaScript. The popover covers the block rather than opening below it, which is why
 * the panel carries the full table rather than repeating the card underneath itself.
 *
 * ONE TABLE. One header row. A column per grade, the union of grades sold by the rows
 * on screen. Never two grouped tables with their own headers.
 *
 * NOT YET BUILT: condensing to a one-line bar on scroll. That needs an
 * IntersectionObserver plus the zero-pixel-shift assertion ADR 0005 demands, and
 * cross-browser measurement this build has not had. See docs/loose-ends.md.
 */
export default function FuelPriceBlock({ subject }: { subject?: string }) {
  const allRows = getPriceRows();
  const subjectKey = subject ?? allRows[0]?.key;

  const subjectRow = allRows.find((r) => r.key === subjectKey);
  const truckRow = allRows.find((r) => r.key === "truck-stop");

  // On /truck-stop the Truck Stop leads, so diesel and DEF are the first numbers a
  // driver hits. "The page's own" means the page's subject, not always a Location.
  const cardRows: PriceRow[] =
    subjectKey === "truck-stop"
      ? [truckRow, allRows.find((r) => r.key === "exit-260")].filter(Boolean as unknown as (v: PriceRow | undefined) => v is PriceRow)
      : [subjectRow, truckRow].filter(Boolean as unknown as (v: PriceRow | undefined) => v is PriceRow);

  const restRows = allRows.filter((r) => !cardRows.some((c) => c.key === r.key));

  // The column set is derived: only grades some visible row actually sells.
  const columns = GRADES.filter((g) =>
    allRows.some((r) => typeof r.prices[g.key] === "number"),
  );

  const panelId = "fuel-price-panel";

  const headerRow = (
    <div className={styles.row} role="row">
      <span className={styles.place} role="columnheader" />
      {columns.map((g) => (
        <span key={g.key} className={styles.gradeHead} role="columnheader">
          {g.label}
        </span>
      ))}
    </div>
  );

  const renderRow = (row: PriceRow) => (
    <div className={styles.row} role="row" key={row.key}>
      <span className={styles.place} role="rowheader">
        {row.label}
      </span>
      {columns.map((g) => (
        <span key={g.key} className={styles.price} role="cell">
          {price(row, g.key)}
        </span>
      ))}
    </div>
  );

  return (
    <aside className={styles.block} aria-label="Fuel prices">
      <div className={styles.card}>
        <button
          type="button"
          className={styles.control}
          popoverTarget={panelId}
        >
          <span aria-hidden="true">⌄</span> View all prices
        </button>

        <div className={styles.table} role="table" aria-label="Fuel prices by location">
          {headerRow}
          {cardRows.map(renderRow)}
        </div>
      </div>

      <div id={panelId} popover="auto" className={styles.panel}>
        <button
          type="button"
          className={styles.control}
          popoverTarget={panelId}
          popoverTargetAction="hide"
        >
          <span aria-hidden="true">⌃</span> Hide
        </button>

        <div className={styles.table} role="table" aria-label="Fuel prices, all locations">
          {headerRow}
          {cardRows.map(renderRow)}
          <div className={styles.hairline} role="presentation" />
          {restRows.map(renderRow)}
        </div>
      </div>
    </aside>
  );
}
