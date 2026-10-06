import assert from 'node:assert/strict'
import test from 'node:test'
import { backgroundStyle, pageBackgroundFrom } from './page-background.ts'

/** The full-page background (owner, 6 Oct 2026, ADR 0031). */
test('an empty or missing setting is off, tiling at 40%', () => {
  const bg = pageBackgroundFrom(undefined)
  assert.equal(bg.enabled, false)
  assert.equal(bg.fit, 'repeat')
  assert.equal(bg.scale, 40)
  assert.equal(bg.opacity, 100)
})

test('values out of range are pulled back in; an unknown fit tiles', () => {
  const bg = pageBackgroundFrom({ enabled: true, image: '/a.png', fit: 'stretch', scale: 900, opacity: -5 })
  assert.equal(bg.fit, 'repeat')
  assert.equal(bg.scale, 200)
  assert.equal(bg.opacity, 0)
  assert.equal(pageBackgroundFrom({ scale: 1 }).scale, 10)
})

test('tiles are drawn at the chosen share of the image’s own size', () => {
  const bg = pageBackgroundFrom({ enabled: true, image: '/salmon.png', fit: 'repeat', scale: 40 })
  const style = backgroundStyle(bg, { width: 200, height: 213 })
  assert.equal(style?.backgroundSize, '80px 85.2px')
  assert.equal(style?.backgroundRepeat, 'repeat')
  assert.equal(style?.backgroundImage, 'url("/salmon.png")')
})

test('a tile waits for the image’s size; cover and contain do not need it', () => {
  const tile = pageBackgroundFrom({ enabled: true, image: '/a.png', fit: 'repeat-x' })
  assert.equal(backgroundStyle(tile, null), null)
  const cover = pageBackgroundFrom({ enabled: true, image: '/a.png', fit: 'cover' })
  assert.equal(backgroundStyle(cover, null)?.backgroundSize, 'cover')
  assert.equal(backgroundStyle(cover, null)?.backgroundRepeat, 'no-repeat')
})

test('nothing is drawn when it is off or has no image', () => {
  assert.equal(backgroundStyle(pageBackgroundFrom({ enabled: false, image: '/a.png', fit: 'cover' }), null), null)
  assert.equal(backgroundStyle(pageBackgroundFrom({ enabled: true, fit: 'cover' }), null), null)
})

test('an address that could break out of url() is refused', () => {
  const bg = pageBackgroundFrom({ enabled: true, image: '/a.png") ; x: url("evil', fit: 'cover' })
  assert.equal(backgroundStyle(bg, null), null)
})
