import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import styles from './LocationList.module.css'
import { LiveCardLine } from './LiveCardLine'
import { LiveHours } from './LiveHours'
import { getLocations } from '@/lib/locations'
import type { LocationSlug } from '@/lib/types'

/**
 * The location list — ONE component, used everywhere a list of our places
 * appears (ADR 0009). It was written out by hand five times before this, and
 * none of the copies carried the Truck Stop callout, which is how Home and the
 * Exit 260 page drifted from what was approved. Do not hand-code a sixth.
 *
 * Drawn from docs/proofs/home-review.html:
 *   - a small uppercase label, not a big heading;
 *   - the Truck Stop callout FIRST, navy, with the cedar "Truck Stop →" pill;
 *   - then the Location cards, in site order: a motif mark, the name, the card
 *     line, and "VISIT →". On a phone each card becomes a compact row.
 *
 * "A page never advertises itself" (ADR 0009), scoped to the page's SUBJECT:
 *   - subject = a Location → that card is dropped and the label reads "Our
 *     other locations". The Truck Stop callout STAYS on the Exit 260 page.
 *   - subject = 'truck-stop' → the callout is dropped. The Exit 260 card
 *     stays: it is a different store at the same address.
 *   - no subject (Home, the index, any page) → everything.
 *
 * Every word comes from content/locations/ — nothing here is typed out.
 */
export async function LocationList({
  subject,
  heading,
}: {
  subject?: LocationSlug | 'truck-stop'
  heading?: string
}) {
  const locations = await getLocations()
  const cards = locations.filter((location) => location.id !== subject)
  // Only Exit 260 carries a Truck Stop record today; the list does not assume
  // which Location it is.
  const truckHome = subject === 'truck-stop' ? undefined : locations.find((l) => l.truckStop)
  const truckStop = truckHome?.truckStop

  if (cards.length === 0 && !truckStop) return null

  // Once any card has a photo, the others get a pale panel of the same size
  // with the mark in it, so a row of cards stays one shape (owner, 1 Oct 2026).
  const anyPhoto = cards.some((location) => location.hero?.image)

  const listsItself = subject !== undefined && subject !== 'truck-stop'
  const label = heading || (listsItself ? 'Our other locations' : 'Our locations')

  return (
    <section className={styles.section}>
      {/* A real <h2> so the outline stays h1 → h2, drawn as the small label. */}
      <h2 className={styles.label}>{label}</h2>

      {truckHome && truckStop ? (
        <div className={styles.truckcall}>
          <div className={styles.truckText}>
            <h3 className={styles.truckName}>Truck Stop at {truckHome.navLabel}</h3>
            <p className={styles.truckLine}>
              {truckStop.summary ? <>{truckStop.summary} </> : null}
              <Suspense fallback={truckStop.hours}>
                <LiveHours hours={truckStop.hours} overrides={truckStop.hoursOverrides} />
              </Suspense>
              .
            </p>
          </div>
          {/* The anchor is the hit area and clears ADR 0010's 44px floor; the
              cedar shape inside keeps its drawn size, as the header pill does. */}
          <Link className={styles.truckGo} href="/truck-stop">
            <span className={styles.truckGoIn}>Truck Stop →</span>
          </Link>
        </div>
      ) : null}

      {cards.length > 0 ? (
        <ul className={styles.cards}>
          {cards.map((location) => (
            <li key={location.id}>
              <Link
                className={`${styles.card} ${anyPhoto ? styles.withPhoto : ''}`}
                href={`/locations/${location.id}`}
              >
                {/* The Location's main photo, when one is uploaded (owner,
                    1 Oct 2026): across the top of the card on desktop, a small
                    square on a phone. It stands in for the motif mark. The
                    name beside it says which store it is, so it is decorative
                    to a screen reader. */}
                {location.hero?.image ? (
                  <span className={styles.photo}>
                    <Image
                      src={location.hero.image}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 400px, 44px"
                      className={styles.photoImg}
                    />
                  </span>
                ) : anyPhoto ? (
                  <span className={`${styles.photo} ${styles.photoEmpty}`} aria-hidden="true">
                    {/* TODO: replace with approved Lummi art. */}
                    <span className={styles.motif} />
                  </span>
                ) : (
                  /* TODO: replace with approved Lummi art. One placeholder mark
                     for every card: which motif belongs to which place is an
                     art decision, not an engineering one. */
                  <span className={styles.motif} aria-hidden="true" />
                )}
                <span className={styles.cardText}>
                  <span className={styles.cardName}>{location.navLabel}</span>
                  <span className={styles.cardLine}>
                    <Suspense fallback={location.cardLine}>
                      <LiveCardLine location={location} />
                    </Suspense>
                  </span>
                </span>
                <span className={styles.visit} aria-hidden="true">
                  Visit →
                </span>
                <span className={styles.chev} aria-hidden="true">
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
