import type { FooterColumn, FooterLink } from './types'

/**
 * Footer links staff add themselves (Site settings → Footer links → Extra
 * footer links), read and checked before the footer renders any of them.
 *
 * Two things are refused rather than shown, each logged so the fault is
 * findable:
 *
 *  1. A link whose TEXT names another Lummi business. Other Lummi companies
 *     appear on this site only as the single "Lummi Commercial Companies"
 *     link — a hard rule (CLAUDE.md, ADR 0001). The rule governs what a link
 *     says, not where it goes (ADR 0001, amended 17 Sep 2026): "Careers"
 *     pointing at silverreefcasino.com is allowed; "Careers at Silver Reef"
 *     is not. So the check reads the label, never the address.
 *
 *  2. An address that is not a page on this site or an ordinary web, phone
 *     or email link. `javascript:` and `data:` would run code; a
 *     protocol-relative `//host` hides where it goes.
 *
 * Everything else is shown as typed. This is a guard on the rule, not an
 * editor of the wording.
 */

export const FOOTER_COLUMNS: readonly FooterColumn[] = ['about', 'visit', 'rewards', 'work']

/** The other businesses LCC owns (CONTEXT.md). */
const OTHER_LUMMI_BUSINESSES: readonly RegExp[] = [
  /silver\s*reef/i,
  /loomis\s*trail/i,
  /salish\s*village/i,
  /lummi\s*commercial/i,
  /\blcc\b/i,
]

export type FooterLinkRefusal = 'incomplete' | 'unknown-column' | 'unsafe-address' | 'names-another-company'

export function isSafeFooterUrl(url: string): boolean {
  if (url.startsWith('/')) return !url.startsWith('//')
  return /^(https?:\/\/|mailto:|tel:)/i.test(url)
}

/** A link that leaves this site: shown with the "opens in a new tab" marker. */
export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

export function checkFooterLink(value: unknown): { link: FooterLink } | { refused: FooterLinkRefusal } {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const label = typeof record.label === 'string' ? record.label.trim() : ''
  const url = typeof record.url === 'string' ? record.url.trim() : ''
  const column = typeof record.column === 'string' ? record.column : ''

  if (!label || !url) return { refused: 'incomplete' }
  if (!FOOTER_COLUMNS.includes(column as FooterColumn)) return { refused: 'unknown-column' }
  if (!isSafeFooterUrl(url)) return { refused: 'unsafe-address' }
  if (OTHER_LUMMI_BUSINESSES.some((pattern) => pattern.test(label))) {
    return { refused: 'names-another-company' }
  }
  return { link: { label, url, column: column as FooterColumn } }
}

const WHY: Record<FooterLinkRefusal, string> = {
  incomplete: 'it needs both the link text and the address',
  'unknown-column': 'it has no column chosen',
  'unsafe-address': 'the address must be a page on this site (starting with /) or begin with https://, mailto: or tel:',
  'names-another-company':
    'its text names another Lummi business, and other Lummi companies appear on this site only as the single "Lummi Commercial Companies" link',
}

export function asFooterLinks(value: unknown): FooterLink[] {
  if (!Array.isArray(value)) return []
  const links: FooterLink[] = []
  for (const entry of value) {
    const result = checkFooterLink(entry)
    if ('link' in result) {
      links.push(result.link)
      continue
    }
    // An empty row the editor has not filled in yet is not worth a log line.
    if (result.refused === 'incomplete') continue
    const label = entry && typeof entry === 'object' ? String((entry as Record<string, unknown>).label ?? '') : ''
    console.error(`[footer] the extra footer link "${label}" is not shown: ${WHY[result.refused]}.`)
  }
  return links
}
