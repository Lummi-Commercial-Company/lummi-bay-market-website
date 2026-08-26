import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const file = 'file:///tmp/claude-0/-home-user-lummi-bay-market-website/21c83485-f133-5f64-be53-154ad32f55ba/scratchpad/fuel-strip-proof.html';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1240, height: 1200 }, deviceScaleFactor: 2 });
await p.goto(file, { waitUntil: 'load' });
await p.waitForTimeout(1200);

// --- measurement: does opening the panel move the page content? ---
const stage = p.locator('.stage.phone').first();
const headline = stage.locator('.pagebody .ph');
const before = await headline.boundingBox();
await stage.locator('.strip > summary').click();
await p.waitForTimeout(350);
const after = await headline.boundingBox();
const isOpen = await stage.locator('details.strip').evaluate(el => el.open);
const panel = stage.locator('.reveal').first();
const pbox = await panel.boundingBox();
const sbox = await stage.locator('.strip').first().boundingBox();
const stagebox = await stage.boundingBox();

console.log('open:', isOpen);
console.log('headline y before/after:', before.y.toFixed(1), after.y.toFixed(1), '-> shift', (after.y - before.y).toFixed(2), 'px');
console.log('panel box:', JSON.stringify({x:+pbox.x.toFixed(1),y:+pbox.y.toFixed(1),w:+pbox.width.toFixed(1),h:+pbox.height.toFixed(1)}));
console.log('strip box:', JSON.stringify({y:+sbox.y.toFixed(1),h:+sbox.height.toFixed(1)}));
console.log('panel extends past strip by', (pbox.y + pbox.height - (sbox.y + sbox.height)).toFixed(1), 'px (overlaying page content)');
console.log('cue visible while open:', await stage.locator('.cue').first().isVisible());
console.log('face hidden while open:', !(await stage.locator('.face').first().isVisible()));
console.log('panel width vs stage width:', pbox.width.toFixed(1), '/', stagebox.width.toFixed(1));

await p.screenshot({ path: 'v-a-open.png', clip: { x: stagebox.x - 8, y: stagebox.y - 8, width: stagebox.width + 16, height: stagebox.height + 16 } });

// --- placement explorer: each position, panel open ---
const exp = p.locator('.spec.exp').first();
for (const pos of ['docked','sticky','corner','bottom']) {
  await exp.locator(`label[for="m-${pos}"]`).click();
  await p.waitForTimeout(200);
  const d = exp.locator('details.strip');
  if (!(await d.evaluate(el => el.open))) await exp.locator('.strip > summary').click();
  await p.waitForTimeout(300);
  const st = await exp.locator('.stage').boundingBox();
  const rv = await exp.locator('.reveal').boundingBox();
  const sl = await exp.locator('.slot').boundingBox();
  console.log(`${pos.padEnd(7)} slot y=${(sl.y-st.y).toFixed(0)} | panel y=${(rv.y-st.y).toFixed(0)} h=${rv.height.toFixed(0)} w=${rv.width.toFixed(0)} | in-frame=${rv.y>=st.y-1 && rv.y+rv.height<=st.y+st.height+1}`);
  await p.screenshot({ path: `v-pos-${pos}.png`, clip: { x: st.x-8, y: st.y-8, width: st.width+16, height: st.height+16 } });
  await exp.locator('.strip > summary').click();
  await p.waitForTimeout(150);
}

// --- sticky check: does the strip stay on screen after scrolling? ---
await exp.locator('label[for="m-sticky"]').click();
await p.waitForTimeout(150);
const sc = exp.locator('.scroller');
await sc.evaluate(el => el.scrollTop = 320);
await p.waitForTimeout(300);
const st2 = await exp.locator('.stage').boundingBox();
const sl2 = await exp.locator('.slot').boundingBox();
console.log('sticky after scroll 320: slot y offset in frame =', (sl2.y - st2.y).toFixed(0), '(low = still pinned)');
await exp.locator('label[for="m-docked"]').click();
await sc.evaluate(el => el.scrollTop = 320);
await p.waitForTimeout(300);
const sl3 = await exp.locator('.slot').boundingBox();
console.log('docked after scroll 320: slot y offset in frame =', (sl3.y - st2.y).toFixed(0), '(negative = scrolled away)');

await b.close();
