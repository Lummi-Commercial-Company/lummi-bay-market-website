#!/usr/bin/env node
/**
 * Render docs/design-spec-sheet.html to a print-ready PDF.
 *
 *   node scripts/make-spec-pdf.cjs [out.pdf]
 *
 * The HTML is the single source: everything the PDF looks like comes from the
 * `@media print` block at the end of that file's stylesheet. Edit the HTML,
 * re-run this, commit both — never hand-edit the PDF.
 *
 * Playwright and Chromium are build-time tools here, not project dependencies.
 * This repo has no package.json yet; the script uses whichever Playwright is
 * installed globally (NODE_PATH is set below for the usual container path) and
 * the Chromium that PLAYWRIGHT_BROWSERS_PATH already points at.
 */
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'docs', 'design-spec-sheet.html');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'docs', 'lummi-bay-asset-specs-brand-guide.pdf'));

// The brand faces. Chromium here has no route to fonts.googleapis.com, so the
// page's own <link> fails silently and the PDF prints in DejaVu — a brand guide
// set in the wrong typefaces. curl does have a route, so the latin subsets are
// fetched once into .cache/fonts/ and injected as local @font-face rules. The
// HTML is not touched: on the web it still loads the fonts the normal way.
const FONT_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700' +
  '&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap';
// Google serves woff2 only to a browser UA; asked as curl it returns ttf.
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
           'Chrome/120.0.0.0 Safari/537.36';
const CACHE = path.join(ROOT, '.cache', 'fonts');

function localFontCss() {
  const cached = path.join(CACHE, 'fonts.css');
  if (fs.existsSync(cached)) return fs.readFileSync(cached, 'utf8');

  fs.mkdirSync(CACHE, { recursive: true });
  const css = execFileSync('curl', ['-sSfL', '-A', UA, FONT_CSS_URL], { encoding: 'utf8' });

  // Keep the latin subsets only — the rest is Cyrillic, Greek and Vietnamese.
  const blocks = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g)]
    .filter(([, subset]) => subset === 'latin' || subset === 'latin-ext')
    .map(([, , block]) => block);
  if (!blocks.length) throw new Error('no latin @font-face blocks in the Google Fonts CSS');

  const out = blocks.map((block) =>
    block.replace(/url\((https:[^)]+)\)/g, (_, url) => {
      const file = path.join(CACHE, path.basename(new URL(url).pathname));
      if (!fs.existsSync(file)) execFileSync('curl', ['-sSfL', '-A', UA, '-o', file, url]);
      return `url('file://${file}')`;
    })
  ).join('\n');

  fs.writeFileSync(cached, out);
  return out;
}

// Printed into the bottom margin of every page. Chrome renders these templates
// without the page's own webfonts, so the stack is deliberately generic and the
// size is set inline — an unstyled template prints at an unreadable zoom.
const FOOTER = `
<div style="width:100%;margin:0 12mm;font:400 8px/1.4 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;
            color:#6B6659;display:flex;justify-content:space-between;align-items:baseline">
  <span>Lummi Bay Market — asset specs &amp; brand guide · 15 Sep 2026</span>
  <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
</div>`;

(async () => {
  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch {
    console.error(
      'Playwright not found. Install it, or render without the page footer:\n' +
      '  chrome --headless --no-pdf-header-footer --print-to-pdf=OUT.pdf FILE.html'
    );
    process.exit(1);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ colorScheme: 'light' });
  await page.goto('file://' + SRC, { waitUntil: 'networkidle' });

  let fontCss = null;
  try {
    fontCss = localFontCss();
  } catch (err) {
    console.warn('WARNING: brand fonts unavailable (' + err.message.trim() + ').');
    console.warn('The PDF will print in the fallback stack. Do not ship that version.');
  }
  if (fontCss) await page.addStyleTag({ content: fontCss });
  await page.evaluate(() => document.fonts.ready);

  await page.pdf({
    path: OUT,
    format: 'Letter',
    printBackground: true,          // the swatches ARE the content
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: FOOTER,
    margin: { top: '15mm', right: '14mm', bottom: '17mm', left: '14mm' },
  });

  await browser.close();
  const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
  console.log(`${path.relative(ROOT, OUT)}  ${kb} KB`);
})();
