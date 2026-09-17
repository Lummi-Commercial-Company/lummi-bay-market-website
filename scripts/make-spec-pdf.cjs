#!/usr/bin/env node
/**
 * Render one of this repo's print documents to a PDF.
 *
 *   node scripts/make-spec-pdf.cjs                 # the brand guide
 *   node scripts/make-spec-pdf.cjs handbook        # the editor's handbook
 *   node scripts/make-spec-pdf.cjs all             # both
 *   node scripts/make-spec-pdf.cjs brand-guide out.pdf
 *
 * The HTML is the single source: everything a PDF looks like comes from the
 * `@media print` block at the end of that file's stylesheet. Edit the HTML,
 * re-run this, commit both — never hand-edit the PDF.
 *
 * Adding a document is one entry in DOCS below. Two documents rendered by two
 * near-identical scripts is how their page furniture drifts apart, so there is
 * deliberately one renderer: margins, paper size and footer shape are shared,
 * and only the title in the footer differs.
 *
 * Playwright and Chromium are build-time tools here, not project dependencies —
 * nothing the site ships depends on them, so they stay out of package.json.
 * The script finds whichever Playwright is installed globally by adding the
 * usual global module directories to the resolver below, and uses the Chromium
 * that PLAYWRIGHT_BROWSERS_PATH already points at. Never run
 * `playwright install` here.
 */
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

// Playwright is installed globally, not in this repo, so Node will not find it
// from here without help. NODE_PATH only takes effect if it was exported before
// Node started, which is a trap for anyone running this script directly, so the
// global directories are pushed onto the resolver instead.
for (const dir of [
  process.env.NODE_PATH,
  '/opt/node22/lib/node_modules',
  '/usr/lib/node_modules',
  '/usr/local/lib/node_modules',
]) {
  if (dir && !module.paths.includes(dir)) module.paths.push(dir);
}

const ROOT = path.resolve(__dirname, '..');
// One entry per print document. `title` is what prints in the page footer.
const DOCS = {
  'brand-guide': {
    src: 'docs/design-spec-sheet.html',
    out: 'docs/lummi-bay-asset-specs-brand-guide.pdf',
    title: 'Lummi Bay Market — asset specs & brand guide',
  },
  handbook: {
    src: 'docs/editors-handbook.html',
    out: 'docs/lummi-bay-editors-handbook.pdf',
    title: "Lummi Bay Market — editor's handbook",
  },
};

// The date printed beside the title on every page. It is one constant rather
// than a copy per document, and it is not `new Date()`: a document's footer
// should say when the document was revised, not when someone happened to
// re-run the renderer.
const DOC_DATE = '17 Sep 2026';

const arg = process.argv[2] || 'brand-guide';
const keys = arg === 'all' ? Object.keys(DOCS) : [arg];
for (const k of keys) {
  if (!DOCS[k]) {
    console.error(`Unknown document "${k}". Known: ${Object.keys(DOCS).join(', ')}, all`);
    process.exit(2);
  }
}
if (process.argv[3] && keys.length > 1) {
  console.error('An output path can only be given when rendering a single document.');
  process.exit(2);
}

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
const footerFor = (title) => `
<div style="width:100%;margin:0 12mm;font:400 8px/1.4 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;
            color:#6B6659;display:flex;justify-content:space-between;align-items:baseline">
  <span>${title.replace(/&/g, '&amp;')} · ${DOC_DATE}</span>
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

  // Fetched once and reused across documents — the font subsets do not differ
  // per document, and re-fetching per page is the slow part of this script.
  let fontCss = null;
  try {
    fontCss = localFontCss();
  } catch (err) {
    console.warn('WARNING: brand fonts unavailable (' + err.message.trim() + ').');
    console.warn('The PDF will print in the fallback stack. Do not ship that version.');
  }

  const browser = await chromium.launch();

  for (const key of keys) {
    const doc = DOCS[key];
    const src = path.join(ROOT, doc.src);
    const out = path.resolve(process.argv[3] || path.join(ROOT, doc.out));

    if (!fs.existsSync(src)) {
      console.error(`Missing source: ${doc.src}`);
      await browser.close();
      process.exit(1);
    }

    const page = await browser.newPage({ colorScheme: 'light' });
    await page.goto('file://' + src, { waitUntil: 'networkidle' });
    if (fontCss) await page.addStyleTag({ content: fontCss });
    await page.evaluate(() => document.fonts.ready);

    await page.pdf({
      path: out,
      format: 'Letter',
      printBackground: true,          // the swatches ARE the content
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: footerFor(doc.title),
      margin: { top: '15mm', right: '14mm', bottom: '17mm', left: '14mm' },
    });
    await page.close();

    const kb = (fs.statSync(out).size / 1024).toFixed(0);
    console.log(`${path.relative(ROOT, out)}  ${kb} KB`);
  }

  await browser.close();
})();
