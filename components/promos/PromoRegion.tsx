import Image from 'next/image'
import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import styles from './PromoRegion.module.css'
import { getPromos } from '@/lib/promo-data'
import {
  fillRows,
  livePromosFor,
  pacificStamp,
  type PromoDoc,
  type PromoTarget,
  type RowLayout,
} from '@/lib/promos'
import { getSettings } from '@/lib/settings'

/**
 * The promo region (ADR 0007, ADR 0018, ADR 0023).
 *
 * A dynamic island on a prerendered page: the shell is static on the CDN and
 * only this region renders per visitor, so a promo that ends at noon is gone
 * at noon with nothing scheduled — the comparison happens on every request.
 * Crawlers are served the rendered page, so an ended offer is never indexed.
 *
 * With nothing live it renders nothing at all: no region, no gap, no empty
 * grid. It is a direct child of the page grid, full page width, in the row
 * under the title and price block — `.maincol` is the narrow column and is the
 * wrong container, which ADR 0018 records being got wrong four times.
 *
 * The class is `promo`, never `ad`, `advert`, `banner` or `sponsored`: those
 * are on every blocker's filter list, and a first-party offer named that way
 * silently disappears for a large share of guests (ADR 0007).
 */

export function PromoSlot(props: PromoRegionProps) {
  return (
    // No fallback: until the region resolves there is nothing to reserve,
    // and a placeholder box on a page with no live promo would be a hole.
    <Suspense fallback={null}>
      <PromoRegion {...props} />
    </Suspense>
  )
}

interface PromoRegionProps {
  target: PromoTarget
  /** This page's own rows. Empty or absent: the rows in Site settings. */
  rows?: RowLayout[]
  /**
   * `top` — the row under the page title, which is almost every page.
   * `end` — after the page's own sections. For /contact, where the guest came
   * for a phone number and anything above the Location blocks delays it
   * (ADR 0018, Addendum).
   */
  position?: 'top' | 'end'
}

async function PromoRegion({ target, rows, position = 'top' }: PromoRegionProps) {
  await connection()
  const [promos, settings] = await Promise.all([getPromos(), getSettings()])
  const live = livePromosFor(promos, target, pacificStamp(new Date()))
  const filled = fillRows(rows?.length ? rows : settings.promoRows, live)
  if (filled.length === 0) return null

  return (
    <section
      className={`${styles.region} ${position === 'end' ? styles.atEnd : styles.atTop}`}
      data-promos={position}
      aria-label="Current offers"
    >
      {filled.map((row, rowIndex) => {
        // In a mixed row (lead + two, wide + narrow) the widest slot sets the
        // row's height and the others fill it, so the row is one even band
        // (owner, 30 Sep 2026). A row of equal slots is untouched.
        const widest = Math.max(...row.spans)
        const mixed = row.spans.some((span) => span !== widest)
        const lead = row.spans.indexOf(widest)
        return (
        <div className={styles.row} key={row.promos.map((promo) => promo.id).join('|')}>
          {row.promos.map((promo, index) => (
            <PromoCard
              key={promo.id}
              promo={promo}
              span={row.spans[index] ?? 12}
              fill={mixed && index !== lead}
              // The first promo is almost certainly the page's largest
              // contentful paint (ADR 0007): fetch it first.
              eager={position === 'top' && rowIndex === 0 && index === 0}
            />
          ))}
        </div>
        )
      })}
    </section>
  )
}

/** Width of the region on desktop: the content width less the page gutters. */
const REGION_MAX_PX = 1168

function PromoCard({
  promo,
  span,
  eager,
  fill,
}: {
  promo: PromoDoc
  span: number
  eager: boolean
  fill: boolean
}) {
  return (
    <Link
      href={`/info/${promo.link}`}
      className={`${styles.promo} ${styles[`s${span}`] ?? ''} ${fill ? styles.fill : ''}`}
      style={{ '--span': span } as React.CSSProperties}
    >
      {/* One 2400 × 1350 master, cropped top and bottom by every slot; the
          subject lives in the centre 2400 × 480 strip (ADR 0023). */}
      <Image
        className={styles.img}
        src={promo.image}
        alt={promo.alt}
        fill
        sizes={`(min-width: 900px) ${Math.round((span / 12) * REGION_MAX_PX)}px, 100vw`}
        {...(eager ? { priority: true } : { loading: 'lazy' as const })}
      />
      {/* Three text fields, everywhere — live text, not baked into the art,
          so it is searchable, resizes, and staff can change it (ADR 0023). */}
      <span className={styles.tx}>
        {promo.eyebrow ? <span className={styles.pe}>{promo.eyebrow}</span> : null}
        <span className={styles.hd}>{promo.headline}</span>
        <span className={styles.cta}>{promo.cta}</span>
      </span>
    </Link>
  )
}
