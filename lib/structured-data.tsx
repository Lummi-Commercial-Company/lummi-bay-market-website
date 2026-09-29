import { SITE_NAME, SITE_URL } from './site'
import type { LocationDoc } from './types'

/**
 * Per-location structured data (GasStation, a subtype of LocalBusiness).
 *
 * Rule for everything in here: emit a field or omit it — never guess one. A
 * wrong `openingHours` in structured data is worse than none, because it feeds
 * the "open now" badge in search results and nobody on our side ever sees it.
 */

/** "7am–8pm" -> ["07:00", "20:00"]. Returns null for anything unrecognised. */
function parseHoursRange(hours: string): [string, string] | null {
  const normalised = hours.toLowerCase().replace(/\s/g, '')
  if (/24hours|24\/7|open24/.test(normalised)) return ['00:00', '23:59']

  const match = normalised.match(
    /^(\d{1,2})(?::(\d{2}))?(am|pm)[–\-—to]+(\d{1,2})(?::(\d{2}))?(am|pm)$/
  )
  if (!match) return null

  const to24 = (hour?: string, minute?: string, meridiem?: string): string | null => {
    if (!hour || !meridiem) return null
    let h = Number(hour)
    if (Number.isNaN(h) || h < 1 || h > 12) return null
    if (meridiem === 'pm' && h !== 12) h += 12
    if (meridiem === 'am' && h === 12) h = 0
    return `${String(h).padStart(2, '0')}:${minute ?? '00'}`
  }

  const opens = to24(match[1], match[2], match[3])
  const closes = to24(match[4], match[5], match[6])
  if (!opens || !closes) return null
  return [opens, closes]
}

const ALL_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export function locationJsonLd(location: LocationDoc, hours: string) {
  const range = parseHoursRange(hours)

  return {
    '@context': 'https://schema.org',
    '@type': 'GasStation',
    '@id': `${SITE_URL}/locations/${location.id}#business`,
    name: location.name,
    ...(location.aka ? { alternateName: location.aka } : {}),
    parentOrganization: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    url: `${SITE_URL}/locations/${location.id}`,
    ...(location.phone ? { telephone: location.phone } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: location.address,
      addressLocality: location.city,
      addressRegion: location.state,
      postalCode: location.zip,
      addressCountry: 'US',
    },
    ...(typeof location.lat === 'number' && typeof location.lng === 'number'
      ? { geo: { '@type': 'GeoCoordinates', latitude: location.lat, longitude: location.lng } }
      : {}),
    ...(range
      ? {
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ALL_DAYS,
              opens: range[0],
              closes: range[1],
            },
          ],
        }
      : {}),
    ...(location.amenities.length > 0
      ? {
          amenityFeature: location.amenities.map((name) => ({
            '@type': 'LocationFeatureSpecification',
            name,
            value: true,
          })),
        }
      : {}),
  }
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Content is built from our own data, not user input; the replace guards
      // the one character that can close the script element early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}
