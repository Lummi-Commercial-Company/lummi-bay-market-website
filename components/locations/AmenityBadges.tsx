import type { ReactNode } from 'react'
import styles from './AmenityBadges.module.css'

/**
 * The "What's here" badge row — docs/proofs/amenity-badges.html, Treatment A.
 *
 * FREE TEXT WITH A FALLBACK DOT (the option the proof chose). Staff type any
 * amenity in the CMS; the text is matched against the small icon map below, and
 * anything it does not recognise renders straight away with a neutral dot.
 * Nothing is blocked and nothing breaks — the icon is drawn later if the
 * amenity sticks around. A fixed picklist would make every new amenity an
 * engineering ticket, which is exactly what this build exists to avoid.
 *
 * TODO: replace with the final icon set. These are the proof's stand-in utility
 * glyphs (pump, truck, shower …), not Coast Salish motifs, so the art rules do
 * not govern them — but they are placeholders all the same.
 *
 * Also from the proof: the row is not a link; order is the order in the field,
 * never alphabetical; fewer than two amenities and the row does not render —
 * the caller shows a sentence instead.
 */

type Glyph = ReactNode

const G: Record<string, Glyph> = {
  store: (
    <>
      <path d="M4 9.5 12 4l8 5.5V20H4z" />
      <path d="M9.5 20v-6h5v6" />
    </>
  ),
  pump: (
    <>
      <rect x="4" y="4" width="10" height="16" rx="1.5" />
      <path d="M6.5 8h5" />
      <path d="M14 10h3.5a2 2 0 0 1 2 2v4a1.5 1.5 0 0 0 1.5 1.5" />
    </>
  ),
  car: (
    <>
      <path d="M3 17h14l3-6h-3" />
      <circle cx="7" cy="19" r="1.6" />
      <circle cx="15" cy="19" r="1.6" />
      <path d="M3 17V8h11v9" />
    </>
  ),
  food: (
    <>
      <path d="M6 3v7a2 2 0 0 0 4 0V3" />
      <path d="M8 10v11" />
      <path d="M17 3c-1.5 2-2 4-2 6.5 0 1.5.7 2.5 2 2.5v9" />
    </>
  ),
  truck: (
    <>
      <path d="M3 17h10V6H3z" />
      <path d="M13 10h4l3 3.5V17h-7z" />
      <circle cx="7" cy="19" r="1.7" />
      <circle cx="17" cy="19" r="1.7" />
    </>
  ),
  drop: <path d="M12 3.5c3 4 5 6.5 5 9a5 5 0 0 1-10 0c0-2.5 2-5 5-9z" />,
  lounge: (
    <>
      <path d="M4 12v-2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
      <rect x="3" y="12" width="18" height="6" rx="1.5" />
      <path d="M6 18v2M18 18v2" />
    </>
  ),
  shower: (
    <>
      <path d="M6 12V7a3 3 0 0 1 6 0" />
      <path d="M3 12h9" />
      <path d="M6 16v1M9 15v2M12 16v1M15 15v2M18 16v1" />
      <path d="M17 4h3v8" />
    </>
  ),
  parking: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9.5 16V8h3a2.5 2.5 0 0 1 0 5h-3" />
    </>
  ),
  cup: (
    <>
      <path d="M5 9h11v4a5.5 5.5 0 0 1-11 0z" />
      <path d="M16 10h2.5a2 2 0 0 1 0 4H16" />
      <path d="M4 20h13" />
    </>
  ),
  leaf: (
    <>
      <path d="M12 20c0-6 3-10 8-11-1 7-4 10-8 11z" />
      <path d="M12 20c0-4-2-7-6-8 .5 5 2.5 7.5 6 8z" />
    </>
  ),
  atm: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M8 10h8M8 14h5" />
    </>
  ),
  lottery: <path d="M12 3v18M7 8h10M7 16h10" />,
  // The fallback: a neutral dot in the same 16px slot, so a badge without an
  // icon still lines up with the ones beside it.
  dot: <circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" />,
}

/**
 * First match wins, so the specific comes before the general: "Tobacco &
 * liquor drive-thru" is a drive-thru before it is a store, and "Ethanol-free
 * fuel" is ethanol-free before it is fuel.
 */
const RULES: [RegExp, keyof typeof G][] = [
  [/drive[\s-]?thr(u|ough)/, 'car'],
  [/diesel/, 'truck'],
  [/\bdef\b/, 'drop'],
  [/shower/, 'shower'],
  [/lounge/, 'lounge'],
  [/parking/, 'parking'],
  [/ethanol/, 'leaf'],
  [/kitchen|coffee|caf[eé]/, 'cup'],
  [/food|deli/, 'food'],
  [/\batm\b/, 'atm'],
  [/lottery/, 'lottery'],
  [/fuel|\bgas\b|pump/, 'pump'],
  [/store|convenience/, 'store'],
]

export function glyphFor(amenity: string): keyof typeof G {
  const text = amenity.toLowerCase()
  for (const [pattern, glyph] of RULES) {
    if (pattern.test(text)) return glyph
  }
  return 'dot'
}

export function AmenityBadges({
  amenities,
  heading = 'What’s here',
}: {
  amenities: string[]
  heading?: string
}) {
  if (amenities.length < 2) return null
  return (
    <>
      {/* A real <h2>, drawn as the small label the proof specifies. */}
      <h2 className={styles.label}>{heading}</h2>
      <ul className={styles.badges}>
      {amenities.map((amenity) => (
        <li key={amenity} className={styles.badge}>
          <svg
            className={styles.glyph}
            viewBox="0 0 24 24"
            width="16"
            height="16"
            aria-hidden="true"
            focusable="false"
          >
            {G[glyphFor(amenity)]}
          </svg>
          {amenity}
        </li>
      ))}
      </ul>
    </>
  )
}
