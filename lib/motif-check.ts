/**
 * The check every header motif file passes before it can be uploaded, and
 * again before the site shows it (ADR 0021, amended 30 Sep 2026).
 *
 * Plain string work, no DOM and no Node APIs, so the same function runs in
 * the CMS upload box (in the editor's browser) and on the server when the
 * header is drawn. It reads the SVG's code; it never renders it.
 *
 * Why each rule exists:
 *   - The band is a CSS mask over a brand colour. Only the SHAPE of the file
 *     is used — its colours are ignored — so the file must be shapes on a
 *     transparent ground. A solid background becomes a filled rectangle
 *     across the header; a photo inside an SVG is not a shape.
 *   - An SVG is a program as well as a picture. The file is stored with the
 *     site's own images and can be opened directly at its address, so
 *     anything that runs code or loads from another site is refused.
 *   - One row, whole motifs only, right-aligned (ADR 0021): a file that is
 *     extremely tall or extremely wide cannot sit in a 56–63px band.
 *   - Motifs are decoration and stay still (ADR 0012): no animation.
 *   - Text in a mask depends on fonts the visitor may not have: outline it.
 */

/** The folder the CMS motif box uploads to; nothing outside it is used. */
export const MOTIF_FOLDER = '/uploads/motifs/'

export function isMotifPath(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.startsWith(MOTIF_FOLDER) &&
    !value.includes('..') &&
    /\.svg$/i.test(value)
  )
}

/** [minimum, maximum, default] — the ranges of the approved motif proof. */
export const MOTIF_LIMITS = {
  /** Percent opacity of the whole band. The proof's slider ran 0–40. */
  strength: [0, 40, 14],
  /** Percent of the header bar's height a motif is drawn at. */
  scale: [40, 100, 86],
  /** Pixels between motifs. */
  spacing: [0, 64, 24],
} as const

export const MOTIF_MAX_BYTES = 20_000
export const MOTIF_WARN_BYTES = 10_000
/** Width ÷ height. A single animal is about 1–3; a strip of four is about 11. */
export const MOTIF_MIN_RATIO = 0.25
export const MOTIF_MAX_RATIO = 14

export interface MotifCheck {
  ok: boolean
  /** Why it cannot be used. Empty when `ok`. */
  errors: string[]
  /** Usable, but worth knowing. */
  warnings: string[]
  /** From the viewBox (or width/height). 0 when unreadable. */
  width: number
  height: number
  /** width ÷ height; 0 when unreadable. */
  ratio: number
  bytes: number
}

const SHAPES = /<(path|rect|circle|ellipse|polygon|polyline|line)\b/i
const RUNS_CODE = /<(script|foreignObject|iframe|object|embed|handler|listener)\b/i
const RASTER = /<image\b/i
const ANIMATION = /<(animate|animateMotion|animateTransform|set)\b/i
const TEXT = /<(text|tspan|textPath)\b/i
const EVENT_ATTR = /\son[a-z]+\s*=/i
const ENTITY = /<!(DOCTYPE|ENTITY)\b/i

function byteLength(text: string): number {
  return new TextEncoder().encode(text).length
}

function attr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'))
  return match ? (match[2] ?? match[3] ?? '') : null
}

/** "24", "24px", "24.5" → 24.5; "100%" or "2em" → NaN (no intrinsic size). */
function px(value: string | null): number {
  if (!value) return Number.NaN
  const match = value.trim().match(/^(\d+(?:\.\d+)?)(px)?$/i)
  return match ? Number(match[1]) : Number.NaN
}

