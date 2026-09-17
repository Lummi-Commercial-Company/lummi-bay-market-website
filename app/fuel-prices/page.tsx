import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../page.module.css'
import { getLocations } from '@/lib/locations'
import {
  allPriceRows,
  columnsFor,
  FUEL_GRADE_LABELS,
  formatPrice,
  formatUpdated,
  getFuelPrices,
  latestUpdated,
} from '@/lib/fuel-prices'

export const metadata: Metadata = {
  title: 'Fuel prices',
  description:
    'Posted regular, diesel and DEF prices at every Lummi Bay Market location and the Exit 260 Truck Stop.',
  alternates: { canonical: '/fuel-prices' },
}

/**
 * The full price page. It exists, but it is NOT in the nav — it is reached from
 * the footer and from the price block's "All prices" panel (ADR 0008).
 */
export default async function FuelPricesPage() {
  const [locations, prices] = await Promise.all([getLocations(), getFuelPrices()])
  const rows = allPriceRows(locations, prices)
  const columns = columnsFor(rows)
  const updated = formatUpdated(latestUpdated(rows))

  return (
    <div className={styles.pagegrid}>
      <div className={styles.maincol}>
        <h1>Fuel prices</h1>

        <table className={styles.priceTable}>
          <caption className="visually-hidden">Posted fuel prices per gallon</caption>
          <thead>
            <tr>
              <th scope="col">Place</th>
              {columns.map((grade) => (
                <th scope="col" key={grade}>
                  {FUEL_GRADE_LABELS[grade]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <th scope="row">
                  {row.href ? <Link href={row.href}>{row.label}</Link> : row.label}
                </th>
                {columns.map((grade) => {
                  const price = formatPrice(row.prices[grade])
                  return (
                    <td key={grade}>
                      {price ?? (
                        <>
                          <span aria-hidden="true">—</span>
                          <span className="visually-hidden">not sold here</span>
                        </>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <p className={styles.note}>
          {updated ? <>Updated {updated}. </> : null}
          Prices subject to change. Only regular, diesel and DEF are posted here.
        </p>
      </div>
    </div>
  )
}
