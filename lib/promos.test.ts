import assert from 'node:assert/strict'
import test from 'node:test'
import {
  comparePromos,
  fillRows,
  infoPageState,
  livePromosFor,
  pacificStamp,
  pageKeyFromRef,
  parseWhen,
  promoAppliesTo,
  promoState,
  toPromo,
  type PromoDoc,
} from './promos.ts'

/**
 * The promo rules decide what a guest sees and when an offer stops — the one
 * thing ADR 0007 exists to make exact. They are tested, not trusted.
 */

const promo = (over: Partial<PromoDoc> = {}): PromoDoc => ({
  id: over.id ?? 'p',
  headline: 'Long weekend fuel',
  cta: 'See details',
  image: '/uploads/x.jpg',
  alt: 'x',
  link: 'long-weekend',
  active: true,
  placement: 'all-interior',
  pages: [],
  ...over,
})

test('Pacific stamp: the store clock, not the server clock', () => {
  // 19:30 UTC on 3 Oct 2026 is 12:30 in Bellingham (PDT, UTC−7).
  assert.equal(pacificStamp(new Date('2026-10-03T19:30:00Z')), '2026-10-03 12:30')
  // 07:59 UTC on 1 Jan is still New Year's Eve in Pacific time (PST, UTC−8).
  assert.equal(pacificStamp(new Date('2027-01-01T07:59:00Z')), '2026-12-31 23:59')
})

test('parseWhen reads what staff type, and refuses what it cannot read', () => {
  assert.deepEqual(parseWhen('2026-10-03'), { day: '2026-10-03' })
  assert.deepEqual(parseWhen('2026-10-03 12:00'), { day: '2026-10-03', time: '12:00' })
  assert.deepEqual(parseWhen('2026-10-03T9:05'), { day: '2026-10-03', time: '09:05' })
  assert.deepEqual(parseWhen('10/3/2026'), { day: '2026-10-03' })
  assert.deepEqual(parseWhen('10/3/2026 17:00'), { day: '2026-10-03', time: '17:00' })
  // A date picker's stored instant is converted to Pacific.
  assert.deepEqual(parseWhen('2026-10-03T19:00:00.000Z'), { day: '2026-10-03', time: '12:00' })
  for (const bad of ['Friday', '2026-02-30', '2026-10-03 25:00', '3 Oct', '']) {
    assert.equal(parseWhen(bad), null, bad)
  }
})

test('live: no dates means running; off beats any date', () => {
  assert.equal(promoState(promo(), '2026-10-03 12:00'), 'live')
  assert.equal(
    promoState(promo({ active: false, startsAt: '2026-01-01' }), '2026-10-03 12:00'),
    'off'
  )
})

test('a date alone: starts at the start of the day, ends at the END of the day', () => {
  const p = promo({ startsAt: '2026-10-02', endsAt: '2026-10-05' })
  assert.equal(promoState(p, '2026-10-01 23:59'), 'scheduled')
  assert.equal(promoState(p, '2026-10-02 00:00'), 'live')
  assert.equal(promoState(p, '2026-10-05 23:59'), 'live', 'the end day is still on')
  assert.equal(promoState(p, '2026-10-06 00:00'), 'ended')
})

test('an end time: a promo that ends at noon is gone at noon', () => {
  const p = promo({ endsAt: '2026-10-03 12:00' })
  assert.equal(promoState(p, '2026-10-03 11:59'), 'live')
  assert.equal(promoState(p, '2026-10-03 12:00'), 'ended')
})

test('toPromo: an unreadable date keeps the promo off rather than running forever', () => {
  const base = { headline: 'x', image: '/uploads/x.jpg', link: 'content/info-pages/a.mdx' }
  assert.ok('refused' in toPromo('a', { ...base, endsAt: 'next Friday' }))
  assert.ok('refused' in toPromo('a', { ...base, image: '' }))
  assert.ok('refused' in toPromo('a', { ...base, image: 'https://example.com/x.jpg' }))
  assert.ok('refused' in toPromo('a', { ...base, image: '/uploads/motifs/orca.svg' }))
  assert.ok('refused' in toPromo('a', { ...base, link: 'content/pages/about.mdx' }))
  const ok = toPromo('a', {
    ...base,
    pages: [{ page: 'content/pages/about.mdx' }],
    locations: [{ location: 'content/locations/exit-260.md' }],
  })
  assert.ok('promo' in ok)
  if ('promo' in ok) {
    assert.equal(ok.promo.link, 'a')
    assert.equal(ok.promo.cta, 'See details', 'a blank button label falls back')
    assert.equal(ok.promo.active, true, '"Running" left untouched is running')
    assert.equal(ok.promo.placement, 'all-interior')
    assert.deepEqual(ok.promo.pages, ['pages/about', 'locations/exit-260'])
  }
})

