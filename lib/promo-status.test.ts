import assert from 'node:assert/strict'
import test from 'node:test'
import { describeAll, describePromo } from './promo-status.ts'

/** The tags staff read in the CMS must match what visitors are shown. */

// The owner's first real promotion, as saved in the CMS on 30 Sep 2026.
const anniversary = {
  eyebrow: '6th Anniversary Celebration',
  headline: 'Win Fuel Cards + More Great Prizes!',
  image: '/uploads/6yr-Drink-special-Facebook-1200x630.jpg',
  alt: 'a cup with soda pop in it and a cup with coffee in it',
  link: 'content/info-pages/6th-Anniversary-Scratch-To-Win.mdx',
  endsAt: '2026-10-31',
  active: true,
  placement: 'home',
}

test('the anniversary promotion is live on Home until 10/31/2026', () => {
  const status = describePromo('a', anniversary, '2026-09-30 15:00', true)
  assert.equal(status.tag, 'live')
  assert.equal(status.detail, 'Showing on the Home page until 10/31/2026.')
})

test('scheduled, ended and off say so, with dates as MM/DD/YYYY', () => {
  const scheduled = describePromo('a', { ...anniversary, startsAt: '10/10/2026 6:00 AM' }, '2026-09-30 15:00')
  assert.equal(scheduled.tag, 'scheduled')
  assert.match(scheduled.detail, /Starts 10\/10\/2026 6:00 AM/)
  const ended = describePromo('a', anniversary, '2026-11-01 00:00')
  assert.equal(ended.tag, 'ended')
  assert.match(ended.detail, /Ended 10\/31\/2026/)
  assert.equal(describePromo('a', { ...anniversary, active: false }, '2026-09-30 15:00').tag, 'off')
})

test('a promotion that cannot show says why', () => {
  assert.match(describePromo('a', { ...anniversary, image: '' }, '2026-09-30 15:00').detail, /no picture/)
  assert.match(describePromo('a', anniversary, '2026-09-30 15:00', false).detail, /offer page/)
  assert.match(
    describePromo('a', { ...anniversary, placement: 'specific' }, '2026-09-30 15:00').detail,
    /no pages or locations/
  )
  assert.match(describePromo('a', { ...anniversary, endsAt: 'Halloween' }, '2026-09-30 15:00').detail, /not a date/)
})

test('more live than the rows hold: the extra ones are waiting, in the site\'s order', () => {
  const docs = ['A', 'B', 'C', 'D'].map((h, i) => ({ id: h, data: { ...anniversary, headline: h, priority: i } }))
  const all = describeAll(docs, '2026-09-30 15:00', { homeRows: ['1', '2'] })
  assert.deepEqual(
    all.map((row) => `${row.headline}:${row.status.tag}`),
    ['A:live', 'B:live', 'C:live', 'D:waiting']
  )
})
