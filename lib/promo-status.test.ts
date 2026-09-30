import assert from 'node:assert/strict'
import test from 'node:test'
import { cloudMediaToSitePath, describeAll, describePromo, previewRows, slotNames } from './promo-status.ts'

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
  const listed = describeAll([{ id: 'a', data: anniversary }], '2026-09-30 15:00')[0]
  assert.equal(listed?.status.detail, 'Showing on the Home page until 10/31/2026 — row 1, full width.')
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

test('a picture read through TinaCloud is still a picture on this site', () => {
  const cloud = 'https://assets.tina.io/9ae30583-56b8-4a9b-ab3a-532621d296f3/6yr-Drink-special-Facebook-1200x630.jpg'
  assert.equal(cloudMediaToSitePath(cloud), '/uploads/6yr-Drink-special-Facebook-1200x630.jpg')
  assert.equal(
    cloudMediaToSitePath('https://assets.tina.io/abc/__staging/feature/__file/promos/x.jpg'),
    '/uploads/promos/x.jpg'
  )
  assert.equal(cloudMediaToSitePath('https://example.com/x.jpg'), 'https://example.com/x.jpg', 'outside stays outside')
  // The owner's promotion, as the live CMS reads it: Live, not "Not showing".
  const status = describePromo('a', { ...anniversary, image: cloud }, '2026-09-30 11:02', true)
  assert.equal(status.tag, 'live')
})

test('each live promotion says which row and which side it is in', () => {
  assert.deepEqual(slotNames(['1', '2'], 3), ['row 1, full width', 'row 2, left half', 'row 2, right half'])
  assert.deepEqual(slotNames(['1', '2'], 2), ['row 1, full width', 'row 2, full width'], 'a row re-divides')
  assert.deepEqual(slotNames(['2'], 3), ['row 1, left half', 'row 1, right half'], 'the third is waiting')
  assert.deepEqual(slotNames(['l3'], 3), ['row 1, left half', 'row 1, middle quarter', 'row 1, right quarter'])
})

// The owner's Home on 30 Sep 2026: three promotions, one full-width row then
// two halves. Order 1, 2, 3 fills them top to bottom, left to right; a blank
// Order goes after every numbered one.
test('Home preview: one full width, then two halves, in Order', () => {
  const docs = [
    { id: 'win', data: { ...anniversary, priority: 1 } },
    { id: 'great', data: { ...anniversary, headline: 'a great test', priority: 2 } },
    { id: 'test', data: { ...anniversary, headline: 'This is a test', priority: 3 } },
    { id: 'off', data: { ...anniversary, headline: 'Switched off', active: false } },
  ]
  const rows = previewRows(docs, '2026-09-30 15:00', ['1', '2'], 'home')
  assert.deepEqual(
    rows.map((row) => ({ spans: row.spans, ids: row.items.map((i) => i.id) })),
    [
      { spans: [12], ids: ['win'] },
      { spans: [6, 6], ids: ['great', 'test'] },
    ]
  )
  const blank = previewRows([{ ...docs[0]!, data: { ...anniversary } }, docs[1]!], '2026-09-30 15:00', ['1', '2'], 'home')
  assert.deepEqual(blank.map((row) => row.items[0]?.id), ['great', 'win'], 'no Order goes last')
  assert.deepEqual(
    describeAll(docs, '2026-09-30 15:00', { homeRows: ['1', '2'] }).map((row) => row.id),
    ['win', 'great', 'test', 'off'],
    'the list reads in the same order as the rows'
  )
})
