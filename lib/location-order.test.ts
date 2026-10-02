import assert from 'node:assert/strict'
import test from 'node:test'
import { withOtherStores } from './live-shapes.ts'
import { compareLocations, isUsableLocationId } from './location-order.ts'

/**
 * Staff can add Locations (ADR 0030). Where a new one lands in every list, and
 * where its prices come from, are tested rather than trusted.
 */

const loc = (id: string, name: string, order?: number) => ({ id, name, order })
const ids = (list: ReturnType<typeof loc>[]) => [...list].sort(compareLocations).map((l) => l.id)

test('the first three keep their usual order, and new ones follow A–Z', () => {
  assert.deepEqual(
    ids([loc('ferndale', 'Ferndale'), loc('fishermans-cove', 'The Cove'), loc('blaine', 'Blaine'), loc('minimart', 'Minimart'), loc('exit-260', 'Exit 260')]),
    ['exit-260', 'minimart', 'fishermans-cove', 'blaine', 'ferndale']
  )
})

test('"Position in lists" places a store, and wins a tie with the usual order', () => {
  assert.deepEqual(
    ids([loc('exit-260', 'Exit 260'), loc('minimart', 'Minimart'), loc('fishermans-cove', 'Cove'), loc('blaine', 'Blaine', 2)]),
    ['exit-260', 'blaine', 'minimart', 'fishermans-cove']
  )
  assert.deepEqual(ids([loc('exit-260', 'Exit 260'), loc('blaine', 'Blaine', 1)]), ['blaine', 'exit-260'])
})

test('a Location id must be a usable web address', () => {
  for (const ok of ['exit-260', 'minimart', 'blaine-2']) assert.ok(isUsableLocationId(ok), ok)
  for (const bad of ['', 'Exit 260', 'a/b', '-x', 'x-', 'café']) assert.ok(!isUsableLocationId(bad), bad)
})

test('prices for added stores fold into the one price map', () => {
  const fixed = { 'exit-260': { regular: 4.89 }, minimart: {}, 'fishermans-cove': {} }
  const out = withOtherStores(fixed, [
    { location: 'content/locations/blaine.mdx', regular: 4.59, diesel: 5.1, updated: '10/02/2026' },
    { location: 'content/locations/exit-260.mdx', regular: 1 },
    { location: 'content/locations/blaine.mdx', regular: 9 },
    { regular: 3 },
    null,
  ])
  assert.deepEqual(out.blaine, { regular: 4.59, diesel: 5.1, updated: '10/02/2026' })
  assert.equal(out['exit-260']?.regular, 4.89, 'a row never overrides the fixed three')
  assert.deepEqual(Object.keys(out), ['exit-260', 'minimart', 'fishermans-cove', 'blaine'])
  assert.deepEqual(withOtherStores(fixed, undefined), fixed)
})
