import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { parseYamlSubset, splitFrontmatter } from './frontmatter.ts'

/**
 * Regression tests for the frontmatter reader.
 *
 * This file is tested rather than trusted because its failure mode is silent.
 * It does not throw on input it cannot handle — it returns a document with
 * fields quietly missing or holding the wrong type, and the page renders
 * looking fine with a section absent. Both bugs found in it so far worked
 * exactly that way: a folded description that swallowed every key after it,
 * and an amenity list that came back as one empty entry on all three
 * Locations. Neither would have failed a build.
 *
 * Every case below is a shape TinaCMS actually writes. When Phase 2 moves
 * content onto Tina's GraphQL client this file goes with the module it tests.
 */

test('a folded block scalar folds, and the keys after it survive', () => {
  // The first bug. The value was read as the literal string ">-" and every
  // key below it was dropped, because the continuation lines sat at an indent
  // the map loop treated as the end of the map.
  const data = parseYamlSubset(
    [
      'title: Contact',
      'seoDescription: >-',
      '  Addresses, opening hours and a phone number for every Lummi Bay Market',
      '  location and the Exit 260 Truck Stop.',
      'showPromos: false',
      'noindex: false',
    ].join('\n')
  )

  assert.equal(
    data.seoDescription,
    'Addresses, opening hours and a phone number for every Lummi Bay Market location and the Exit 260 Truck Stop.'
  )
  assert.equal(data.title, 'Contact')
  assert.equal(data.showPromos, false, 'a key after a folded block must survive')
  assert.equal(data.noindex, false)
})

test('a literal block keeps its line breaks and its trailing newline', () => {
  // `|` is clip chomping, so one trailing newline is kept. That is YAML's
  // behaviour and the module's: asserted so a later "tidy-up" that strips it
  // has to be a deliberate choice rather than a quiet one.
  const data = parseYamlSubset(['body: |', '  one', '  two', 'after: kept'].join('\n'))

  assert.equal(data.body, 'one\ntwo\n')
  assert.equal(data.after, 'kept')
})

test('a plain scalar continued on the next line folds into one string', () => {
  // How Tina writes any value past ~80 characters with no block marker, which
  // is what every `summary:` in content/locations/ looks like.
  const data = parseYamlSubset(
    [
      'summary: The flagship. A 24-hour convenience store with sixteen fuel lanes,',
      '  a tobacco and liquor drive-thru and quick-serve food.',
      'hours: Open 24 hours',
    ].join('\n')
  )

  assert.equal(
    data.summary,
    'The flagship. A 24-hour convenience store with sixteen fuel lanes, a tobacco and liquor drive-thru and quick-serve food.'
  )
  assert.equal(data.hours, 'Open 24 hours')
})

test('an indented list reads as a list of strings', () => {
  // The second bug: this returned [{}] — one empty entry — so every Location
  // rendered an empty amenity badge row.
  const data = parseYamlSubset(
    ['amenities:', '  - 24-hour convenience store', '  - 16 fuel lanes', 'phone: 360-778-1894'].join('\n')
  )

  assert.deepEqual(data.amenities, ['24-hour convenience store', '16 fuel lanes'])
  assert.equal(data.phone, '360-778-1894')
})

test('a list written flush with its key still belongs to that key', () => {
  const data = parseYamlSubset(['amenities:', '- fuel', '- coffee', 'phone: 360-758-2141'].join('\n'))

  assert.deepEqual(data.amenities, ['fuel', 'coffee'])
  assert.equal(data.phone, '360-758-2141', 'the key after a flush list must survive')
})

test('a list of maps keeps every entry separate', () => {
  // Swallowing the list into its first entry is the documented failure of
  // childrenOf: it yields [{}] instead of three blocks.
  const data = parseYamlSubset(
    [
      'blocks:',
      '  - _template: locationContacts',
      '    heading: Where to find us',
      '  - _template: locationsMap',
      '    heading: Find us',
      '  - _template: callout',
      '    heading: No contact form.',
    ].join('\n')
  )

  assert.deepEqual(data.blocks, [
    { _template: 'locationContacts', heading: 'Where to find us' },
    { _template: 'locationsMap', heading: 'Find us' },
    { _template: 'callout', heading: 'No contact form.' },
  ])
})

