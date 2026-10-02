import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import styles from '../../page.module.css'
import { FuelPriceBlock, FuelPriceBlockFallback } from '@/components/fuel/FuelPriceBlock'
import { FuelPriceRail } from '@/components/fuel/FuelPriceRail'
import { PageBlocks } from '@/components/pages/PageBlocks'
import sectionStyles from '@/components/pages/PageSections.module.css'
import tenantStyles from '@/components/tenants/TenantCards.module.css'
import { getLocation } from '@/lib/locations'
import { excerptFromMarkdown, Markdown } from '@/lib/markdown'
import { getDiningPage, getTenant, getTenants, placementLabel } from '@/lib/tenants'

/**
 * One business's page — a document in Other Businesses whose card is set to
 * "A page here on our site" (ADR 0016; docs/proofs/tenant-page-template.html).
 *
 * The address is `/dining/{file name}`. The page index itself is not here: it
 * is an ordinary page document carrying the "Other businesses" section, so its
 * title and words are edited under Pages like any other.
 *
 * The line saying the business is independently run is drawn by this route,
 * not typed: on a page in our colours with someone else's name on it, it is
 * not available to forget.
 */

type Params = Promise<{ slug: string }>

/** Cache Components rejects an empty list; a dot-name can never be a file. */
export async function generateStaticParams() {
  const tenants = await getTenants()
  return tenants.length ? tenants.map((tenant) => ({ slug: tenant.slug })) : [{ slug: '.none' }]
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const tenant = await getTenant((await params).slug)
  if (!tenant) return {}
  const description = tenant.summary || excerptFromMarkdown(tenant.body)
  return {
    title: tenant.name,
    ...(description ? { description } : {}),
    alternates: { canonical: `/dining/${tenant.slug}` },
  }
}

export default async function TenantPage({ params }: { params: Params }) {
  const tenant = await getTenant((await params).slug)
  if (!tenant) notFound()
  const [location, dining] = await Promise.all([
    tenant.location ? getLocation(tenant.location) : undefined,
    getDiningPage(),
  ])

  return (
    <div className={styles.pagegrid}>
      <div className={styles.maincol}>
        {dining ? (
          <Link className={tenantStyles.backlink} href={`/${dining.slug}`}>
            ← {dining.navLabel || dining.title}
          </Link>
        ) : null}
        {tenant.photo ? (
          <figure className={tenantStyles.hero}>
            <Image src={tenant.photo} alt="" fill sizes="(min-width: 900px) 720px, 100vw" priority />
          </figure>
        ) : null}
        <h1>{tenant.name}</h1>
        <div className={tenantStyles.chips}>
          <span className={tenantStyles.chip}>{placementLabel(tenant.placement, location?.navLabel)}</span>
          {tenant.planned ? <span className={tenantStyles.chip}>Opening soon</span> : null}
        </div>
      </div>

      <FuelPriceRail>
        <Suspense fallback={<FuelPriceBlockFallback />}>
          <FuelPriceBlock />
        </Suspense>
      </FuelPriceRail>

      <div className={styles.rest}>
        {tenant.summary ? <p className={sectionStyles.prose}>{tenant.summary}</p> : null}
        <Markdown source={tenant.body} className={sectionStyles.prose} />
        {tenant.hours ? (
          <div className={tenantStyles.hourscard}>
            <h2>Hours</h2>
            <p>{tenant.hours}</p>
            <p className={tenantStyles.hoursNote}>Hours provided by the business.</p>
          </div>
        ) : null}
        <PageBlocks blocks={tenant.blocks} />
        <div className={tenantStyles.actions}>
          {tenant.externalUrl ? (
            <a className={sectionStyles.miniPrimary} href={tenant.externalUrl} target="_blank" rel="noopener noreferrer">
              Visit their website ↗<span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          ) : null}
          {location ? (
            <Link className={sectionStyles.miniGhost} href={`/locations/${location.id}`}>
              Find {location.navLabel}
            </Link>
          ) : null}
        </div>
        <p className={tenantStyles.disclosure}>
          {tenant.name} is independently owned and operated. It is not part of Lummi Bay Market, and
          its hours are its own.
        </p>
      </div>
    </div>
  )
}
