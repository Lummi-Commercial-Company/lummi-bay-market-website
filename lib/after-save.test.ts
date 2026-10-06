import assert from 'node:assert/strict'
import test from 'node:test'
import { listAddressFor, parentLevelOf } from '../tina/fields/after-save.ts'

/** Saving a document goes back up one level (owner, 30 Sep 2026). */
test('a saved document returns to the list it is in, folder and all', () => {
  assert.equal(listAddressFor('#/collections/edit/promos/6th_Anniversary/a-great-test'), '#/collections/promos/~/6th_Anniversary')
  assert.equal(listAddressFor('#/collections/edit/promos/Win-Fuel-Cards--More-Great-Prizes'), '#/collections/promos/~')
  assert.equal(listAddressFor('#/collections/edit/locations/exit-260'), '#/collections/locations/~')
})

test('Site Settings and Fuel Prices stay on their form', () => {
  assert.equal(listAddressFor('#/collections/edit/settings/site'), null)
  assert.equal(listAddressFor('#/collections/edit/fuelPrices/fuel-prices'), null)
  assert.equal(listAddressFor('#/collections/promos/~'), null, 'not a form: nothing to do')
})

test('saving one motif in Site Settings goes back to its motif group', () => {
  const crumbs = [
    { formId: 'content/settings/site.json', formName: '' },
    { formId: 'content/settings/site.json', formName: 'headerMotifs' },
    { formId: 'content/settings/site.json', formName: 'headerMotifs.groups.0' },
    { formId: 'content/settings/site.json', formName: 'headerMotifs.groups.0.motifs.2' },
  ]
  assert.equal(parentLevelOf(crumbs)?.formName, 'headerMotifs.groups.0')
  assert.equal(parentLevelOf(crumbs.slice(0, 1)), null, 'top of the form: stay')
  assert.equal(parentLevelOf([]), null)
  assert.equal(parentLevelOf(undefined), null)
})

test('the CMS knows which build it is running, to warn when a newer one is up', async () => {
  const { adminBundleFrom } = await import('../tina/fields/stale-cms.ts')
  assert.equal(
    adminBundleFrom('<script type="module" crossorigin src="/admin/assets/index-_zCwZZ2C.js"></script>'),
    '/admin/assets/index-_zCwZZ2C.js'
  )
  assert.equal(adminBundleFrom('<script type="module" src="/@vite/client"></script>'), null, 'local dev: no check')
})

test('live fuel prices: the CMS field names go back to the location slugs', async () => {
  // The shape the content API returned for content/fuel-prices.json (1 Oct 2026).
  const { fuelPricesFromLive } = await import('./live-shapes.ts')
  const doc = fuelPricesFromLive({
    _collection: 'fuelPrices',
    linkLocations: true,
    locations: { exit_260: { regular: 4.89 }, minimart: { regular: 3.79 }, fishermans_cove: { regular: 3.85 } },
    truckStop: { diesel: 4.55, def: 3.29 },
  })
  assert.deepEqual(Object.keys(doc.locations), ['exit-260', 'minimart', 'fishermans-cove'])
  assert.equal(doc.locations['exit-260']?.regular, 4.89)
  assert.equal(doc.truckStop.def, 3.29)
})
