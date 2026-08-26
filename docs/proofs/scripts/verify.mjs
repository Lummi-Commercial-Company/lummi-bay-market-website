import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const file='file:///tmp/claude-0/-home-user-lummi-bay-market-website/21c83485-f133-5f64-be53-154ad32f55ba/scratchpad/fuel-strip-proof.html';
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1240,height:1200},deviceScaleFactor:2});
await p.goto(file,{waitUntil:'load'}); await p.waitForTimeout(1200);

// every block is a details with a working toggle?
const n = await p.locator('details.strip').count();
const plain = await p.locator('.strip:not(details)').count();
console.log('blocks that are <details>:', n, '| blocks without a toggle:', plain);

// desktop block width
for (const sel of ['.stage.desk']) {
  const w = await p.locator(sel+' .strip').first().boundingBox();
  const st = await p.locator(sel).first().boundingBox();
  console.log('desktop: frame', st.width, '-> block', w.width.toFixed(0), '(cap 400)');
}
// phone block width
const pw = await p.locator('.stage.phone .strip').first().boundingBox();
console.log('phone: block', pw.width.toFixed(0));

// Home: loads open, collapses, in flow (content should MOVE when toggled)
const home = p.locator('.stage.phone').filter({has:p.locator('.strip.home')}).first();
const hd = home.locator('details.strip.home');
console.log('home loads open:', await hd.evaluate(el=>el.open));
const wl = home.locator('.waterline');
const y1 = (await wl.boundingBox()).y;
await home.locator('.strip.home > summary').click(); await p.waitForTimeout(300);
const y2 = (await wl.boundingBox()).y;
console.log('home collapse: waterline moved', (y2-y1).toFixed(0),'px (in flow, expected negative)');
console.log('home now open:', await hd.evaluate(el=>el.open));

// non-Home still overlays: zero shift
const loc = p.locator('.stage.phone').first();
const h1 = (await loc.locator('.pagebody .ph').boundingBox()).y;
await loc.locator('.strip > summary').click(); await p.waitForTimeout(300);
const h2 = (await loc.locator('.pagebody .ph').boundingBox()).y;
console.log('location page open: content shift', (h2-h1).toFixed(2),'px (expected 0)');

// corner truncation gone?
const exp=p.locator('.spec.exp').first();
await exp.locator('label[for="m-corner"]').click(); await p.waitForTimeout(250);
const trunc = await exp.locator('.face .place').nth(1).evaluate(el=>({t:el.textContent.trim(),clipped:el.scrollWidth>el.clientWidth+1}));
console.log('corner phone label:', JSON.stringify(trunc));
const cw = await exp.locator('.strip').boundingBox();
console.log('corner phone card width:', cw.width.toFixed(0));

const dexp=p.locator('.spec.desk-exp');
await dexp.locator('label[for="d-corner"]').click(); await p.waitForTimeout(250);
const dt = await dexp.locator('.face .place').nth(1).evaluate(el=>({t:el.textContent.trim(),clipped:el.scrollWidth>el.clientWidth+1}));
const dw = await dexp.locator('.strip').boundingBox();
console.log('corner desktop label:', JSON.stringify(dt), 'width', dw.width.toFixed(0));

const st=await p.locator('.stage.desk').first().boundingBox();
await p.screenshot({path:'v-desk.png',clip:{x:st.x-6,y:st.y-6,width:st.width+12,height:st.height+12}});
const hs=await home.boundingBox();
await p.screenshot({path:'v-home.png',clip:{x:hs.x-6,y:hs.y-6,width:hs.width+12,height:hs.height+12}});
await b.close();
