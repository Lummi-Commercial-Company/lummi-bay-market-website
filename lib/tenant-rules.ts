import type { TenantDoc } from './types'

/**
 * The gates on a business in Other Businesses (ADR 0016), kept free of
 * Next.js so they can be tested. The site enforces each one whatever the
 * document says:
 *   - hours show only once "Hours confirmed with the business" is on;
 *   - the logo and photo only once "We have permission" is on;
 *   - an outside website must be a plain http(s) address — anything that could
 *     run code is dropped, and the card goes to the page here instead.
 */
export interface TenantGates {
  hours?: string
  approved: boolean
  planned: boolean
  linkMode: 'internal' | 'external'
  externalUrl?: string
}

export function tenantGates(data: Record<string, unknown>): TenantGates {
  const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
  const hours = text(data.hours)
  const url = text(data.externalUrl)
  const externalUrl = /^https?:\/\/[^\s/]+/i.test(url) && !/\s/.test(url) ? url : undefined
  return {
    hours: data.hoursConfirmed === true && hours ? hours : undefined,
    approved: data.markApproved === true,
    planned: data.status === 'planned',
    linkMode: data.linkMode === 'external' && externalUrl ? 'external' : 'internal',
    externalUrl,
  }
}

/** Where a business's card goes. One not open yet links nowhere. */
export function tenantHref(tenant: Pick<TenantDoc, 'planned' | 'linkMode' | 'externalUrl' | 'slug'>): string | undefined {
  if (tenant.planned) return undefined
  return tenant.linkMode === 'external' ? tenant.externalUrl : `/dining/${tenant.slug}`
}

/** "A, B and C" — or the first three "and more". */
export function namesLine(names: string[]): string {
  if (names.length <= 1) return names[0] ?? ''
  if (names.length > 3) return `${names.slice(0, 3).join(', ')} and more`
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}
