import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import styles from './SiteHeader.module.css'
import { liveNotice } from '@/lib/notices'
import { pacificStamp } from '@/lib/pacific-time'
import { getSettings } from '@/lib/settings'
import type { SiteAlertDoc } from '@/lib/types'

/**
 * The notice slot in the header: which notice, if any, is decided on every
 * visit, because notices can be scheduled (ADR 0017, amended 30 Sep 2026) —
 * the same way promotions are (components/promos/PromoRegion.tsx). The rest
 * of the header stays in the static shell; only this streams in.
 */
export function SiteAlertSlot() {
  return (
    <Suspense fallback={null}>
      <LiveSiteAlert />
    </Suspense>
  )
}

async function LiveSiteAlert() {
  await connection()
  const settings = await getSettings()
  const notice = liveNotice(settings.alerts, pacificStamp(new Date()))
  return notice ? <SiteAlert alert={notice} /> : null
}

/**
 * The emergency notice (ADR 0017).
 *
 * Sitewide — a water main break, a road closure, a store shut early; or,
 * scheduled ahead, a planned closure or an event weekend. It rides inside the sticky header wrapper, under the waterline,
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
