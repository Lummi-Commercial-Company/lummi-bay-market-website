import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from './cache-tags'
import { readContentJson } from './content'
import { checkMotifSvg, isMotifPath, MOTIF_FOLDER, MOTIF_LIMITS } from './motif-check'

export { isMotifPath, MOTIF_FOLDER, MOTIF_LIMITS }
import { getSettings } from './settings'

/**
 * The header motif band's data (ADR 0021, amended 30 Sep 2026).
 *
 * Site settings → Header motifs says whether the band shows, and holds the
 * motif groups; the live one is marked "Use this group in the header". A group
 * is an ordered list of motif
 * files plus its own strength, scale, spacing and ink. Every file is checked
 * (lib/motif-check) before it is drawn; one that fails is left out and the
 * build log says why, so a bad upload costs one motif, never the header.
 */

export type MotifInk = 'bone' | 'teal' | 'white'

export interface HeaderMotifBand {
  ink: MotifInk
  strength: number
  scale: number
  spacing: number
  repeat: boolean
  /** In order. `ratio` is width ÷ height, from the file's own viewBox. */
  items: { src: string; ratio: number }[]
}

function clamp(value: unknown, [min, max, fallback]: readonly [number, number, number]): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
}

/** Settings → the group's file name: `content/motif-groups/placeholder.json` → `placeholder.json`. */
function groupFile(ref: unknown): string | null {
  if (typeof ref !== 'string') return null
  const name = ref.split('/').pop() ?? ''
  return /^[\w.-]+\.json$/.test(name) ? name : null
}

async function readMotif(src: string): Promise<{ src: string; ratio: number } | null> {
  let source: string
  try {
    source = await readFile(path.join(process.cwd(), 'public', src), 'utf8')
  } catch {
    console.error(`[motifs] ${src} is not in the motif folder any more; left out of the header.`)
    return null
  }
  const check = checkMotifSvg(source)
  if (!check.ok) {
    console.error(`[motifs] ${src} is left out of the header: ${check.errors.join(' ')}`)
    return null
  }
  return { src, ratio: check.ratio }
}

export async function getHeaderMotifs(): Promise<HeaderMotifBand | null> {
  'use cache'
  cacheTag(CACHE_TAGS.settings)
  cacheTag(CACHE_TAGS.motifs)
  cacheLife('max')

  const { headerMotifs } = await getSettings()
  if (!headerMotifs.show) return null

  // The group in use: the first in Site settings with "Use this group" on.
  // A settings file from before the groups moved there points at a file in
  // content/motif-groups/ instead, and that is still honoured.
  let group: Record<string, unknown> | null = headerMotifs.groups.find((g) => g.live === true) ?? null
  if (!group && headerMotifs.group) {
    const file = groupFile(headerMotifs.group)
    group = file ? await readContentJson<Record<string, unknown>>(`motif-groups/${file}`) : null
  }
  if (!group) {
    console.error(
      headerMotifs.groups.length
        ? '[motifs] Header motifs are switched on, but no group has "Use this group in the header" on. No header motifs are shown.'
        : '[motifs] Header motifs are switched on, but there are no motif groups. No header motifs are shown.'
    )
    return null
  }

  const files = Array.isArray(group.motifs)
    ? group.motifs.map((row) => (row as Record<string, unknown> | null)?.file ?? row)
    : []
  const items: HeaderMotifBand['items'] = []
  for (const src of files) {
    if (!isMotifPath(src)) {
      if (src) console.error(`[motifs] ${String(src)} is not in ${MOTIF_FOLDER}; left out of the header.`)
      continue
    }
    const item = await readMotif(src)
    if (item) items.push(item)
  }
  if (items.length === 0) return null

  const ink: MotifInk = group.ink === 'teal' || group.ink === 'white' ? group.ink : 'bone'
  return {
    ink,
    strength: clamp(group.strength, MOTIF_LIMITS.strength),
    scale: clamp(group.scale, MOTIF_LIMITS.scale),
    spacing: clamp(group.spacing, MOTIF_LIMITS.spacing),
    repeat: group.repeat !== false,
    items,
  }
}
