import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const f='file:///tmp/claude-0/-home-user-lummi-bay-market-website/21c83485-f133-5f64-be53-154ad32f55ba/scratchpad/fuel-strip-proof.html';
const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1240,height:1000}});
await p.goto(f,{waitUntil:'load'}); await p.waitForTimeout(1000);
const open=()=>p.evaluate(()=>document.getElementById('fuelpanel').matches(':popover-open'));
const heroY=()=>p.evaluate(()=>document.querySelector('.mech-body .ph').getBoundingClientRect().top);
await p.locator('#fuelcard .popbtn').scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
const y0=await heroY();
await p.locator('#fuelcard .popbtn').click(); await p.waitForTimeout(200);
console.log('open:',await open(),'| hero moved:',(await heroY()-y0).toFixed(1),'px');
const c=await p.locator('#fuelcard').boundingBox(), pa=await p.locator('#fuelpanel').boundingBox();
console.log('panel covers card: dx',(pa.x-c.x).toFixed(1),'dy',(pa.y-c.y).toFixed(1));
await p.locator('.mech-body .ph').click(); await p.waitForTimeout(200);
console.log('outside click ->',await open());
await p.locator('#fuelcard .popbtn').click(); await p.waitForTimeout(200);
await p.keyboard.press('Escape'); await p.waitForTimeout(200);
console.log('Escape       ->',await open());
// corner placement on plate A
for (const [sel,label] of [['.stage.phone','phone'],['.stage.desk','desk']]) {
  const st=await p.locator(sel).first().boundingBox();
  const bl=await p.locator(sel+' .slot.pos-corner .strip').first().boundingBox();
  console.log(`plate A ${label}: card w=${bl.width.toFixed(0)} right-gap=${(st.x+st.width-(bl.x+bl.width)).toFixed(0)}`);
}
await b.close();
