import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:900,height:700}});
await p.goto('file:///tmp/claude-0/-home-user-lummi-bay-market-website/21c83485-f133-5f64-be53-154ad32f55ba/scratchpad/pop.html');
console.log('chromium:', (await p.evaluate(()=>navigator.userAgent)).match(/Chrome\/[\d.]+/)[0]);
console.log('popover supported:', await p.evaluate(()=>HTMLElement.prototype.hasOwnProperty('popover')));
console.log('anchor-positioning supported:', await p.evaluate(()=>CSS.supports('position-anchor','--x')));

const open = () => p.evaluate(()=>document.getElementById('panel').matches(':popover-open'));
const heroY = () => p.evaluate(()=>document.getElementById('hero').getBoundingClientRect().top);

const y0 = await heroY();
await p.click('#btn'); await p.waitForTimeout(150);
console.log('after click button  -> open:', await open(), '| hero moved:', (await heroY()-y0).toFixed(1),'px');
const box = await p.locator('#panel').boundingBox();
const ab  = await p.locator('.anchor').boundingBox();
console.log('panel anchored below block:', (box.y - (ab.y+ab.height)).toFixed(1),'px gap, left aligned:', (box.x-ab.x).toFixed(1));

await p.mouse.click(800, 650); await p.waitForTimeout(150);
console.log('after click OUTSIDE -> open:', await open(), '  <-- light dismiss');
await p.click('#btn'); await p.waitForTimeout(150);
await p.keyboard.press('Escape'); await p.waitForTimeout(150);
console.log('after Escape        -> open:', await open(), '  <-- keyboard dismiss');
await p.click('#btn'); await p.waitForTimeout(100);
await p.evaluate(()=>window.scrollTo(0,300)); await p.waitForTimeout(200);
const b2=await p.locator('#panel').boundingBox(), a2=await p.locator('.anchor').boundingBox();
console.log('after scroll, still glued to block:', Math.abs(b2.y-(a2.y+a2.height))<2);
await b.close();
