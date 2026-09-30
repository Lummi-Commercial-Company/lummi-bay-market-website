import assert from 'node:assert/strict'
import test from 'node:test'
import { addLink, isSafeLinkUrl, listLinks, ownSitePath, setLinkUrl, unlink, type RichNode } from './rich-text-links.ts'

/** The CMS Links panel edits saved text directly, so its edits are tested. */

// The shape of the first real offer page's closing paragraph (30 Sep 2026).
const doc = (): RichNode => ({
  type: 'root',
  children: [
    { type: 'h4', children: [{ type: 'text', text: 'We are giving away fuel cards' }] },
    {
      type: 'p',
      children: [
        {
          type: 'a',
          url: 'https://lummi-bay-market-website-sky-srcr.vercel.app/rewards',
          title: null,
          children: [{ type: 'text', text: 'Download the LBM Rewards App' }],
        },
        { type: 'text', text: ' today, and visit us at Exit 260.' },
      ],
    },
    { type: 'p', children: [{ type: 'text', text: 'Play the Scratch Game', bold: true }] },
  ],
})

test('lists every link with its words and address', () => {
  assert.deepEqual(listLinks(doc()), [
    {
      path: [1, 0],
      url: 'https://lummi-bay-market-website-sky-srcr.vercel.app/rewards',
      text: 'Download the LBM Rewards App',
    },
  ])
  assert.deepEqual(listLinks(null), [])
})

test('changing an address changes only that link, and never the original', () => {
  const before = doc()
  const after = setLinkUrl(before, [1, 0], '/rewards')
  assert.equal(listLinks(after)[0]?.url, '/rewards')
  assert.equal(listLinks(before)[0]?.url.startsWith('https://'), true, 'input is not mutated')
})

test('unlink keeps the words and their formatting', () => {
  const after = unlink(doc(), [1, 0])
  assert.deepEqual(listLinks(after), [])
  assert.deepEqual(after.children?.[1]?.children?.[0], { type: 'text', text: 'Download the LBM Rewards App' })
})

test('add a link to words already in the text, keeping bold', () => {
  const after = addLink(doc(), 'Scratch Game', '/rewards')
  assert.ok(after)
  const para = after.children?.[2]?.children
  assert.deepEqual(para, [
    { type: 'text', text: 'Play the ', bold: true },
    { type: 'a', url: '/rewards', title: null, children: [{ type: 'text', text: 'Scratch Game', bold: true }] },
  ])
  assert.equal(addLink(doc(), 'not in the text', '/x'), null, 'words that are not there say so')
  assert.equal(addLink(doc(), 'Rewards App', '/x'), null, 'words already inside a link are not linked again')
})

test('addresses: pages, web, email and phone; never code', () => {
  for (const ok of ['/rewards', '/info/6th-Anniversary-Scratch-To-Win', 'https://example.com', 'mailto:a@b.co', 'tel:+1 360 380 2049', '#hours']) {
    assert.ok(isSafeLinkUrl(ok), ok)
  }
  for (const bad of ['javascript:alert(1)', '//evil.example', 'rewards', 'data:text/html,x', '#']) {
    assert.ok(!isSafeLinkUrl(bad), bad)
  }
})

test('a long address back to this site is offered as its short form', () => {
  assert.equal(ownSitePath('https://lummi-bay-market-website-sky-srcr.vercel.app/rewards', ['lummibay.com']), '/rewards')
  assert.equal(ownSitePath('https://www.lummibay.com/about', ['lummibay.com']), '/about')
  assert.equal(ownSitePath('https://example.com/rewards', ['lummibay.com']), null)
})
