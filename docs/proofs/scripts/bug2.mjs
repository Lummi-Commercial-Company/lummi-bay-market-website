import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1200}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(800);
const state=async(id)=>pg.evaluate(id=>{const st=document.getElementById(id),sr=st.getBoundingClientRect();
  const d=st.querySelector('.fuelblock'),p=d.querySelector('.condpanel');
  const r=p.getBoundingClientRect();
  return {cond:d.classList.contains('cond'), open:d.open,
    display:getComputedStyle(p).display,
    insideFrame: r.height>0 && r.top>=sr.top-1 && r.bottom<=sr.bottom+1,
    topInFrame:Math.round(r.top-sr.top), h:Math.round(r.height)};},id);
for(const id of ['j-desk','j-phone']){
  // RESTING: click to expand
  await pg.locator('#'+id+' .fuelblock > summary').click();
  await pg.waitForTimeout(250);
  console.log(id,'resting + clicked :',JSON.stringify(await state(id)));
  await pg.locator('#'+id+' .fuelblock > summary').click(); await pg.waitForTimeout(200);
  // CONDENSED: scroll, then click the bar
  await pg.evaluate(id=>{document.querySelector('#'+id+' .scroller').scrollTop=320;},id);
  await pg.waitForTimeout(450);
  await pg.locator('#'+id+' .fuelblock .oneline').click({force:true});
  await pg.waitForTimeout(250);
  console.log(id,'condensed + clicked:',JSON.stringify(await state(id)));
}
await b.close();
