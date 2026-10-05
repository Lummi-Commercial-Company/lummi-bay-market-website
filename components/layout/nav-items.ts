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

/**
 * What "Locations" opens: every place to buy something (owner, 2 Oct 2026) —
 * each Location, and under a Location the parts of it with a
 * page of their own (the Truck Stop and Liquor Store at Exit 260). Built from the content by
 * the header (SiteHeader), so a renamed store or a new page shows up by itself.
 * "Locations" itself still goes to /locations; the nav is still three items.
 */
export interface SubNavItem {
  href: string
  label: string
  children?: SubNavItem[]
}
