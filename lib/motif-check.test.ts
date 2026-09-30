import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { checkMotifSvg } from './motif-check.ts'

/**
 * Staff upload header motifs themselves, so the check between an upload and
 * the header is tested rather than trusted. Each refusal is one a real export
 * could produce.
 */

const svg = (inner: string, attrs = 'viewBox="0 0 40 24"') =>
  `<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${inner}</svg>`
const shape = '<path d="M2 14c5-6 11 6 16 0v4z"/>'
const refusedFor = (source: string, pattern: RegExp) => {
  const result = checkMotifSvg(source)
  assert.equal(result.ok, false, `expected a refusal matching ${pattern}`)
  assert.ok(result.errors.some((e) => pattern.test(e)), `got: ${result.errors.join(' | ')}`)
}

test('the placeholder motifs already on the site pass', () => {
  for (const file of ['public/motifs/motif-single.svg', 'public/motifs/header-strip.svg']) {
    const result = checkMotifSvg(readFileSync(file, 'utf8'))
    assert.ok(result.ok, `${file}: ${result.errors.join(' | ')}`)
  }
})

test('size comes from the viewBox, or from width and height', () => {
  const a = checkMotifSvg(svg(shape))
  assert.deepEqual([a.width, a.height, a.ratio.toFixed(3)], [40, 24, (40 / 24).toFixed(3)])
  const b = checkMotifSvg(svg(shape, 'width="60px" height="30"'))
  assert.deepEqual([b.width, b.height], [60, 30])
  refusedFor(svg(shape, 'width="100%"'), /no size/)
})

test('anything that runs code or reaches outside the file is refused', () => {
  refusedFor(svg(`${shape}<script>alert(1)</script>`), /code/)
  refusedFor(svg(`<path onload="alert(1)" d="M0 0h1v1z"/>`), /code/)
  refusedFor(svg(`<a href="javascript:alert(1)">${shape}</a>`), /code/)
  refusedFor(svg(`<foreignObject><div/></foreignObject>${shape}`), /code/)
  refusedFor(svg(`<use href="https://example.com/x.svg#a"/>${shape}`), /another file or website/)
  refusedFor(svg(`<style>@import url(https://example.com/a.css);</style>${shape}`), /another file or website/)
  refusedFor(`<!DOCTYPE svg [<!ENTITY a "b">]>${svg(shape)}`, /DOCTYPE/)
})

test('references inside the file are fine', () => {
  const inner = `<defs><linearGradient id="g"/></defs><path fill="url(#g)" d="M0 0h1v1z"/><use href="#g"/>`
  assert.ok(checkMotifSvg(svg(inner)).ok)
})

test('a photo, text, animation or nothing at all is refused', () => {
  refusedFor(svg(`<image href="data:image/png;base64,AAAA"/>`), /photo or bitmap/)
  refusedFor(svg(`${shape}<text>Orca</text>`), /outlines/)
  refusedFor(svg(`<path d="M0 0h1v1z"><animate attributeName="d"/></path>`), /animated/)
  refusedFor(svg('<g/>'), /no shapes/)
  refusedFor('<html><body>not an svg</body></html>', /not an SVG/)
})

test('a solid background is refused — in a mask it is a block across the header', () => {
  refusedFor(svg(`<rect width="40" height="24" fill="#fff"/>${shape}`), /solid background/)
  refusedFor(svg(`<rect x="0" y="0" width="100%" height="100%"/>${shape}`), /solid background/)
  // A small rectangle inside the drawing is a shape, not a background.
  assert.ok(checkMotifSvg(svg('<rect x="4" y="6" width="20" height="2"/>')).ok)
})

test('shapes that cannot sit in a short one-row band are refused', () => {
  refusedFor(svg(shape, 'viewBox="0 0 10 50"'), /taller than it is wide/)
  refusedFor(svg(shape, 'viewBox="0 0 400 20"'), /wider than it is tall/)
  assert.ok(checkMotifSvg(svg(shape, 'viewBox="0 0 272 24"')).ok, 'the four-up strip is about 11:1')
})

test('weight: refused over 20 KB, a warning over 10 KB', () => {
  const pad = (n: number) => `<!--${'x'.repeat(n)}-->`
  const heavy = checkMotifSvg(svg(shape) + pad(12_000))
  assert.ok(heavy.ok && heavy.warnings.some((w) => /KB/.test(w)))
  refusedFor(svg(shape) + pad(21_000), /20 KB or less/)
})

test('see-through parts are a warning, not a refusal', () => {
  const result = checkMotifSvg(svg('<path opacity="0.4" d="M0 0h1v1z"/>'))
  assert.ok(result.ok)
  assert.ok(result.warnings.some((w) => /see-through/.test(w)))
  assert.equal(checkMotifSvg(svg('<path opacity="1" d="M0 0h1v1z"/>')).warnings.length, 0)
})
