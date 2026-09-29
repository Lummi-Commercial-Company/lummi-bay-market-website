import styles from "./Waterline.module.css";

/**
 * The blue waterline — the site's recurring signature band.
 *
 * DELIBERATELY NOT tribal art. HANDOFF.md is explicit: "Coast Salish art must be
 * authentic, commissioned, or tribe-approved. Do not generate formline, even as a
 * placeholder." An illustrated layer was built and rejected (ADR 0012). So this is a
 * purely geometric wave in the approved teal and carries no cultural motif at all.
 * Approved Lummi art, when it exists, replaces this band — it does not decorate it.
 */
export default function Waterline() {
  return (
    <div className={styles.waterline} aria-hidden="true">
      <svg
        viewBox="0 0 1200 24"
        preserveAspectRatio="none"
        className={styles.wave}
        focusable="false"
      >
        <path
          d="M0 12 Q 75 0 150 12 T 300 12 T 450 12 T 600 12 T 750 12 T 900 12 T 1050 12 T 1200 12 V24 H0 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
