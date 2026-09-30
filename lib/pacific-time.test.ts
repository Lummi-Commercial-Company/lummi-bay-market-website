import assert from 'node:assert/strict'
import test from 'node:test'
import {
  calendarDay,
  formatUsDay,
  formatUsTime,
  isWithinWindow,
  parseWhen,
  toStoreDay,
  withCalendarDay,
} from './pacific-time.ts'

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

test('the CMS calendar and the typed box agree', () => {
  assert.equal(calendarDay('10/05/2026'), '2026-10-05')
  assert.equal(calendarDay('10/05/2026 12:00 PM'), '2026-10-05')
  assert.equal(calendarDay('2026-10-05'), '2026-10-05', 'an older saved date still opens the calendar on it')
  assert.equal(calendarDay('not a date'), '')
  assert.equal(calendarDay(undefined), '')

  assert.equal(withCalendarDay('', '2026-12-24'), '12/24/2026')
  assert.equal(withCalendarDay('10/05/2026 12:00 PM', '2026-10-31'), '10/31/2026 12:00 PM', 'a typed time is kept')
  assert.equal(withCalendarDay('10/05/2026 5pm', '2026-10-31'), '10/31/2026 5:00 PM')
  assert.equal(withCalendarDay('10/05/2026 12:00 PM', '2026-10-31', false), '10/31/2026', 'date-only fields drop it')
  assert.equal(withCalendarDay('10/05/2026', ''), '10/05/2026', 'clearing the calendar leaves the box alone')

  assert.equal(formatUsTime('00:00'), '12:00 AM')
  assert.equal(formatUsTime('13:05'), '1:05 PM')
  assert.equal(formatUsTime('24:00'), null)
})
