'use client'

import { useEffect } from 'react'

/**
 * Publishes the live header height as `--hd-h`.
 *
 * The header is sticky and everything that has to clear it — the fuel rail's
 * sticky offset, `scroll-margin-top` on in-page anchors, the back-to-top focus
 * target — needs its height. That height is not a constant: the emergency
 * notice rides inside the sticky wrapper and changes it the moment it is
 * published (ADR 0017), and it can wrap to two lines on a narrow phone. So it
 * is measured, not hard-coded. The CSS default in `globals.css` is the no-alert
 * value, which makes the first paint correct before this runs.
 */
export function HeaderMetrics({ targetId }: { targetId: string }) {
  useEffect(() => {
    const el = document.getElementById(targetId)
    if (!el) return

    const publish = () => {
      const height = Math.round(el.getBoundingClientRect().height)
      if (height > 0) {
        document.documentElement.style.setProperty('--hd-h', `${height}px`)
      }
    }

    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(el)
    return () => observer.disconnect()
  }, [targetId])

  return null
}
