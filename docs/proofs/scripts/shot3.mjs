import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const f='file:///tmp/claude-0/-home-user-lummi-bay-market-website/21c83485-f133-5f64-be53-154ad32f55ba/scratchpad/fuel-strip-proof.html';
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1400,height:1100},deviceScaleFactor:2});
await p.goto(f,{waitUntil:'load'}); await p.waitForTimeout(1200);
const board = p.locator('section.plate').filter({hasText:'Rewards takes the top'}).locator('.board');
await board.scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
await board.screenshot({path:'v-rail.png'});
// measure the phone first-screen cost
const ph = p.locator('.stage.phone').filter({has:p.locator('.rewards-ph')}).first();
const r = await ph.locator('.rewards-ph').boundingBox();
const st = await ph.locator('.strip').boundingBox();
const stage = await ph.boundingBox();
console.log(`phone Home: rewards card ${r.height.toFixed(0)}px + price block ${st.height.toFixed(0)}px = ${(r.height+st.height).toFixed(0)}px of a ${stage.height}px screen`);
await b.close();