export function checkMotifSvg(source: string): MotifCheck {
  const errors: string[] = []
  const warnings: string[] = []
  const bytes = byteLength(source)
  const result = (width = 0, height = 0): MotifCheck => ({
    ok: errors.length === 0,
    errors,
    warnings,
    width,
    height,
    ratio: width > 0 && height > 0 ? width / height : 0,
    bytes,
  })

  if (bytes > MOTIF_MAX_BYTES) {
    errors.push(
      `The file is ${Math.round(bytes / 1000)} KB; motifs must be ${MOTIF_MAX_BYTES / 1000} KB or less. Simplify the shapes or export with fewer decimal places.`
    )
  } else if (bytes > MOTIF_WARN_BYTES) {
    warnings.push(
      `The file is ${Math.round(bytes / 1000)} KB. It works, but motifs are usually under ${MOTIF_WARN_BYTES / 1000} KB — it may have hidden layers or too much detail.`
    )
  }

  // Comments can say anything; they are not part of the drawing.
  const code = source.replace(/<!--[\s\S]*?-->/g, '')

  if (ENTITY.test(code)) {
    errors.push('The file declares a DOCTYPE or entities. Re-export it as a plain SVG.')
  }

  const root = code.match(/<svg\b[^>]*>/i)
  if (!root) {
    errors.push('This is not an SVG file. Motifs must be SVG — shapes, not a photo or a PNG.')
    return result()
  }
  const before = code.slice(0, root.index).replace(/<\?xml[^>]*\?>/i, '').trim()
  if (before && !ENTITY.test(before)) {
    errors.push('There is something before the <svg> tag. Re-export it as a plain SVG.')
  }

  if (RUNS_CODE.test(code) || EVENT_ATTR.test(code) || /javascript:/i.test(code)) {
    errors.push(
      'The file contains code (a script, an event handler or embedded content). Motifs must be shapes only — re-export without interactivity.'
    )
  }

  // Every reference must stay inside the file: "#id", never another address.
  const hrefs = [...code.matchAll(/\s(?:xlink:)?href\s*=\s*("([^"]*)"|'([^']*)')/gi)]
  const urls = [...code.matchAll(/url\(\s*['"]?([^'")]*)/gi)]
  const external = [
    ...hrefs.map((m) => (m[2] ?? m[3] ?? '').trim()),
    ...urls.map((m) => (m[1] ?? '').trim()),
  ].some((ref) => ref !== '' && !ref.startsWith('#'))
  if (external || /@import/i.test(code)) {
    errors.push('The file loads something from another file or website. Motifs must be self-contained.')
  }

  if (RASTER.test(code)) {
    errors.push(
      'The file contains a photo or bitmap. Only shapes can be used as a motif — trace the artwork or export it as vector shapes.'
    )
  }
  if (ANIMATION.test(code)) {
    errors.push('The file is animated. Header motifs stay still.')
  }
  if (TEXT.test(code)) {
    errors.push('The file contains live text. Convert text to outlines (shapes) before exporting.')
  }
  if (!SHAPES.test(code)) {
    errors.push('The file has no shapes in it, so nothing would show.')
  }

  // Size: the viewBox, or failing that plain width and height.
  const tag = root[0]
  let width = Number.NaN
  let height = Number.NaN
  const viewBox = attr(tag, 'viewBox')
  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/).map(Number)
    if (parts.length === 4 && parts.every(Number.isFinite)) {
      width = parts[2] as number
      height = parts[3] as number
    }
  }
  if (!(width > 0 && height > 0)) {
    width = px(attr(tag, 'width'))
    height = px(attr(tag, 'height'))
  }
  if (!(width > 0 && height > 0)) {
    errors.push('The file has no size (no viewBox, width or height). Re-export it with a viewBox.')
    return result()
  }

  const ratio = width / height
  if (ratio < MOTIF_MIN_RATIO) {
    errors.push(
      `The file is ${(1 / ratio).toFixed(1)} times taller than it is wide. The header band is a short strip; a motif can be at most 4 times taller than wide.`
    )
  } else if (ratio > MOTIF_MAX_RATIO) {
    errors.push(
      `The file is ${ratio.toFixed(1)} times wider than it is tall. Split a long strip into separate motifs, or into a group, so the band can drop whole motifs to fit.`
    )
  }

  // A rectangle covering the whole drawing is a background, and a background
  // in a mask is a solid block across the header.
  for (const rect of code.matchAll(/<rect\b[^>]*>/gi)) {
    const r = rect[0]
    const w = attr(r, 'width')
    const h = attr(r, 'height')
    const full = (value: string | null, size: number) =>
      value !== null && (value.trim() === '100%' || Math.abs(px(value) - size) < size * 0.02)
    const origin = (value: string | null) => value === null || Math.abs(Number(value)) < 1e-6
    if (full(w, width) && full(h, height) && origin(attr(r, 'x')) && origin(attr(r, 'y'))) {
      errors.push(
        'The file has a solid background (a rectangle the size of the whole drawing). Motifs need a transparent background — delete the background layer before exporting.'
      )
      break
    }
  }

  const seeThrough = [...code.matchAll(/(?:^|[\s;"'])(?:fill-|stroke-)?opacity\s*[:=]\s*["']?\s*([0-9.]+)/gi)]
    .map((m) => Number(m[1]))
    .some((value) => Number.isFinite(value) && value < 1)
  if (seeThrough) {
    warnings.push(
      'Parts of the file are see-through. They will show fainter than the rest; the band\'s overall strength is set in the CMS, not in the file.'
    )
  }

  return result(width, height)
}
