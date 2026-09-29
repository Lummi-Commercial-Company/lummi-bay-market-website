import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from './cache-tags'
import { listContentFiles, readContentFile } from './content'
import { splitFrontmatter } from './frontmatter'
import type { MainPageDoc, PageBlock, PageCtaButton, PageDoc, PageFaqItem } from './types'

/**
 * The `pages` collection (ADR 0015).
 *
 * Pages are documents, not routes. `app/[slug]/page.tsx` renders every document
 * in `content/pages/`, so a fourth page is added by adding a file and nothing
 * else — no engineer, no deploy config, and no way to lose the header, footer,
 * waterline, fuel block or back-to-top, which all come from the layout.
 *
 * THE FILE NAME IS THE WEB ADDRESS. There is no `slug` field in the schema and
 * there must not be one: routing has always been by file name, so a `slug` text
 * box would be an editable field that does not move the page, or worse,
 * disagrees with the real address silently. `/privacy` is published inside two
 * app store listings and must never move (ADR 0026).
 */

/**
 * Slugs `app/[slug]/` must never claim.
 *
 * Next.js resolves a static segment ahead of a dynamic one, so a page named
 * `locations.mdx` would not override `/locations` — it would simply never
 * render, while `generateStaticParams` still asked the build to prerender a
 * path another route owns. A page nobody can reach is the failure that looks
 * like success, so these are dropped with a loud console error instead.
 */
const RESERVED_SLUGS = new Set([
  'locations',
  'truck-stop',
  'fuel-prices',
  'rewards',
  'api',
  'sitemap.xml',
  'robots.txt',
])

/** `/privacy` is a permanent URL in two app store listings (ADR 0026). */
export const PRIVACY_SLUG = 'privacy'

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function asCtaButtons(value: unknown): PageCtaButton[] {
  if (!Array.isArray(value)) return []
  const out: PageCtaButton[] = []
  for (const entry of value) {
    const record = asRecord(entry)
    if (!record) continue
    const label = asString(record.label).trim()
    const href = asString(record.href).trim()
    // No destination, no button. The site never renders href="#".
    if (!label || !href) continue
    out.push({ label, href })
  }
  return out
}

function asFaqItems(value: unknown): PageFaqItem[] {
  if (!Array.isArray(value)) return []
  const out: PageFaqItem[] = []
  for (const entry of value) {
    const record = asRecord(entry)
    if (!record) continue
    const question = asString(record.question).trim()
    if (!question) continue
    out.push({ question, answer: asString(record.answer) || undefined })
  }
  return out
}

/**
 * One frontmatter entry to a typed block. An unknown `_template` returns null
 * and is dropped: a block the renderer does not know is a block that would
 * otherwise render as nothing while still occupying a gap in the page.
 */
function asBlock(value: unknown): PageBlock | null {
  const record = asRecord(value)
  if (!record) return null
  const template = asString(record._template)

  switch (template) {
    case 'richText':
      return { _template: 'richText', body: asString(record.body) || undefined }
    case 'imageBanner': {
      const image = asString(record.image).trim()
      // An image banner with no image is not a banner; an image with no alt
      // text fails WCAG 1.1.1 and the schema marks both required.
      if (!image) return null
      return {
        _template: 'imageBanner',
        image,
        alt: asString(record.alt),
        caption: asString(record.caption) || undefined,
      }
    }
    case 'hoursTable':
      return {
        _template: 'hoursTable',
        heading: asString(record.heading) || undefined,
        includeTruckStop: record.includeTruckStop === true,
      }
    case 'locationList':
      return { _template: 'locationList', heading: asString(record.heading) || undefined }
    case 'locationContacts':
      return { _template: 'locationContacts', heading: asString(record.heading) || undefined }
    case 'locationsMap':
      return { _template: 'locationsMap', heading: asString(record.heading) || undefined }
    case 'callout':
      return {
        _template: 'callout',
        heading: asString(record.heading) || undefined,
        text: asString(record.text) || undefined,
      }
    case 'ctaRow':
      return { _template: 'ctaRow', buttons: asCtaButtons(record.buttons) }
    case 'faq':
      return {
        _template: 'faq',
        heading: asString(record.heading) || undefined,
        items: asFaqItems(record.items),
      }
    default:
      if (template) console.error(`[pages] unknown block template "${template}"`)
      return null
  }
}

function asBlocks(value: unknown): PageBlock[] {
  const blocks: PageBlock[] = []
  if (Array.isArray(value)) {
    for (const entry of value) {
      const block = asBlock(entry)
      if (block) blocks.push(block)
    }
  }
  return blocks
}

