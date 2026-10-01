import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from './cache-tags'
import { listContentFilesDeep, readContentFile } from './content'
import { splitFrontmatter } from './frontmatter'
import { getInfoPages } from './pages'
import { toPromo, type PromoDoc } from './promos'
import { liveCollection } from './tina-live'

/**
 * Every promo document in content/promos/, parsed and checked — whatever its
 * dates say. Cached: the documents only change on a push. Which of them are
 * LIVE is never cached; the promo region works that out per visitor
 * (ADR 0018), so nothing here depends on the clock.
 *
 * Dropped, with the reason logged:
 *   - a promo the rules in lib/promos.ts refuse (no picture, no headline, an
 *     unreadable date),
 *   - a promo whose offer page does not exist. It would ship a dead card, and
 *     it will happen eventually (ADR 0018, Consequences).
 */
export async function getPromos(): Promise<PromoDoc[]> {
  'use cache'
  cacheTag(CACHE_TAGS.promos)
  cacheTag(CACHE_TAGS.pages)
  cacheLife('max')

  const [files, infoPages] = await Promise.all([listContentFilesDeep('promos'), getInfoPages()])
  const offerPages = new Set(infoPages.map((page) => page.slug))
  const promos: PromoDoc[] = []

  for (const file of files) {
    // The path inside content/promos/, folder included: unique, and what
    // the CMS uses to open the document.
    const id = file.replace(/\.mdx?$/, '')
    const raw = await readContentFile(`promos/${file}`)
    if (!raw) continue
    const result = toPromo(id, splitFrontmatter(raw).data)
    if ('refused' in result) {
      console.error(`[promos] ${file} is not shown: ${result.refused}`)
      continue
    }
    if (!offerPages.has(result.promo.link)) {
      console.error(`[promos] ${file} links to offer page "${result.promo.link}", which does not exist; not shown`)
      continue
    }
    promos.push(result.promo)
  }
  return promos
}

/**
 * The same, read live from the CMS (lib/tina-live.ts), so a promotion saved a
 * moment ago — switched on, re-dated, re-ordered — shows within seconds. The
 * built files are the fallback. An offer page still has to be built before a
 * promotion can link to it: offer pages are static pages, so a promotion
 * pointing at one that is not built yet waits for the deploy, as it should.
 */
export async function getLivePromos(): Promise<{ promos: PromoDoc[]; source: 'live' | 'build' }> {
  const docs = await liveCollection('promos')
  if (!docs) return { promos: await getPromos(), source: 'build' }

  const offerPages = new Set((await getInfoPages()).map((page) => page.slug))
  const promos: PromoDoc[] = []
  for (const doc of docs) {
    const result = toPromo(doc.relativePath.replace(/\.mdx?$/, ''), doc.values)
    if ('refused' in result) {
      console.error(`[promos] ${doc.relativePath} is not shown: ${result.refused}`)
      continue
    }
    if (!offerPages.has(result.promo.link)) continue
    promos.push(result.promo)
  }
  return { promos, source: 'live' }
}
