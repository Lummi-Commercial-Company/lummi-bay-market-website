/**
 * The full-page background (owner, 6 Oct 2026, ADR 0031) — one image behind
 * every page, tiled or filling the page. Not the watermark: that is one large
 * image down one side (ADR 0020). Both can be on at once.
 *
 * Kept free of React so the rules are tested (page-background.test.ts).
 */

export type BackgroundFit = 'repeat' | 'repeat-x' | 'repeat-y' | 'cover' | 'contain'

export interface PageBackgroundSettings {
  enabled: boolean
  image?: string
  fit: BackgroundFit
  /** Tiles only: percent of the image's own size, 10–200. */
  scale: number
  /** Percent, 0–100. */
  opacity: number
}

const FITS = new Set<BackgroundFit>(['repeat', 'repeat-x', 'repeat-y', 'cover', 'contain'])
const TILES = new Set<BackgroundFit>(['repeat', 'repeat-x', 'repeat-y'])

export const SCALE = { min: 10, max: 200, fallback: 40 }
export const OPACITY = { min: 0, max: 100, fallback: 100 }

const clamp = (value: unknown, { min, max, fallback }: typeof SCALE) =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback

export function pageBackgroundFrom(raw: unknown): PageBackgroundSettings {
  const record = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const fit = FITS.has(record.fit as BackgroundFit) ? (record.fit as BackgroundFit) : 'repeat'
  const image = typeof record.image === 'string' && record.image.trim() ? record.image.trim() : undefined
  return {
    enabled: record.enabled === true,
    image,
    fit,
    scale: clamp(record.scale, SCALE),
    opacity: clamp(record.opacity, OPACITY),
  }
}

export const isTiled = (fit: BackgroundFit) => TILES.has(fit)

/** Quotes, brackets, backslashes or line breaks could end the url() early. */
const SAFE_URL = /^[^"'()\\\s<>]+$/

const round = (n: number) => Math.round(n * 10) / 10

/**
 * The CSS for the background, or null when nothing should be drawn yet. A tile
 * needs the image's own size first — CSS can only size a background against
 * the page, not against the image — so it waits for `natural`.
 */
export function backgroundStyle(
  settings: PageBackgroundSettings,
  natural: { width: number; height: number } | null
): Record<string, string> | null {
  const { enabled, image, fit, scale } = settings
  if (!enabled || !image || !SAFE_URL.test(image)) return null
  const backgroundImage = `url("${image}")`
  if (!isTiled(fit)) {
    return { backgroundImage, backgroundSize: fit, backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }
  }
  if (!natural || !natural.width || !natural.height) return null
  const width = Math.max(1, round((natural.width * scale) / 100))
  const height = Math.max(1, round((natural.height * scale) / 100))
  return { backgroundImage, backgroundSize: `${width}px ${height}px`, backgroundRepeat: fit, backgroundPosition: 'center top' }
}