test('a nested map reads as a map, and the key after it survives', () => {
  const data = parseYamlSubset(
    [
      'truckStop:',
      '  phone: 360-778-1696',
      '  hours: Open 24 hours',
      '  amenities:',
      '    - Diesel lanes',
      '    - Showers',
      'seoDescription: after the nest',
    ].join('\n')
  )

  assert.deepEqual(data.truckStop, {
    phone: '360-778-1696',
    hours: 'Open 24 hours',
    amenities: ['Diesel lanes', 'Showers'],
  })
  assert.equal(data.seoDescription, 'after the nest')
})

test('an emptied list is an array, not the string "[]"', () => {
  // hoursOverrides is exactly this case. Read as text it becomes "[]", which
  // every Array.isArray guard downstream rejects — the right outcome by luck,
  // and the wrong type.
  const data = parseYamlSubset(['hoursOverrides: []', 'extras: {}'].join('\n'))

  assert.deepEqual(data.hoursOverrides, [])
  assert.deepEqual(data.extras, {})
})

test('scalars keep their types, and a quoted number stays a string', () => {
  const data = parseYamlSubset(
    ['zip: \'98226\'', 'noindex: false', 'showPromos: true', 'empty:', 'tilde: ~'].join('\n')
  )

  assert.equal(data.zip, '98226', 'a quoted zip must not become a number')
  assert.equal(data.noindex, false)
  assert.equal(data.showPromos, true)
  assert.equal(data.empty, null)
  assert.equal(data.tilde, null)
})

test('comments are ignored without eating the key below them', () => {
  const data = parseYamlSubset(
    ['# PLACEHOLDER (information-needed 2.2).', 'summary: real text', '# trailing note', 'phone: 360-384-1105'].join(
      '\n'
    )
  )

  assert.equal(data.summary, 'real text')
  assert.equal(data.phone, '360-384-1105')
})

test('splitFrontmatter separates the body and leaves it untouched', () => {
  const { data, body } = splitFrontmatter('---\ntitle: Contact\n---\nCall the store you need.\n')

  assert.equal(data.title, 'Contact')
  assert.equal(body, 'Call the store you need.\n')
})

test('a file with no frontmatter returns the whole thing as body', () => {
  const { data, body } = splitFrontmatter('Just prose.\n')

  assert.deepEqual(data, {})
  assert.equal(body, 'Just prose.\n')
})

test('CRLF line endings parse the same as LF', () => {
  const { data, body } = splitFrontmatter('---\r\ntitle: Contact\r\nnoindex: false\r\n---\r\nBody.\n')

  assert.equal(data.title, 'Contact')
  assert.equal(data.noindex, false)
  assert.equal(body, 'Body.\n')
})

test('every real content file still parses to the shape the site reads', () => {
  // The check that would have caught the amenity bug: not a synthetic sample,
  // the committed files themselves.
  for (const slug of ['exit-260', 'minimart', 'fishermans-cove']) {
    const raw = readFileSync(`content/locations/${slug}.mdx`, 'utf8')
    const { data } = splitFrontmatter(raw)

    assert.equal(data.id, slug, `${slug}: id`)
    assert.equal(typeof data.address, 'string', `${slug}: address`)
    assert.ok(String(data.address).length > 0, `${slug}: address is not empty`)
    assert.ok(Array.isArray(data.amenities), `${slug}: amenities is an array`)
    assert.ok((data.amenities as unknown[]).length > 0, `${slug}: amenities is not empty`)
    for (const amenity of data.amenities as unknown[]) {
      assert.equal(typeof amenity, 'string', `${slug}: every amenity is a string, not an empty map`)
    }
    assert.ok(Array.isArray(data.hoursOverrides), `${slug}: hoursOverrides is an array`)
  }

  const contact = splitFrontmatter(readFileSync('content/pages/contact.mdx', 'utf8')).data
  assert.ok(Array.isArray(contact.blocks), 'contact: blocks is an array')
  assert.equal((contact.blocks as unknown[]).length, 3, 'contact: all three blocks survive')
  assert.equal(contact.showPromos, false, 'contact: the key after the folded description survives')
})
