import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { contentApiUrl, TINA_API_VERSION, toSitePaths } from './live-shapes.ts'

/** Live content (owner, 1 Oct 2026): read from TinaCloud, the built file as fallback. */

test('the content API address, or none without credentials', () => {
  assert.equal(
    contentApiUrl({ NEXT_PUBLIC_TINA_CLIENT_ID: 'abc', TINA_TOKEN: 't', VERCEL_GIT_COMMIT_REF: 'main' }),
    `https://content.tinajs.io/${TINA_API_VERSION}/content/abc/github/main`
  )
  assert.equal(
    contentApiUrl({ NEXT_PUBLIC_TINA_CLIENT_ID: 'abc', TINA_TOKEN: 't', VERCEL_GIT_COMMIT_REF: 'claude/x' }),
    `https://content.tinajs.io/${TINA_API_VERSION}/content/abc/github/claude%2Fx`
  )
  assert.equal(contentApiUrl({ NEXT_PUBLIC_TINA_CLIENT_ID: 'abc' }), null, 'no token: use the built files')
  assert.equal(contentApiUrl({}), null)
})

test('the API version is the installed @tinacms/graphql major.minor, as tinacms build uses', () => {
  const { version } = JSON.parse(readFileSync('node_modules/@tinacms/graphql/package.json', 'utf8'))
  assert.equal(TINA_API_VERSION, version.split('.').slice(0, 2).join('.'), 'Tina was upgraded: update TINA_API_VERSION')
})

test('pictures come back as this site’s paths, everywhere in a document', () => {
  const cloud = 'https://assets.tina.io/9ae30583-56b8-4a9b-ab3a-532621d296f3/HauntedHighRise-EmailTopic.jpg'
  assert.deepEqual(toSitePaths({ hero: { image: cloud, alt: 'x' }, list: [cloud, 3, true, null] }), {
    hero: { image: '/uploads/HauntedHighRise-EmailTopic.jpg', alt: 'x' },
    list: ['/uploads/HauntedHighRise-EmailTopic.jpg', 3, true, null],
  })
})
