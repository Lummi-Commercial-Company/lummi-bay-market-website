import Image from 'next/image'
import styles from './PageBackdrop.module.css'
import type { PageBackdropSettings } from '@/lib/types'

/**
 * The page backdrop — the side watermark (ADR 0020).
 *
 * Decoration, and it behaves like it: `aria-hidden`, no pointer events, hidden
 * on phones entirely (there is no room for a watermark beside a 375px column),
 * and hidden under `prefers-contrast: more`.
 *
 * It is NEVER recoloured. The artwork is the artwork; opacity is the only
 * control, and it is deliberately not clamped — 10% is the measured line that
 * keeps body text comfortable, not a ceiling the CMS enforces.
 *
 * It must go through next/image: the source PNGs are 1.85 MB and 3.22 MB, which
 * is roughly the whole page-weight budget spent on something nobody is meant to
 * notice.
 */
export function PageBackdrop({
  settings,
  disabled,
}: {
  settings: PageBackdropSettings
  /** A page may opt out — `noBackdrop` on the page document. */
  disabled?: boolean
}) {
  if (disabled || !settings.enabled || !settings.image) return null

  return (
    <div
      className={styles.backdrop}
      data-side={settings.side}
      aria-hidden="true"
      style={{
        opacity: settings.opacity / 100,
        height: `${settings.height}vh`,
      }}
    >
      <Image
        className={styles.art}
        src={settings.image}
        alt=""
        width={866}
        height={2948}
        sizes="(max-width: 767px) 0px, 40vw"
        quality={70}
      />
    </div>
  )
}
