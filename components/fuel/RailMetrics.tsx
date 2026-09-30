'use client'

import { useEffect, useRef } from 'react'

/**
 * Publishes the price block's resting height as `--rail-h`.
 *
 * The promo region runs the full page width under the two-column top, and the
 * block sits in that top's right-hand column. Where a page's title column is
 * shorter than the block — `/locations` is a title and one line — the region
 * would start beside the block and run under it. The page grid gives the
 * title column this height as a floor whenever a region is present, so the
 * region always starts below the block.
 *
 * Measured, not hard-coded, because the block's height follows its content
 * (the rows of places it shows). It never changes on scroll: condensing keeps
 * the resting height (ADR 0005). The CSS default is the measured value, so the
 * first paint is right before this runs.
 */
export function RailMetrics() {
  const ref = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const rail = ref.current?.parentElement
    if (!rail) return
    const publish = () => {
      const height = Math.round(rail.getBoundingClientRect().height)
      // 0 on a phone, where the rail dissolves; nothing depends on it there.
      if (height > 0) document.documentElement.style.setProperty('--rail-h', `${height}px`)
    }
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(rail)
    return () => observer.disconnect()
  }, [])

  return <span ref={ref} hidden />
}
