import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense } from 'react'
import styles from '../../page.module.css'
import { FuelPriceBlock, FuelPriceBlockFallback } from '@/components/fuel/FuelPriceBlock'
import { FuelPriceRail } from '@/components/fuel/FuelPriceRail'
import { PageBlocks } from '@/components/pages/PageBlocks'
import sectionStyles from '@/components/pages/PageSections.module.css'
import infoStyles from '@/components/promos/InfoPage.module.css'
import { PromoSlot } from '@/components/promos/PromoRegion'
import { excerptFromMarkdown, Markdown } from '@/lib/markdown'
import { getInfoPage, getInfoPages } from '@/lib/pages'
import { getPromos } from '@/lib/promo-data'
import { formatUsDay } from '@/lib/pacific-time'
import { infoPageState, pacificStamp } from '@/lib/promos'

/**
 * An offer page — what a promo links to (ADR 0015, ADR 0018 §3).
 *
 * Whether it is live is worked out per visitor from the promos that point at
 * it, so this whole route renders per request — there is no build-time answer
 * to "is the long weekend over yet". Three states:
 *
 *   live      the page as written, indexed and in the sitemap.
 *   upcoming  a promo pointing here has not started. Nothing of the offer is
 *             shown, not even its title: the page could otherwise be read
 *             early by anyone who guessed or was sent the address.
 *   ended     no promo pointing here is running. The address KEEPS WORKING —
 *             a shared post, a printed QR code or a bookmark must not become
 *             a 404, which reads as a broken site — but the page says the
 *             offer has ended, drops out of the sitemap and is `noindex`.
 *             Reactivating the promo brings it straight back.
 */

type Params = Promise<{ slug: string }>

/**
 * The addresses are known at build time even though the states are not: the
 * shell (header, footer, rail) prerenders per offer page, and the state
 * streams in per request. An offer page added between deploys still renders
 * on demand.
 *
 * With Cache Components an empty list is a build error, and a site with no
 * offer pages yet is the normal case — so an address that can never be a
 * file name (a leading dot) stands in, and resolves to a 404 like any other
 * unknown address.
 */
export async function generateStaticParams() {
  const pages = await getInfoPages()
  return pages.length ? pages.map((page) => ({ slug: page.slug })) : [{ slug: '.none' }]
}

/** The document — cached, and known before anything reads the clock. */
async function pageFor(params: Params) {
  const { slug } = await params
  return getInfoPage(slug)
}

/** Its state right now. Per request (ADR 0018). */
async function resolve(params: Params) {
  const page = await pageFor(params)
  if (!page) return null
  await connection()
  return { page, info: infoPageState(page.slug, await getPromos(), pacificStamp(new Date())) }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const found = await resolve(params)
  if (!found) return {}
  const { page, info } = found
  const canonical = { alternates: { canonical: `/info/${page.slug}` } }

  if (info.state === 'upcoming') {
    return { title: 'Coming soon', robots: { index: false, follow: false }, ...canonical }
  }
  const description = page.seoDescription || excerptFromMarkdown(page.body)
  return {
    title: page.title,
    ...(description ? { description } : {}),
    ...canonical,
    ...(info.state === 'ended' ? { robots: { index: false, follow: true } } : {}),
  }
}

export default async function InfoPage({ params }: { params: Params }) {
  // Outside the boundary, before anything streams: an unknown address is a
  // real 404, not a 200 with "not found" written in it.
  if (!(await pageFor(params))) notFound()
  return (
    <Suspense fallback={null}>
      <InfoPageBody params={params} />
    </Suspense>
  )
}

async function InfoPageBody({ params }: { params: Params }) {
  const found = await resolve(params)
  if (!found) notFound()
  const { page, info } = found

  return (
    <div className={styles.pagegrid}>
      <div className={styles.maincol}>
        {info.state === 'upcoming' ? (
          <>
            <h1>Coming soon</h1>
            <div className={infoStyles.note}>
              <b>This offer hasn&rsquo;t started yet.</b>
              <span>
                It starts on {formatUsDay(info.startsOn)}. Current
                prices are at the top of every page.
              </span>
            </div>
          </>
        ) : (
          <>
            {info.lead?.eyebrow ? <p className={infoStyles.eyebrow}>{info.lead.eyebrow}</p> : null}
            <h1>{page.title}</h1>
            {info.state === 'ended' ? (
              <div className={infoStyles.note}>
                <b>This offer has ended.</b>
                <span>
                  Current prices are at the top of every page.{' '}
                  <Link href="/">Back to the home page</Link>
                </span>
              </div>
            ) : null}
            {/* The offer's picture stays in the title column, beside the price
                block, at the 720 x 200 the designer spec draws it; the text
                below runs the full page width (owner, 2 Oct 2026). */}
            {info.lead ? (
              <figure
                className={`${infoStyles.hero} ${info.state === 'ended' ? infoStyles.faded : ''}`}
              >
                <Image
                  src={info.lead.image}
                  alt={info.lead.alt}
                  fill
                  sizes="(min-width: 900px) 720px, 100vw"
                  priority
                />
              </figure>
            ) : null}
          </>
        )}
      </div>

      <FuelPriceRail>
        <Suspense fallback={<FuelPriceBlockFallback />}>
          <FuelPriceBlock />
        </Suspense>
      </FuelPriceRail>

      {/* What else is running — never this offer itself. On an ended page it
          is the "what's on now" the guest actually wants. */}
      <PromoSlot target={{ key: `info-pages/${page.slug}`, excludeInfo: page.slug }} />

      {info.state === 'upcoming' ? null : (
        <div className={styles.rest}>
          <Markdown source={page.body} className={sectionStyles.prose} />
          {/* Buttons and sections invite action on an offer that is running;
              once it has ended they would be the page contradicting itself. */}
          {info.state === 'live' ? <PageBlocks blocks={page.blocks} /> : null}
        </div>
      )}
    </div>
  )
}
