import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import styles from '../page.module.css'
import { FuelPriceBlock, FuelPriceBlockFallback } from '@/components/fuel/FuelPriceBlock'
import { FuelPriceRail } from '@/components/fuel/FuelPriceRail'
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

  return (
    <div className={styles.pagegrid}>
      <div className={styles.maincol}>
        <h1>{page.title}</h1>
        <Markdown source={page.body} className={sectionStyles.prose} />
      </div>

      {/* The same price block every other page carries. The rail is not sticky
          — ADR 0006 records why it must never be. */}
      <FuelPriceRail>
        <Suspense fallback={<FuelPriceBlockFallback />}>
          <FuelPriceBlock />
        </Suspense>
      </FuelPriceRail>

      <div className={styles.rest}>
        <PageBlocks blocks={page.blocks} />
      </div>
    </div>
  )
}
