import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from './cache-tags'
import { listContentFiles, readContentFile } from './content'
import { splitFrontmatter } from './frontmatter'
import { LOCATION_ORDER, sitePhoto } from './locations'
import { asBlocks, getPages } from './pages'
import { tenantGates } from './tenant-rules'
import type { LocationSlug, PageDoc, TenantDoc, TenantPlacement } from './types'

/**
 * The `tenants` collection — "Other Businesses" in the CMS (ADR 0016).
 *
 * Independent businesses renting space on a Lummi Bay property. They are
 * advertised (settled 17 Sep 2026): each one is a card on the dining page, and
 * the card goes either to a page here, `/dining/{file name}`, or straight to
 * the business's own website — `linkMode`, chosen per business.
 *
 * The gates on hours, logos and outside addresses are in lib/tenant-rules.ts,
 * with tests: a guessed hour sends someone to a closed door, and a trademark
 * without permission is not ours to publish.
 */

export { namesLine, tenantHref } from './tenant-rules'

const PLACEMENTS: readonly TenantPlacement[] = ['inside', 'property', 'lot']

/** Card groups, in the order a guest walks: the store, the lot, the truck. */
export const PLACEMENT_GROUPS: readonly { placement: TenantPlacement; label: string; sub: string }[] = [
  { placement: 'inside', label: 'Inside the store', sub: 'Walk in through the main doors — no second stop.' },
  { placement: 'property', label: 'On the property', sub: 'Their own building — park once and walk across.' },
  { placement: 'lot', label: 'In the lot', sub: 'A truck, not a building — look for it near the fuel lanes.' },
]

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

/** `content/locations/exit-260.mdx` → `exit-260`, if it is one of ours. */
function asLocation(value: unknown): LocationSlug | undefined {
  const id = asString(value).split('/').pop()?.replace(/\.mdx?$/, '')
  return LOCATION_ORDER.find((slug) => slug === id)
}

export function toTenant(slug: string, data: Record<string, unknown>, body: string): TenantDoc | null {
  const name = asString(data.name).trim()
  if (!name) {
    console.error(`[tenants] ${slug}.mdx has no business name; skipped`)
    return null
  }
  const placement = PLACEMENTS.find((p) => p === data.placement) ?? 'property'
  const gates = tenantGates(data)

  return {
    slug,
    name,
    location: asLocation(data.location),
    placement,
    planned: gates.planned,
    summary: asString(data.summary).trim() || undefined,
    hours: gates.hours,
    linkMode: gates.linkMode,
    externalUrl: gates.externalUrl,
    logo: gates.approved ? sitePhoto(data.logo) : undefined,
    photo: gates.approved ? sitePhoto(data.photo) : undefined,
    body,
    blocks: asBlocks(data.blocks),
  }
}

export async function getTenants(): Promise<TenantDoc[]> {
  'use cache'
  cacheTag(CACHE_TAGS.pages)
  cacheLife('max')

  const files = await listContentFiles('tenants')
  const docs: TenantDoc[] = []
  for (const file of files) {
    if (file.startsWith('.')) continue
    const slug = file.replace(/\.mdx?$/, '')
    const raw = await readContentFile(`tenants/${file}`)
    if (!raw) continue
    const { data, body } = splitFrontmatter(raw)
    const doc = toTenant(slug, data, body)
    if (doc) docs.push(doc)
  }
  // Open businesses first, then A–Z: a card that cannot be visited yet
  // should not be the first thing in its row.
  return docs.sort((a, b) => Number(a.planned) - Number(b.planned) || a.name.localeCompare(b.name))
}

export async function getTenant(slug: string): Promise<TenantDoc | undefined> {
  return (await getTenants()).find((tenant) => tenant.slug === slug)
}

/**
 * The dining page: whichever page carries the "Other businesses" section.
 * Found by its content, not its address, so renaming the page in the CMS
 * cannot leave the Locations card pointing at nothing.
 */
export async function getDiningPage(): Promise<PageDoc | undefined> {
  return (await getPages()).find((page) => page.blocks.some((block) => block._template === 'tenantList'))
}
