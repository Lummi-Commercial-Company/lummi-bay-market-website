import assert from 'node:assert/strict'
import test from 'node:test'
import { namesLine, tenantGates, tenantHref } from './tenant-rules.ts'

/**
 * Other businesses' pages carry somebody else's name, hours and trademark in
 * our colours, so the gates that keep a guess or an unlicensed logo off the
 * site are tested rather than trusted (ADR 0016).
 */

test('hours show only once confirmed with the business', () => {
  assert.equal(tenantGates({ hours: '6am–2pm' }).hours, undefined)
  assert.equal(tenantGates({ hours: '6am–2pm', hoursConfirmed: false }).hours, undefined)
  assert.equal(tenantGates({ hours: '6am–2pm', hoursConfirmed: true }).hours, '6am–2pm')
  assert.equal(tenantGates({ hours: '  ', hoursConfirmed: true }).hours, undefined)
})

test('the logo and photo need permission', () => {
  assert.equal(tenantGates({}).approved, false)
  assert.equal(tenantGates({ markApproved: true }).approved, true)
})

test('an outside website must be a plain web address', () => {
  assert.deepEqual(
    [tenantGates({ linkMode: 'external', externalUrl: 'https://example.com/menu' }).linkMode],
    ['external']
  )
  for (const bad of ['javascript:alert(1)', 'example.com', '//example.com', 'https://', 'https://a b.com', '']) {
    const gates = tenantGates({ linkMode: 'external', externalUrl: bad })
    assert.equal(gates.linkMode, 'internal', bad)
    assert.equal(gates.externalUrl, undefined, bad)
  }
})

test('a card goes to its page, its website, or nowhere while it is not open', () => {
  const base = { slug: 'wendys', planned: false, linkMode: 'internal' as const, externalUrl: undefined }
  assert.equal(tenantHref(base), '/dining/wendys')
  assert.equal(tenantHref({ ...base, linkMode: 'external', externalUrl: 'https://w.example' }), 'https://w.example')
  assert.equal(tenantHref({ ...base, planned: true }), undefined)
  assert.equal(tenantGates({ status: 'planned' }).planned, true)
  assert.equal(tenantGates({}).planned, false)
})

test('the Locations card names up to three businesses', () => {
  assert.equal(namesLine([]), '')
  assert.equal(namesLine(['A']), 'A')
  assert.equal(namesLine(['A', 'B']), 'A and B')
  assert.equal(namesLine(['A', 'B', 'C']), 'A, B and C')
  assert.equal(namesLine(['A', 'B', 'C', 'D']), 'A, B, C and more')
})