test('references reduce to page keys', () => {
  assert.equal(pageKeyFromRef('content/pages/about.mdx'), 'pages/about')
  assert.equal(pageKeyFromRef('content/locations/exit-260.md'), 'locations/exit-260')
  assert.equal(pageKeyFromRef('info-pages/long-weekend.mdx'), 'info-pages/long-weekend')
  assert.equal(pageKeyFromRef(''), null)
})

test('placement: home, every interior page, or named pages', () => {
  const home = promo({ placement: 'home' })
  const all = promo({ placement: 'all-interior' })
  const named = promo({ placement: 'specific', pages: ['locations/minimart'] })

  assert.ok(promoAppliesTo(home, { home: true }))
  assert.ok(!promoAppliesTo(all, { home: true }), '"every page except home" means that')
  assert.ok(promoAppliesTo(all, { key: 'pages/about' }))
  assert.ok(!promoAppliesTo(all, { key: 'pages/about', allowAllInterior: false }))
  assert.ok(promoAppliesTo(named, { key: 'locations/minimart', allowAllInterior: false }),
    'a promo that names the page shows even where the band is switched off')
  assert.ok(!promoAppliesTo(named, { key: 'locations/exit-260' }))
  assert.ok(!promoAppliesTo(all, { excludeInfo: 'long-weekend' }),
    'an offer page never advertises itself')
})

test('order: priority, then soonest to end, then headline', () => {
  const list = [
    promo({ id: 'c', headline: 'C' }),
    promo({ id: 'b', headline: 'B', endsAt: '2026-10-09' }),
    promo({ id: 'a', headline: 'A', priority: 1 }),
    promo({ id: 'd', headline: 'D', endsAt: '2026-10-05' }),
  ].sort(comparePromos)
  assert.deepEqual(list.map((p) => p.id), ['a', 'd', 'b', 'c'])
})

test('rows re-divide evenly and never leave a hole', () => {
  const ps = (n: number) => Array.from({ length: n }, (_, i) => promo({ id: `p${i}` }))
  const shape = (rows: ReturnType<typeof fillRows>) => rows.map((r) => r.spans.join('+'))

  assert.deepEqual(shape(fillRows(['3'], ps(3))), ['4+4+4'])
  assert.deepEqual(shape(fillRows(['3'], ps(2))), ['6+6'], 'a third expired: two halves')
  assert.deepEqual(shape(fillRows(['3'], ps(1))), ['12'])
  assert.deepEqual(shape(fillRows(['l3'], ps(2))), ['6+6'])
  assert.deepEqual(shape(fillRows(['wn', '4'], ps(5))), ['8+4', '4+4+4'])
  assert.deepEqual(fillRows(['1', '2'], []), [], 'nothing live renders nothing')
  for (const row of fillRows(['4', 'l3', 'nw', '3'], ps(11))) {
    assert.equal(row.spans.reduce((a, b) => a + b, 0), 12)
  }
})

test('rows are capped at six; the rest wait in order', () => {
  const rows = fillRows(['1', '1', '1', '1', '1', '1', '1', '1'], Array.from({ length: 8 }, (_, i) => promo({ id: `p${i}` })))
  assert.equal(rows.length, 6)
  assert.equal(rows[5]?.promos[0]?.id, 'p5')
})

test('livePromosFor filters by state and placement, then orders', () => {
  const now = '2026-10-03 12:00'
  const out = livePromosFor(
    [
      promo({ id: 'ended', endsAt: '2026-10-01' }),
      promo({ id: 'soon', startsAt: '2026-10-10' }),
      promo({ id: 'home', placement: 'home' }),
      promo({ id: 'second', priority: 2 }),
      promo({ id: 'first', priority: 1 }),
    ],
    { key: 'pages/about' },
    now
  )
  assert.deepEqual(out.map((p) => p.id), ['first', 'second'])
})

test('offer pages: live while a promo is; otherwise upcoming or ended', () => {
  const now = '2026-10-03 12:00'
  assert.equal(infoPageState('long-weekend', [promo()], now).state, 'live')

  const upcoming = infoPageState('long-weekend', [promo({ startsAt: '2026-10-09' })], now)
  assert.equal(upcoming.state, 'upcoming')
  if (upcoming.state === 'upcoming') assert.equal(upcoming.startsOn, '2026-10-09')

  assert.equal(infoPageState('long-weekend', [promo({ endsAt: '2026-10-01' })], now).state, 'ended')
  assert.equal(infoPageState('long-weekend', [promo({ active: false })], now).state, 'ended')
  assert.equal(infoPageState('long-weekend', [], now).state, 'ended', 'never promoted: not indexed')
})
