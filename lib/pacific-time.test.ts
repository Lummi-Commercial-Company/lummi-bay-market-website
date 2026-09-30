import assert from 'node:assert/strict'
import test from 'node:test'
import { formatUsDay, isWithinWindow, parseWhen, toStoreDay } from './pacific-time.ts'

/**
 * Staff type dates as MM/DD/YYYY (owner's direction, 30 Sep 2026). Every date
 * the site schedules by — promotions, temporary hours, fuel price stamps —
 * goes through this parser, so the format is tested here once.
 */

test('MM/DD/YYYY is read, with or without leading zeros', () => {
  assert.deepEqual(parseWhen('10/05/2026'), { day: '2026-10-05' })
  assert.deepEqual(parseWhen('1/5/2027'), { day: '2027-01-05' })
})

test('a time can follow, in 12-hour or 24-hour form', () => {
  assert.deepEqual(parseWhen('10/05/2026 12:00 PM'), { day: '2026-10-05', time: '12:00' })
  assert.deepEqual(parseWhen('10/05/2026 12:00 AM'), { day: '2026-10-05', time: '00:00' })
  assert.deepEqual(parseWhen('10/05/2026 5pm'), { day: '2026-10-05', time: '17:00' })
  assert.deepEqual(parseWhen('10/05/2026 at 5:30 p.m.'), { day: '2026-10-05', time: '17:30' })
  assert.deepEqual(parseWhen('10/05/2026 17:00'), { day: '2026-10-05', time: '17:00' })
  assert.equal(parseWhen('10/05/2026 13:00 PM'), null)
  assert.equal(parseWhen('10/05/2026 noon'), null)
})

test('dates saved before the change still read the same', () => {
  assert.deepEqual(parseWhen('2026-10-05'), { day: '2026-10-05' })
  assert.equal(toStoreDay('2026-10-05'), toStoreDay('10/05/2026'))
})

test('impossible and ambiguous dates are refused, never guessed', () => {
  for (const bad of ['02/30/2026', '13/01/2026', '10-05-2026', '05.10.2026', 'Oct 5']) {
    assert.equal(parseWhen(bad), null, bad)
  }
})

test('a temporary-hours window typed as MM/DD/YYYY is inclusive at both ends', () => {
  assert.ok(isWithinWindow('2026-12-31', '12/31/2026', '12/31/2026'))
  assert.ok(!isWithinWindow('2027-01-01', '12/24/2026', '12/31/2026'))
})

test('formatUsDay shows the house format', () => {
  assert.equal(formatUsDay('2026-10-05'), '10/05/2026')
  assert.equal(formatUsDay('10/05/2026'), null, 'it formats the internal form only')
})
