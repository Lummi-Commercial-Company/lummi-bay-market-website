import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { LocationContacts } from './LocationContacts'
import { LocationsMap } from './LocationsMap'
import styles from './PageSections.module.css'
import { LiveCardLine } from '@/components/locations/LiveCardLine'
import { LiveHours } from '@/components/locations/LiveHours'
import { getLocations } from '@/lib/locations'
import { Markdown } from '@/lib/markdown'
import type { HoursOverride, PageBlock } from '@/lib/types'

/**
 * The block vocabulary a page document can be built from (ADR 0015).
 *
 * A page is a document, and its "extra sections" are rows in a list an editor
 * picks from — never arbitrary HTML, which is how a page ends up without a
 * header or with a fuel price written into it by hand. Every block that shows
 * Location data reads it from the Location documents.
 */
export function PageBlocks({ blocks }: { blocks: PageBlock[] }) {
  if (blocks.length === 0) return null
  return (
    <>
      {blocks.map((block, index) => (
        <PageBlockRow key={`${block._template}-${index}`} block={block} />
      ))}
    </>
  )
}

function PageBlockRow({ block }: { block: PageBlock }) {
  switch (block._template) {
    case 'richText':
      return block.body ? <Markdown source={block.body} className={styles.prose} /> : null

    case 'callout':
      return (
        <aside className={styles.callout}>
          {block.heading ? <b>{block.heading}</b> : null}{' '}
          {block.text ? <Markdown source={block.text} /> : null}
        </aside>
      )

    case 'imageBanner':
      return (
        <figure className={styles.banner}>
          <Image
            src={block.image ?? ''}
            alt={block.alt ?? ''}
            width={1200}
            height={600}
            sizes="(min-width: 900px) 760px, 100vw"
            // Below the fold by definition: a banner is never the first thing
            // on a page, the page title is.
            loading="lazy"
          />
          {block.caption ? <figcaption>{block.caption}</figcaption> : null}
        </figure>
      )

    case 'locationList':
      return <LocationCards heading={block.heading} />

    case 'locationContacts':
      return <LocationContacts heading={block.heading} />

    case 'locationsMap':
      return <LocationsMap heading={block.heading} />

    case 'hoursTable':
      return <HoursTable heading={block.heading} includeTruckStop={block.includeTruckStop} />

    case 'ctaRow':
      return block.buttons.length > 0 ? (
        <div className={styles.ctarow}>
          {block.buttons.map((button) => (
            <Link key={button.href} className={styles.miniPrimary} href={button.href}>
              {button.label}
            </Link>
          ))}
        </div>
      ) : null

    case 'faq':
      return block.items.length > 0 ? (
        <section className={styles.faq}>
          {block.heading ? <h2 className={styles.sectionHeading}>{block.heading}</h2> : null}
          <dl>
            {block.items.map((item) => (
              <div key={item.question}>
                <dt>{item.question}</dt>
                <dd>{item.answer ? <Markdown source={item.answer} /> : null}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null
  }
}

/** The standard Location card grid — the same one the Location pages use. */
async function LocationCards({ heading }: { heading?: string }) {
  const locations = await getLocations()
  if (locations.length === 0) return null

  return (
    <section>
      <h2 className={styles.sectionHeading}>{heading || 'Our locations'}</h2>
      <ul className={styles.cards}>
        {locations.map((location) => (
          <li key={location.id}>
            <Link className={styles.card} href={`/locations/${location.id}`}>
              <p className={styles.cardName}>{location.navLabel}</p>
              <p className={styles.cardLine}>
                <Suspense fallback={location.cardLine}>
                  <LiveCardLine location={location} />
                </Suspense>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

/**
 * Opening hours for every place, in one table. The Truck Stop keeps its own
 * hours, separate from the Exit 260 store, so it is an extra row rather than a
 * footnote — and it is opt-in, because a page about the stores should not have
 * to explain the diesel lanes.
 */
/**
 * One row of the hours table.
 *
 * `key` is a plain string, deliberately: the Truck Stop row's key is synthesised
 * (`exit-260-truck-stop`) and is a React key, nothing more. Typing it as a
 * `LocationSlug` would be a lie that lets it be handed to something that looks a
 * Location up by slug — and there is no Location with that id.
 */
interface HoursRow {
  key: string
  label: string
  hours: string
  overrides?: HoursOverride[]
}

async function HoursTable({
  heading,
  includeTruckStop,
}: {
  heading?: string
  includeTruckStop?: boolean
}) {
  const locations = await getLocations()
  if (locations.length === 0) return null

  const rows = locations.flatMap<HoursRow>((location) => {
    const own: HoursRow[] = [
      {
        key: location.id,
        label: location.name,
        hours: location.hours,
        overrides: location.hoursOverrides,
      },
    ]
    if (includeTruckStop && location.truckStop) {
      own.push({
        key: `${location.id}-truck-stop`,
        label: `The Truck Stop at ${location.navLabel}`,
        hours: location.truckStop.hours,
        overrides: location.truckStop.hoursOverrides,
      })
    }
    return own
  })

  return (
    <section>
      <h2 className={styles.sectionHeading}>{heading || 'Opening hours'}</h2>
      <table className={styles.hoursTable}>
        <caption className="visually-hidden">Opening hours by location</caption>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <th scope="row">{row.label}</th>
              <td>
                <Suspense fallback={row.hours}>
                  <LiveHours hours={row.hours} overrides={row.overrides} showReason />
                </Suspense>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
