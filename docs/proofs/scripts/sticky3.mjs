import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:700},deviceScaleFactor:2});
await pg.goto('file://'+process.cwd()+'/sticky2.html');
await pg.click('#btn'); await pg.waitForTimeout(150);
// scroll in small steps, the way a person does
for(const y of [0,100,200,300,400,500]){
  await pg.mouse.wheel(0,100); await pg.waitForTimeout(120);
}
await pg.waitForTimeout(300);
const m=await pg.evaluate(()=>{const g=id=>{const r=document.getElementById(id).getBoundingClientRect();return {t:+r.top.toFixed(1)};};
  return {y:window.scrollY,anchor:g('anchor').t,panel:g('panel').t,drift:+(g('panel').t-g('anchor').t).toFixed(1)};});
console.log('wheel-scrolled:',JSON.stringify(m));
await pg.screenshot({path:'v-drift.png'});
await b.close();
