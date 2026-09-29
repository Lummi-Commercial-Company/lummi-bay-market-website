/**
 * The locations map (ADR 0019, ADR 0025).
 *
 * The map is two paste-in-a-box settings fields: the `<iframe>` Google My Maps
 * hands you under Share → Embed on my site, and a still picture of the finished
 * map. Neither is code and neither is hard-coded, so the map can be rebuilt or
 * swapped without a deploy.
 *
 * Nothing here loads Google. The still image is served from this origin and the
 * iframe mounts only after a guest clicks, which is what keeps the footer's
 * "No cookies. Visits counted anonymously." true (ADR 0025).
 */

/** Hosts a My Maps embed can legitimately point at. */
const ALLOWED_EMBED_HOSTS = new Set([
  'www.google.com',
  'google.com',
  'maps.google.com',
])

/**
 * Pull the `src` out of the pasted embed code.
 *
 * The pasted value is never injected as HTML. Taking the URL and rendering our
 * own `<iframe>` means an editor cannot paste a `<script>`, and it lets the
 * component own the attributes that matter — `loading="lazy"`, a `title` for
 * screen readers, and a referrer policy — instead of inheriting whatever
 * Google's snippet happens to carry this year.
 *
 * Returns null when the field is empty, is not an iframe, or points somewhere
 * other than Google Maps. Null means the map section does not render at all.
 */
export function mapEmbedSrc(embedCode: string): string | null {
  const trimmed = embedCode.trim()
  if (!trimmed) return null

  // Accept either the whole <iframe …> snippet or a bare URL.
  const fromIframe = trimmed.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i)
  const candidate = fromIframe?.[1] ?? trimmed
  if (!/^https?:\/\//i.test(candidate)) return null

  let url: URL
  try {
    url = new URL(candidate)
  } catch {
    return null
  }

  if (url.protocol !== 'https:' || !ALLOWED_EMBED_HOSTS.has(url.hostname)) {
    console.error(
      `[map] the embed code in Settings points at ${url.hostname}, which is not Google Maps. The map section will not render.`
    )
    return null
  }

  return url.toString()
}

/**
 * Validate the still image, which must be served from this origin.
 *
 * The whole point of the still is that the page shows a map without asking
 * anybody for anything (ADR 0025). An external URL breaks that intent, and it
 * breaks quietly: Next fetches it through `/_next/image`, whose host allowlist
 * in `next.config.js` does not include it, so the optimizer answers 400 and the
 * guest sees a blank frame with a working "Load map" button under it. The build
 * does not fail, because nothing is fetched at build time.
 *
 * A path with no leading slash fails harder still — `next/image` throws rather
 * than rendering — so it is rejected here too.
 *
 * Returns null for anything that is not a same-origin path. Null means the map
 * section does not render at all, which is the same answer `mapEmbedSrc` gives
 * for an embed it does not trust: no section beats a broken one.
 */
export function mapStillSrc(stillImage: string): string | null {
  const trimmed = stillImage.trim()
  if (!trimmed) return null

  // `//host/path` is protocol-relative and goes off-origin, so one slash only.
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    console.error(
      `[map] the still image in Settings is "${trimmed}", which is not a file on this site. Upload the image instead of linking to it — an address starting with http, or with //, is fetched from somewhere else and will not render. The map section will not render.`
    )
    return null
  }

  return trimmed
}

/**
 * A Directions link for one address.
 *
 * This is an ordinary link, not an embed: nothing is requested from Google
 * until a guest chooses to go there, so it renders whether or not a map has
 * been built (ADR 0019 — "renders its addresses, hours, phones and
 * per-Location Directions links").
 */
export function directionsUrl(parts: {
  address: string
  city: string
  state: string
  zip: string
}): string {
  const destination = `${parts.address}, ${parts.city}, ${parts.state} ${parts.zip}`.trim()
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}
