import assert from 'node:assert/strict'
import test from 'node:test'
import { liveNotice, noticesFrom, noticeState, toNotice } from './notices.ts'

/** Notices: scheduled, several, and still one switch for an emergency. */

const storm = { active: true, headline: 'The Minimart is closed today.' }

test('no dates: showing from the switch until the switch', () => {
  const notice = toNotice(storm)!
  assert.equal(noticeState(notice, '2026-09-30 15:00'), 'live')
  assert.equal(noticeState({ ...notice, active: false }, '2026-09-30 15:00'), 'off')
})

test('a window: up at its start, down at its end, Pacific time', () => {
  const sale = toNotice({ ...storm, headline: 'Anniversary weekend', startsAt: '10/03/2026 6:00 AM', endsAt: '10/04/2026' })!
  assert.equal(noticeState(sale, '2026-10-03 05:59'), 'scheduled')
  assert.equal(noticeState(sale, '2026-10-03 06:00'), 'live')
  assert.equal(noticeState(sale, '2026-10-04 23:59'), 'live', 'an end date with no time runs to the end of that day')
  assert.equal(noticeState(sale, '2026-10-05 00:00'), 'ended')
})

test('a date the site cannot read keeps it off, never on forever', () => {
  assert.equal(noticeState(toNotice({ ...storm, endsAt: 'Friday' })!, '2026-09-30 15:00'), 'off')
})

test('several live at once: the one highest in the list shows', () => {
  const notices = noticesFrom({
    alerts: [
      { ...storm, headline: 'First, but scheduled for later', startsAt: '12/24/2026' },
      { ...storm, headline: 'Second, live' },
      { ...storm, headline: 'Third, also live' },
      { active: true, headline: '   ' },
    ],
  })
  assert.equal(notices.length, 3, 'a notice with no words is not a notice')
  assert.equal(liveNotice(notices, '2026-09-30 15:00')?.headline, 'Second, live')
  assert.equal(liveNotice(notices, '2026-12-24 08:00')?.headline, 'First, but scheduled for later')
  assert.equal(liveNotice([], '2026-09-30 15:00'), null)
})

test('the single notice saved before the list existed still shows', () => {
  const notices = noticesFrom({ siteAlert: { ...storm, detail: 'Back tomorrow at 7am.' } })
  assert.equal(liveNotice(notices, '2026-09-30 15:00')?.detail, 'Back tomorrow at 7am.')
  assert.deepEqual(noticesFrom({}), [])
})
