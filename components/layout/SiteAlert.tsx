import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import styles from './SiteHeader.module.css'
import { liveNotice, noticesFrom } from '@/lib/notices'
import { pacificStamp } from '@/lib/pacific-time'
import { getSettings } from '@/lib/settings'
import { liveDocument } from '@/lib/tina-live'
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
  // Read live from the CMS (lib/tina-live.ts), so a notice saved a moment ago
  // is up within seconds; the built settings are the fallback.
  const live = await liveDocument('settings', 'site.json')
  const notices = live ? noticesFrom(live) : (await getSettings()).alerts
  const notice = liveNotice(notices, pacificStamp(new Date()))
  return notice ? <SiteAlert alert={notice} source={live ? 'live' : 'build'} /> : null
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
export function SiteAlert({ alert, source }: { alert: SiteAlertDoc; source?: 'live' | 'build' }) {
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
    <div className={styles.alert} role="status" aria-live="polite" data-source={source}>
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
