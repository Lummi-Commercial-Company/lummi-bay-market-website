import Link from 'next/link'
import styles from './SiteHeader.module.css'
import type { SiteAlertDoc } from '@/lib/types'

/**
 * The emergency notice (ADR 0017).
 *
 * Sitewide, instant and unplanned — a water main break, a road closure, a store
 * shut early. It rides inside the sticky header wrapper, under the waterline,
 * so it travels with the header rather than scrolling away.
 *
 * When it is inactive it renders NOTHING: no empty bar, no reserved space, no
 * collapsed element. A zero-height bar that occasionally shows a stray border
 * is worse than no bar.
 *
 * This is not the hours override. The override is per-Location, scheduled, and
 * fixes the hours themselves wherever they render (ADR 0027). This is sitewide,
 * immediate, and says something the hours cannot.
 */
export function SiteAlert({ alert }: { alert: SiteAlertDoc }) {
  if (!alert.active || !alert.headline.trim()) return null

  const body = (
    <>
      <span className={styles.alertIcon} aria-hidden="true">
        !
      </span>
      <span className={styles.alertText}>
        <strong>{alert.headline}</strong>
        {alert.detail ? <span className={styles.alertDetail}> {alert.detail}</span> : null}
      </span>
    </>
  )

  return (
    <div className={styles.alert} role="status" aria-live="polite">
      <div className={styles.alertInner}>
        {alert.link ? (
          <Link href={alert.link} className={styles.alertLink}>
            {body}
          </Link>
        ) : (
          body
        )}
      </div>
    </div>
  )
}
