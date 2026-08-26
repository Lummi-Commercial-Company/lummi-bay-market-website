import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1200}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(800);
const state=async(id)=>pg.evaluate(id=>{const st=document.getElementById(id),sr=st.getBoundingClientRect();
  const d=st.querySelector('.fuelblock'),p=d.querySelector('.condpanel');
  const bar=d.querySelector('.oneline').getBoundingClientRect();
  const r=p.getBoundingClientRect();
  const places=[...p.querySelectorAll('.place')].map(x=>x.textContent);
  return {cond:d.classList.contains('cond'), open:d.open, display:getComputedStyle(p).display,
    inside: r.height>0 && r.top>=sr.top-1 && r.bottom<=sr.bottom+1,
    gapUnderBar: Math.round(r.top-bar.bottom), panelW:Math.round(r.width), places};},id);
for(const id of ['j-desk','j-phone','j-desk-int','j-phone-int']){
  await pg.evaluate(id=>{document.querySelector('#'+id+' .scroller').scrollTop=320;},id);
  await pg.waitForTimeout(450);
  const closedAfterCondense = await pg.evaluate(id=>document.querySelector('#'+id+' .fuelblock').open,id);
  await pg.locator('#'+id+' .fuelblock .oneline').click();
  await pg.waitForTimeout(250);
  console.log(id,'auto-closed on condense:',closedAfterCondense===false,'| after click:',JSON.stringify(await state(id)));
}
await b.close();
