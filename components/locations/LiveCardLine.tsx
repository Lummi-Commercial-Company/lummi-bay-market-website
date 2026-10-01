import { connection } from 'next/server'
import { getLiveLocations, resolveCardLine } from '@/lib/locations'
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
  // Read live (lib/tina-live.ts), so temporary hours show within seconds.
  const current = (await getLiveLocations()).find((l) => l.id === location.id) ?? location
  return <span className={className}>{resolveCardLine(current)}</span>
}
