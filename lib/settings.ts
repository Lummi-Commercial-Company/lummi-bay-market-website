import { cacheLife, cacheTag } from 'next/cache'
import { CACHE_TAGS } from './cache-tags'
import { readContentJson } from './content'
import { asFooterLinks } from './footer-links'
import { asRowLayouts } from './promo-rows'
import { DEFAULT_PROMO_ROWS } from './promos'
import type { SiteSettings, SocialLink } from './types'

/**
 * Site settings — the singleton behind the header, the footer and the page
 * backdrop.
 *
 * Right now this reads `content/settings/site.json`, which its own README
 * describes as a sketch: the values are real, the field names are provisional,
 * and Phase 2 moves them into the TinaCMS settings singleton defined in
 * `tina/config.ts`. This reader is written to survive that: every field is
 * optional, every fallback is inert, and nothing here invents a URL.
 *
 * Two fields the sketch file does not carry yet are defaulted off:
 *   - `siteAlert` — defaults to inactive, so the header renders no bar and
 *     reserves no space (ADR 0017).
 *   - `backdrop` — defaults to disabled, so no watermark renders (ADR 0020).
 */

const ALLOWED_PLATFORMS = new Set(['facebook', 'instagram', 'yelp'])

/** Fixed order, regardless of how the list is sorted in the CMS (ADR 0028). */
const SOCIAL_ORDER = ['facebook', 'instagram', 'yelp']

export const DEFAULT_SETTINGS: SiteSettings = {
  rewards: { appStoreUrl: '', playStoreUrl: '' },
  footer: { careersUrl: '', lummiCommercialCompaniesUrl: '', extraLinks: [] },
  social: [],
  map: { embedCode: '', stillImage: '' },
  siteAlert: { active: false, headline: '' },
  backdrop: { enabled: false, opacity: 10, side: 'left', height: 100 },
  promoRows: DEFAULT_PROMO_ROWS,
}

function asSocial(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return []
  const links: SocialLink[] = []
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue
    const record = entry as Record<string, unknown>
    const platform = String(record.platform ?? '').toLowerCase()
    const url = String(record.url ?? '').trim()
    const label = String(record.label ?? '').trim()
    // No URL, no row. The social row never renders a placeholder and never
    // renders href="#" (ADR 0028).
    if (!ALLOWED_PLATFORMS.has(platform) || !url || !label) continue
    links.push({ platform: platform as SocialLink['platform'], label, url })
  }
  return links.sort(
    (a, b) => SOCIAL_ORDER.indexOf(a.platform) - SOCIAL_ORDER.indexOf(b.platform)
  )
}

export async function getSettings(): Promise<SiteSettings> {
  'use cache'
  // Held until something explicitly drops it: a deploy, or a call to the
  // revalidation endpoint when the emergency notice is published (ADR 0017).
  cacheTag(CACHE_TAGS.settings)
  cacheLife('max')

  const raw = await readContentJson<Record<string, unknown>>('settings/site.json')
  if (!raw) return DEFAULT_SETTINGS

  const rewards = (raw.rewards ?? {}) as Record<string, unknown>
  const footer = (raw.footer ?? {}) as Record<string, unknown>
  const map = (raw.map ?? {}) as Record<string, unknown>
  const alert = (raw.siteAlert ?? {}) as Record<string, unknown>
  const backdrop = (raw.backdrop ?? {}) as Record<string, unknown>

  return {
    rewards: {
      appStoreUrl: String(rewards.appStoreUrl ?? ''),
      playStoreUrl: String(rewards.playStoreUrl ?? ''),
    },
    footer: {
      careersUrl: String(footer.careersUrl ?? ''),
      lummiCommercialCompaniesUrl: String(footer.lummiCommercialCompaniesUrl ?? ''),
      // Checked on the way in: a link naming another Lummi business, or with
      // an address that could run code, is dropped and logged (footer-links).
      extraLinks: asFooterLinks(footer.extraLinks),
    },
    social: asSocial(raw.social),
    map: {
      embedCode: String(map.embedCode ?? ''),
      stillImage: String(map.stillImage ?? ''),
    },
    siteAlert: {
      active: alert.active === true,
      headline: String(alert.headline ?? ''),
      detail: alert.detail ? String(alert.detail) : undefined,
      link: alert.link ? String(alert.link) : undefined,
      updated: alert.updated ? String(alert.updated) : undefined,
    },
    backdrop: {
      image: backdrop.image ? String(backdrop.image) : undefined,
      enabled: backdrop.enabled === true,
      // Not clamped: 10% is the measured line, not a ceiling (ADR 0020).
      opacity: typeof backdrop.opacity === 'number' ? backdrop.opacity : 10,
      side: backdrop.side === 'right' ? 'right' : 'left',
      height: typeof backdrop.height === 'number' ? backdrop.height : 100,
      crop: backdrop.crop === 'narrow' ? 'narrow' : 'full',
    },
    liveMainPage: raw.liveMainPage ? String(raw.liveMainPage) : undefined,
    // Never empty: a site with no rows would hold live promos nobody can see.
    promoRows: asRowLayouts(raw.promoRows).length
      ? asRowLayouts(raw.promoRows)
      : DEFAULT_PROMO_ROWS,
  }
}
