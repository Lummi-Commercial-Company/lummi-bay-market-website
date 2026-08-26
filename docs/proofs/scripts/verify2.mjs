import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const file='file:///tmp/claude-0/-home-user-lummi-bay-market-website/21c83485-f133-5f64-be53-154ad32f55ba/scratchpad/fuel-strip-proof.html';
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1240,height:1200},deviceScaleFactor:2});
await p.goto(file,{waitUntil:'load'}); await p.waitForTimeout(1200);

// offset measured INSIDE the frame, immune to outer page reflow
const rel = async (stage, sel) => stage.evaluate((st, s) => {
  const a = st.getBoundingClientRect(), b = st.querySelector(s).getBoundingClientRect();
  return +(b.top - a.top).toFixed(2);
}, sel);

// --- non-Home: overlay, must not move page content ---
const loc = p.locator('.stage.phone').first();
const before = await rel(loc, '.pagebody .ph');
await loc.locator('.strip > summary').click(); await p.waitForTimeout(320);
const after  = await rel(loc, '.pagebody .ph');
console.log(`LOCATION PAGE (overlay)  headline offset ${before} -> ${after}   shift ${(after-before).toFixed(2)}px  [expect 0]`);
await loc.locator('.strip > summary').click(); await p.waitForTimeout(200);

// --- Home: in flow, content is SUPPOSED to move ---
const home = p.locator('.stage.phone').filter({has:p.locator('.strip.home')}).first();
console.log('HOME loads expanded:', await home.locator('details.strip.home').evaluate(e=>e.open));
const hb = await rel(home, '.waterline');
await home.locator('.strip.home > summary').click(); await p.waitForTimeout(320);
const ha = await rel(home, '.waterline');
console.log(`HOME (in flow)           waterline offset ${hb} -> ${ha}   shift ${(ha-hb).toFixed(2)}px  [expect negative]`);
console.log('HOME collapses to:', await home.locator('.strip.home .face').isVisible() ? 'B1 two groups' : 'nothing');
await home.locator('.strip.home > summary').click(); await p.waitForTimeout(200);

await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(200);
const shots = [['.stage.desk','v-desk.png'],['.stage.phone:has(.strip.home)','v-home.png']];
for (const [sel,out] of shots) {
  const el = p.locator(sel).first();
  await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
  await el.screenshot({path:out});
}
await b.close();
