import assert from 'node:assert/strict'
import test from 'node:test'
import { listAddressFor } from '../tina/fields/after-save.ts'

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
