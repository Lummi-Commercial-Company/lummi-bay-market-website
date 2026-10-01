import type { TinaCMS } from 'tinacms'

/**
 * Warn when this CMS tab is older than the CMS on the site.
 *
 * Why (30 Sep 2026): a tab opened before an update kept running the old CMS.
 * Its Site Settings form still had the single "Emergency notice", showed it
 * empty — the notice had moved into the new list — and saving that form wrote
 * the settings back in the old shape, which deleted the list and took the live
 * notice down. Nothing said the tab was out of date.
 *
 * So the tab remembers which build it started with (the bundle named in
 * /admin/index.html) and checks the site's current one when the editor comes
 * back to the tab, and every minute. If they differ it puts up an error
 * message — Tina keeps error messages up until they are closed — saying to
 * reload before saving anything.
 *
 * Local development serves the CMS differently and has no bundle name; the
 * check simply does not run there.
 */

/** The CMS bundle an /admin/index.html loads, e.g. `/admin/assets/index-_zCwZZ2C.js`. */
export function adminBundleFrom(html: string): string | null {
  return html.match(/src="(\/admin\/assets\/index-[^"]+\.js)"/)?.[1] ?? null
}

export const STALE_MESSAGE =
  'This CMS page is out of date: the CMS has been updated since you opened it. Reload this page (the browser’s reload button, or F5) before saving anything — saving from an out-of-date page can undo recent changes.'

const WIRED = Symbol.for('lummi-bay.stale-cms')

export function warnWhenCmsUpdated(cms: TinaCMS): TinaCMS {
  if (typeof window === 'undefined') return cms
  const holder = cms as unknown as Record<symbol, boolean>
  if (holder[WIRED]) return cms
  holder[WIRED] = true

  const started = adminBundleFrom(document.documentElement.outerHTML)
  if (!started) return cms

  let warned = false
  const check = async () => {
    if (warned || document.visibilityState === 'hidden') return
    try {
      const response = await fetch('/admin/index.html', { cache: 'no-store' })
      const latest = adminBundleFrom(await response.text())
      if (latest && latest !== started) {
        warned = true
        cms.alerts.error(STALE_MESSAGE)
      }
    } catch {
      // Offline for a moment: try again at the next check.
    }
  }
  window.setInterval(check, 60_000)
  window.addEventListener('focus', check)
  document.addEventListener('visibilitychange', check)
  return cms
}
