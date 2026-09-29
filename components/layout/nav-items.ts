/**
 * The primary navigation. THREE ITEMS. Not four (ADR 0008).
 *
 * One list, read by both faces of the nav: the inline links on desktop and the
 * ☰ menu on a phone (ADR 0029). Fuel Prices is deliberately absent — the price
 * block's "All prices" link is its only route in (ADR 0008, amended). Rewards
 * is the utility pill, not a nav item (ADR 0006). A new page never earns a nav
 * slot on its own.
 */
export const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/locations', label: 'Locations' },
  { href: '/truck-stop', label: 'Truck Stop' },
] as const

/** Home is current only on Home; a section is current on every page under it. */
export function isCurrent(href: string, pathname: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}
