import styles from "./PhotoSlot.module.css";

/**
 * A correctly-sized, clearly-marked image slot. No photography of any kind exists
 * for this brand yet (see PRODUCT.md, "Evidence on hand"), and licensed stock cannot
 * be bought from the build environment — so the layout ships with real slots and a
 * shot list (docs/design/home-shot-list.md) instead of unlicensed images.
 *
 * Aspect ratios live in CSS, not inline, so the feature slot can be portrait on a
 * phone and letterbox on a wide screen.
 *
 * TODO: replace each slot with next/image once licensed stock or commissioned
 * photography lands in /public/photos. `name` maps 1:1 to the shot list.
 */
export default function PhotoSlot({
  name,
  feature = false,
}: {
  name: string;
  feature?: boolean;
}) {
  return (
    <div
      className={`${styles.slot} ${feature ? styles.feature : styles.standard}`}
      aria-hidden="true"
    >
      <span className={styles.label}>Stock photo</span>
      <span className={styles.name}>{name}</span>
    </div>
  );
}
