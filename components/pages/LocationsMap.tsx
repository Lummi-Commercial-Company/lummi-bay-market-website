import { MapEmbed } from './MapEmbed'
import styles from './PageSections.module.css'
import { getLocations } from '@/lib/locations'
import { mapEmbedSrc, mapStillSrc } from '@/lib/map'
import { getSettings } from '@/lib/settings'

/**
 * One map, a pin per Location (ADR 0019).
 *
 * THREE pins, not four: the Truck Stop shares Exit 260's address, so it shares
 * its pin. The list below the map is derived from the Locations, so it can
 * never drift from the addresses on the cards above it.
 *
 * EMPTY IS A VALID STATE AND IT IS NOT A PLACEHOLDER. The map has not been
 * built yet, so both settings fields are blank. When either is blank this
 * component renders NOTHING — the page is one section shorter and still
 * complete. No grey box, no "map coming soon", no empty frame. The Directions
 * link on every card is the route a guest actually uses, and it works today.
 */
export async function LocationsMap({ heading }: { heading?: string }) {
  const [settings, locations] = await Promise.all([getSettings(), getLocations()])

  const src = mapEmbedSrc(settings.map.embedCode)
  const stillImage = mapStillSrc(settings.map.stillImage)

  // Both halves are required, and both must be ones we trust. A still with no
  // embed is a picture that does nothing when clicked; an embed with no still
  // would have to load Google before anybody asked, which is the one thing
  // ADR 0025 forbids. Either field rejected is the same as either field empty.
  if (!src || !stillImage) return null

  return (
    <section aria-labelledby="find-us" className={styles.mapwrap}>
      <h2 id="find-us" className={styles.sectionHeading}>
        {heading || 'Find us'}
      </h2>

      <MapEmbed src={src} stillImage={stillImage} title="Map of Lummi Bay Market locations" />

      <ol className={styles.pinlist}>
        {locations.map((location, index) => (
          <li key={location.id} className={styles.pin}>
            <span className={styles.pinnum} aria-hidden="true">
              {index + 1}
            </span>
            <span className={styles.pinwho}>
              {location.navLabel}
              <span className={styles.pinwhere}>
                {location.address}, {location.city}
                {location.truckStop ? ' · the Truck Stop shares this pin' : ''}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
