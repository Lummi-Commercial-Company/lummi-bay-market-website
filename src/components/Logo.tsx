import styles from "./Logo.module.css";

/**
 * LOGO IS LOCKED. The supplied vector art is used as-is — never redrawn, recolored,
 * distorted or re-typeset. The vectors are not in the repo yet, so this is a sized
 * SLOT holding the name in brand type until the real file lands. It is a placeholder
 * for the art, not a substitute for it, and it is not the logo.
 *
 * TODO: replace with the supplied Market lockup vector (public/logo-market.svg),
 * rendered with next/image at its native ratio. Clear space = paddle-handle height
 * on all sides; minimum width 72px.
 */
export default function Logo() {
  return (
    <span className={styles.slot} data-placeholder="logo">
      <span className={styles.mark}>Lummi Bay</span>
      <span className={styles.sub}>Market</span>
    </span>
  );
}
