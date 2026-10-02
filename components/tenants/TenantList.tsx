import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import styles from './TenantCards.module.css'
import { getLocations } from '@/lib/locations'
import { getTenants, PLACEMENT_GROUPS, placementLabel, tenantHref } from '@/lib/tenants'
import type { TenantDoc } from '@/lib/types'

/**
 * Every business in Other Businesses, as cards grouped by where it is — the
 * dining page's one section (ADR 0016; docs/proofs/tenant-index-template.html).
 *
 * A guest choosing where to eat is choosing how far to walk, so the groups are
 * "Inside the store", "On the property" and "In the lot", not A–Z. An empty
 * group draws nothing, and with no businesses saved the whole section draws
 * nothing — never an empty heading.
 *
 * The line saying they are independently run is part of the section, not a
 * field: a page in our colours carrying other companies' names is exactly
 * where forgetting it would be easiest.
 */
export async function TenantList({ heading }: { heading?: string }) {
  const [tenants, locations] = await Promise.all([getTenants(), getLocations()])
  if (tenants.length === 0) return null

  return (
    <section className={styles.section}>
      {heading ? <h2 className={styles.sectionHeading}>{heading}</h2> : null}
      {PLACEMENT_GROUPS.map((group) => {
        const here = tenants.filter((tenant) => tenant.placement === group.placement)
        if (here.length === 0) return null
        // Under a section heading the groups are one level down.
        const GroupHeading = heading ? 'h3' : 'h2'
        // "Inside Exit 260": the store these businesses are in, when they share one.
        const homes = new Set(here.map((tenant) => tenant.location))
        const home = homes.size === 1 ? locations.find((l) => homes.has(l.id))?.navLabel : undefined
        return (
          <div key={group.placement} className={styles.group}>
            <GroupHeading className={styles.groupLabel}>{placementLabel(group.placement, home)}</GroupHeading>
            <p className={styles.groupSub}>{group.sub}</p>
            <ul className={styles.row} style={{ '--n': Math.min(here.length, 3) } as CSSProperties}>
              {here.map((tenant) => (
                <li key={tenant.slug}>
                  <TenantCard tenant={tenant} nameLevel={heading ? 'h4' : 'h3'} />
                </li>
              ))}
            </ul>
          </div>
        )
      })}
      <p className={styles.disclosure}>
        Every business on this page is independently owned and operated. None of them is part of
        Lummi Bay Market, and their hours are their own.
      </p>
    </section>
  )
}

function TenantCard({ tenant, nameLevel: Name }: { tenant: TenantDoc; nameLevel: 'h3' | 'h4' }) {
  const href = tenantHref(tenant)
  const external = tenant.linkMode === 'external' && Boolean(href)

  const inner = (
    <>
      {tenant.photo ? (
        <span className={styles.photo}>
          <Image src={tenant.photo} alt="" fill sizes="(min-width: 720px) 380px, 100vw" />
        </span>
      ) : null}
      {tenant.logo ? (
        // Their logo, as supplied: its own proportions, never cropped.
        <Image className={styles.logo} src={tenant.logo} alt="" width={160} height={40} />
      ) : null}
      {tenant.planned ? <span className={styles.badge}>Opening soon</span> : null}
      <Name className={styles.name}>{tenant.name}</Name>
      {tenant.summary ? <p className={styles.blurb}>{tenant.summary}</p> : null}
      {tenant.hours ? <span className={styles.hours}>{tenant.hours}</span> : null}
      <span className={styles.go}>
        {tenant.planned ? 'Opening soon' : external ? 'Their website ↗' : 'See details →'}
        {external ? <span className="visually-hidden"> (opens their website in a new tab)</span> : null}
      </span>
    </>
  )

  if (!href) return <div className={`${styles.card} ${styles.planned}`}>{inner}</div>
  if (external) {
    return (
      <a className={styles.card} href={href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    )
  }
  return (
    <Link className={styles.card} href={href}>
      {inner}
    </Link>
  )
}
