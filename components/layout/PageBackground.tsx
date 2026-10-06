'use client'

import { useEffect, useState } from 'react'
import styles from './PageBackground.module.css'
import { backgroundStyle, isTiled, type PageBackgroundSettings } from '@/lib/page-background'

/**
 * The full-page background (ADR 0031) — one image behind every page, tiled or
 * filling it. Decoration: `aria-hidden`, no pointer events, hidden under
 * `prefers-contrast: more` and in print.
 *
 * A client component for one reason: a tile is sized as a share of the image's
 * own size, and only the browser knows that size. Until it does, nothing is
 * drawn, so the tiles never jump from full size to their set size.
 */
export function PageBackground({ settings }: { settings: PageBackgroundSettings }) {
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null)
  const { enabled, image, fit } = settings
  const needsSize = enabled && Boolean(image) && isTiled(fit)

  useEffect(() => {
    if (!needsSize || !image) return
    let current = true
    const probe = new window.Image()
    probe.onload = () => {
      if (current) setNatural({ width: probe.naturalWidth, height: probe.naturalHeight })
    }
    probe.src = image
    return () => {
      current = false
    }
  }, [needsSize, image])

  const style = backgroundStyle(settings, natural)
  if (!style) return null

  return (
    <div className={styles.background} aria-hidden="true" style={{ ...style, opacity: settings.opacity / 100 }} />
  )
}
