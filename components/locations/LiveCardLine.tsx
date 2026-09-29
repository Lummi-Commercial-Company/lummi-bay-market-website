import { connection } from 'next/server'
import { resolveCardLine } from '@/lib/locations'
import type { LocationDoc } from '@/lib/types'

/** The card line with only the hours half swapped, held to the same budget. */
export async function LiveCardLine({
  location,
  className,
}: {
  location: LocationDoc
  className?: string
}) {
  await connection()
  return <span className={className}>{resolveCardLine(location)}</span>
}
