import { Suspense } from 'react'
import styles from './PageSections.module.css'
import { LiveHours } from '@/components/locations/LiveHours'
import { getLocations } from '@/lib/locations'
import { directionsUrl } from '@/lib/map'
import type { HoursOverride, LocationDoc } from '@/lib/types'

/**
 * Every place a guest can phone or walk into, with its address, hours, phone
 * and one-line synopsis (ADR 0015). Built from the Location documents — there
 * is not a phone number or an opening time written into this file.
 *
 * FOUR entries from THREE Locations. The Truck Stop is a separate fuel station
 * sharing the Exit 260 property, with its own phone, its own hours and its own
 * hours overrides — a driver ringing the store about showers is the thing this
 * layout exists to prevent. It shares Exit 260's address, which is also why the
 * map carries three pins and not four (ADR 0019).
 *
 * There is no contact form here or anywhere else on the site.
 */

interface ContactEntry {
  key: string
  name: string
  summary?: string
  amenities: string[]
  address: string
  city: string
  state: string
  zip: string
  phone: string
  /** "C-Store", "Truck Stop" or "Phone" — what this number actually reaches. */
  phoneLabel: string
  hours: string
  hoursOverrides?: HoursOverride[]
}

function entriesFor(location: LocationDoc): ContactEntry[] {
  const { address, city, state, zip } = location
  const entries: ContactEntry[] = [
    {
      key: location.id,
      name: location.name,
      summary: location.summary,
      amenities: location.amenities,
      address,
      city,
      state,
      zip,
      phone: location.phone,
      // Exit 260 shares its address with the Truck Stop, so a bare "Phone"
      // there would be ambiguous in a way it is nowhere else.
      phoneLabel: location.truckStop ? 'C-Store' : 'Phone',
      hours: location.hours,
      hoursOverrides: location.hoursOverrides,
    },
  ]

  if (location.truckStop) {
    entries.push({
      key: `${location.id}-truck-stop`,
      name: `The Truck Stop at ${location.navLabel}`,
      summary: location.truckStop.summary,
      amenities: location.truckStop.amenities,
      address,
      city,
      state,
      zip,
      phone: location.truckStop.phone,
      phoneLabel: 'Truck Stop',
      hours: location.truckStop.hours,
      hoursOverrides: location.truckStop.hoursOverrides,
    })
  }

  return entries
}

export async function LocationContacts({ heading }: { heading?: string }) {
  const locations = await getLocations()
  const entries = locations.flatMap(entriesFor)
  if (entries.length === 0) return null

  // The approved page (docs/proofs/contact-page-template.html) has NO heading
  // above the cards: they follow the page's opening sentence directly. So the
  // heading is the editor's to add, and there is no default — a default is
  // how "Where to find us" appeared on a page that was approved without it.
  // Without one, each store's name is the section's heading (h2); with one, the
  // names sit a level under it (h3), so the outline never skips a level.
  const nameLevel = heading ? 'h3' : 'h2'

  return (
    <section className={styles.contactList}>
      {heading ? <h2 className={styles.sectionHeading}>{heading}</h2> : null}
      <div className={styles.loclist}>
        {entries.map((entry) => (
          <ContactCard key={entry.key} entry={entry} nameLevel={nameLevel} />
        ))}
      </div>
    </section>
  )
}

function ContactCard({ entry, nameLevel }: { entry: ContactEntry; nameLevel: 'h2' | 'h3' }) {
  const Name = nameLevel
  const telHref = `tel:${entry.phone.replace(/[^\d+]/g, '')}`

  return (
    <article className={styles.loccontact} aria-labelledby={`contact-${entry.key}`}>
      <div className={styles.loccontactMain}>
        <Name id={`contact-${entry.key}`} className={styles.locname}>
          {entry.name}
        </Name>

        {entry.summary ? <p className={styles.locsummary}>{entry.summary}</p> : null}

        {/* Driven by the amenity list, never hand-placed. One lone badge under
            a row promising a list reads as a failed load, so the row needs two
            before it renders at all. */}
        {entry.amenities.length >= 2 ? (
          <ul className={styles.amen}>
            {entry.amenities.map((amenity) => (
              <li key={amenity}>{amenity}</li>
            ))}
          </ul>
        ) : null}

        <div className={styles.locactions}>
          <a className={styles.miniPrimary} href={telHref}>
            Call {entry.phone}
          </a>
          {/* An ordinary link. Nothing is requested from Google until the guest
              chooses to go there, so it renders whether or not a map exists. */}
          <a
            className={styles.miniGhost}
            href={directionsUrl(entry)}
            rel="noreferrer"
          >
            Directions
            <span className="visually-hidden"> to {entry.name}, opens Google Maps</span>
          </a>
        </div>
      </div>

      <dl className={styles.locfacts}>
        <div className={styles.fact}>
          <dt>Address</dt>
          <dd>
            {entry.address}
            <br />
            {entry.city}, {entry.state} {entry.zip}
          </dd>
        </div>
        <div className={styles.fact}>
          <dt>{entry.phoneLabel}</dt>
          <dd>
            <a href={telHref}>{entry.phone}</a>
          </dd>
        </div>
        <div className={styles.fact}>
          <dt>Hours</dt>
          {/* Resolved per request in Pacific time, so a holiday override typed
              in November starts and reverts on its own (ADR 0027). The fallback
              is the standard line, so the prerendered HTML never shows a gap
              where an opening time goes. */}
          <dd className={styles.hrs}>
            <Suspense fallback={entry.hours}>
              <LiveHours hours={entry.hours} overrides={entry.hoursOverrides} of={entry.key} showReason />
            </Suspense>
          </dd>
        </div>
      </dl>
    </article>
  )
}
