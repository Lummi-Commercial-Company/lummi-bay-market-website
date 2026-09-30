import assert from 'node:assert/strict'
import test from 'node:test'
import {
  asFooterLinks,
  checkFooterLink,
  DEFAULT_FOOTER_LINKS,
  footerLinksFrom,
  isExternalUrl,
  privacyLinkFrom,
} from './footer-links.ts'

/**
 * The extra footer links are the one place staff can put arbitrary text in
 * the footer, so the checks that stand between them and the hard rule on
 * other Lummi companies are tested rather than trusted.
 */

const ok = (label: string, url: string, column = 'about') => {
  const result = checkFooterLink({ label, url, column })
  assert.ok('link' in result, `expected "${label}" → ${url} to be shown, got ${JSON.stringify(result)}`)
  return result.link
}
const refused = (value: unknown) => {
  const result = checkFooterLink(value)
  assert.ok('refused' in result, `expected a refusal for ${JSON.stringify(value)}`)
  return result.refused
}

test('a page on this site and an outside address are both shown', () => {
  assert.deepEqual(ok('Gift cards', '/gift-cards', 'rewards'), {
    label: 'Gift cards',
    url: '/gift-cards',
    column: 'rewards',
  })
  ok('Tribal news', 'https://www.lummi-nsn.gov', 'about')
  ok('Call the office', 'tel:+13607781894')
  ok('Email us', 'mailto:hello@example.com')
})

test('text and address are trimmed', () => {
  assert.deepEqual(ok('  Gift cards ', ' /gift-cards  '), { label: 'Gift cards', url: '/gift-cards', column: 'about' })
})

test('text naming another Lummi business is refused, however it is written', () => {
  for (const label of [
    'Silver Reef',
    'Careers at Silver Reef',
    'SILVERREEF casino',
    'Loomis Trail Golf',
    'Salish Village',
    'Lummi Commercial Companies',
    'About LCC',
  ]) {
    assert.equal(refused({ label, url: 'https://example.com', column: 'about' }), 'names-another-company', label)
  }
})

test('the address is never what is checked — a neutral label may point anywhere', () => {
  // The same shape as the Careers link, which goes to silverreefcasino.com
  // under the single word "Careers" (ADR 0001, amended 17 Sep 2026).
  ok('Jobs', 'https://www.silverreefcasino.com/careers', 'work')
})

test('an address that could run code or hide where it goes is refused', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,hi', '//evil.example', 'www.example.com', 'ftp://x']) {
    assert.equal(refused({ label: 'Link', url, column: 'about' }), 'unsafe-address', url)
  }
})

test('a row missing text, address or a real column is not shown', () => {
  assert.equal(refused({ label: '', url: '/x', column: 'about' }), 'incomplete')
  assert.equal(refused({ label: 'X', url: '  ', column: 'about' }), 'incomplete')
  assert.equal(refused({ label: 'X', url: '/x', column: 'sidebar' }), 'unknown-column')
  assert.equal(refused(null), 'incomplete')
})

test('the list keeps good rows in order and drops the rest', () => {
  const quiet = console.error
  console.error = () => {}
  try {
    const links = asFooterLinks([
      { label: 'Gift cards', url: '/gift-cards', column: 'rewards' },
      { label: 'Silver Reef', url: 'https://silverreefcasino.com', column: 'about' },
      { label: 'Fleet accounts', url: 'https://example.com/fleet', column: 'visit' },
      { label: '', url: '', column: 'about' },
    ])
    assert.deepEqual(
      links.map((link) => link.label),
      ['Gift cards', 'Fleet accounts']
    )
  } finally {
    console.error = quiet
  }
  assert.deepEqual(asFooterLinks(undefined), [])
  assert.deepEqual(asFooterLinks('not a list'), [])
})

test('only http(s) addresses count as leaving the site', () => {
  assert.equal(isExternalUrl('https://example.com'), true)
  assert.equal(isExternalUrl('/rewards'), false)
  assert.equal(isExternalUrl('tel:+13607781894'), false)
})

test('a saved list is used exactly as saved — deleted defaults stay deleted', () => {
  const links = footerLinksFrom({
    links: [{ label: 'Jobs', url: 'https://example.com/jobs', column: 'work' }],
    careersUrl: 'https://ignored.example.com',
  })
  assert.deepEqual(links, [{ label: 'Jobs', url: 'https://example.com/jobs', column: 'work' }])
  assert.deepEqual(footerLinksFrom({ links: [] }), [], 'an empty list is a choice, not a missing setting')
})

test('an older settings file keeps the footer it had', () => {
  const links = footerLinksFrom({
    careersUrl: 'https://example.com/careers',
    extraLinks: [{ label: 'Gift cards', url: '/gift-cards', column: 'rewards' }],
  })
  assert.deepEqual(links, [
    ...DEFAULT_FOOTER_LINKS,
    { label: 'Careers', url: 'https://example.com/careers', column: 'work' },
    { label: 'Gift cards', url: '/gift-cards', column: 'rewards' },
  ])
})

test('the privacy link can be reworded but never removed or pointed at code', () => {
  assert.deepEqual(privacyLinkFrom({}), { label: 'Privacy Policy', url: '/privacy' })
  assert.deepEqual(privacyLinkFrom({ privacyLabel: 'Privacy', privacyUrl: '' }), { label: 'Privacy', url: '/privacy' })
  assert.deepEqual(privacyLinkFrom({ privacyUrl: 'javascript:alert(1)' }), { label: 'Privacy Policy', url: '/privacy' })
  assert.deepEqual(privacyLinkFrom({ privacyLabel: 'Silver Reef privacy' }), { label: 'Privacy Policy', url: '/privacy' })
})
