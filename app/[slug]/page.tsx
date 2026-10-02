import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import styles from '../page.module.css'
import { FuelPriceBlock, FuelPriceBlockFallback } from '@/components/fuel/FuelPriceBlock'
import { FuelPriceRail } from '@/components/fuel/FuelPriceRail'
import { PromoSlot } from '@/components/promos/PromoRegion'
import { PageBlocks } from '@/components/pages/PageBlocks'
import sectionStyles from '@/components/pages/PageSections.module.css'
import { excerptFromMarkdown, Markdown } from '@/lib/markdown'
import { getPage, getPages } from '@/lib/pages'

/**
 * Every page in the `pages` collection, rendered by ONE route (ADR 0015).
 *
 * `/about`, `/contact` and `/privacy` are not three files in `app/`. They are
 * three documents in `content/pages/`, and a fourth page is added by adding a
 * fourth document — no engineer, no route, no deploy config. That is the whole
 * point of the collection: staff add a page, and the header, footer, waterline,
 * fuel block and back-to-top come from the layout where a page cannot lose
 * them.
 *
 * This segment is dynamic, so it never shadows the static routes above it —
 * Next resolves `/locations`, `/truck-stop`, `/fuel-prices` and `/rewards` to
 * their own directories first. `lib/pages.ts` refuses those slugs anyway, with
 * an error, rather than silently prerendering a path it does not own.
 *
 * There is no `dynamicParams` export: `cacheComponents` rejects that segment
 * config outright, and its default is what we want anyway — a slug that is not
 * in `generateStaticParams` is rendered on demand, `getPage` returns null, and
 * the page calls `notFound()`. So an unknown slug is a 404, not an empty shell,
 * and a page added to the collection between deploys still resolves.
 */

export async function generateStaticParams() {
  const pages = await getPages()
  return pages.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) return {}

  const description = page.seoDescription || excerptFromMarkdown(page.body)

  return {
    title: page.title,
    ...(description ? { description } : {}),
    alternates: { canonical: `/${page.slug}` },
    // `noindex` is read from the document, EXCEPT on /privacy, where
    // `lib/pages.ts` forces it off. That URL is published inside both app store
    // listings and the stores check it resolves; a checkbox in the CMS must not
    // be able to pull it out of the index (ADR 0026).
    ...(page.noindex ? { robots: { index: false, follow: true } } : {}),
  }
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = await getPage(slug)
  if (!page) notFound()

  // "Show the promotions band" lets promos set to "Every page except home" in;
  // a promo that names this page shows either way. On a page carrying the
  // Location contact blocks the region goes after the page's sections, not
  // above them — a guest on /contact came for a phone number (ADR 0018).
  const promosAtEnd = page.blocks.some((block) => block._template === 'locationContacts')
  const promoSlot = (
    <PromoSlot
      target={{ key: `pages/${page.slug}`, allowAllInterior: page.showPromos }}
      rows={page.promoRows}
      position={promosAtEnd ? 'end' : 'top'}
    />
  )

  return (
    <div className={styles.pagegrid}>
      <div className={styles.maincol}>
        <h1>{page.title}</h1>
      </div>

      {/* The same price block every other page carries (ADR 0005, ADR 0006). */}
      <FuelPriceRail>
        <Suspense fallback={<FuelPriceBlockFallback />}>
          <FuelPriceBlock />
        </Suspense>
      </FuelPriceRail>

      {promosAtEnd ? null : promoSlot}

      {/* The page's text and sections run the full page width under the title
          (owner, 2 Oct 2026); the text keeps its own 68ch measure. */}
      <div className={styles.rest}>
        <Markdown source={page.body} className={sectionStyles.prose} />
        <PageBlocks blocks={page.blocks} />
      </div>

      {/* After the sections in the source too, so a phone — one column, in
          source order — puts it in the same place. */}
      {promosAtEnd ? promoSlot : null}
    </div>
  )
}