function toPage(slug: string, data: Record<string, unknown>, body: string): PageDoc | null {
  const title = asString(data.title).trim()
  // A document with no title has no <h1> and no <title>. Rather than render a
  // headless page, it is skipped — the CMS marks the field required.
  if (!title) {
    console.error(`[pages] ${slug}.mdx has no title; skipped`)
    return null
  }

  const blocks = asBlocks(data.blocks)

  return {
    slug,
    title,
    navLabel: asString(data.navLabel) || undefined,
    seoDescription: asString(data.seoDescription) || undefined,
    // `/privacy` is never hidden from search, whatever the document says. The
    // URL is published in two app store listings and both stores check that it
    // resolves; a checkbox in the CMS must not be able to take it out of the
    // index (ADR 0026, docs/privacy-policy-notes.md).
    noindex: slug === PRIVACY_SLUG ? false : data.noindex === true,
    noBackdrop: data.noBackdrop === true,
    showPromos: data.showPromos === true,
    body,
    blocks,
  }
}

export async function getPages(): Promise<PageDoc[]> {
  'use cache'
  cacheTag(CACHE_TAGS.pages)
  cacheLife('max')

  const files = await listContentFiles('pages')
  const docs: PageDoc[] = []

  for (const file of files) {
    const slug = file.replace(/\.mdx?$/, '')
    if (RESERVED_SLUGS.has(slug)) {
      console.error(
        `[pages] content/pages/${file} uses the reserved address "/${slug}", which another route already owns. It will not render. Rename the file.`
      )
      continue
    }
    const raw = await readContentFile(`pages/${file}`)
    if (!raw) continue
    const { data, body } = splitFrontmatter(raw)
    const doc = toPage(slug, data, body)
    if (doc) docs.push(doc)
  }

  return docs.sort((a, b) => a.slug.localeCompare(b.slug))
}

export async function getPage(slug: string): Promise<PageDoc | undefined> {
  return (await getPages()).find((page) => page.slug === slug)
}

/* ===========================================================================
   Home page versions — the `mainPages` collection (ADR 0015, ADR 0018)
   =========================================================================== */

function toMainPage(slug: string, data: Record<string, unknown>, body: string): MainPageDoc | null {
  const headline = asString(data.headline).trim()
  // The headline is the home page's <h1>. Without one the page has no heading
  // at all, so the version is skipped and the next one is used instead.
  if (!headline) {
    console.error(`[main-pages] ${slug}.mdx has no headline; skipped`)
    return null
  }
  return {
    slug,
    title: asString(data.title).trim() || slug,
    headline,
    intro: asString(data.intro).trim() || undefined,
    seoDescription: asString(data.seoDescription) || undefined,
    noBackdrop: data.noBackdrop === true,
    body,
    blocks: asBlocks(data.blocks),
  }
}

export async function getMainPages(): Promise<MainPageDoc[]> {
  'use cache'
  // Same tag as `pages`: publishing a home page edit revalidates like any page.
  cacheTag(CACHE_TAGS.pages)
  cacheLife('max')

  const files = await listContentFiles('main-pages')
  const docs: MainPageDoc[] = []
  for (const file of files) {
    const slug = file.replace(/\.mdx?$/, '')
    const raw = await readContentFile(`main-pages/${file}`)
    if (!raw) continue
    const { data, body } = splitFrontmatter(raw)
    const doc = toMainPage(slug, data, body)
    if (doc) docs.push(doc)
  }
  return docs.sort((a, b) => a.slug.localeCompare(b.slug))
}

/**
 * The home page visitors see: the version Settings points at.
 *
 * A reference field stores a path (`content/main-pages/home.mdx`), so the
 * match is on the file name. If the setting is empty or points at a version
 * that no longer exists, the first version is used and the fault is logged —
 * a bad setting must never leave the site without a home page.
 */
export async function getLiveMainPage(liveMainPage: string | undefined): Promise<MainPageDoc | undefined> {
  const versions = await getMainPages()
  if (versions.length === 0) return undefined

  const wanted = liveMainPage?.split('/').pop()?.replace(/\.mdx?$/, '')
  const live = wanted ? versions.find((doc) => doc.slug === wanted) : undefined
  if (!live) {
    console.error(
      wanted
        ? `[main-pages] Settings points at "${wanted}", which does not exist. Showing "${versions[0]?.slug}" instead.`
        : `[main-pages] No live home page is chosen in Settings. Showing "${versions[0]?.slug}".`
    )
  }
  return live ?? versions[0]
}
