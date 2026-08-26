import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1200}});
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(800);
for(const id of ['j-desk','j-phone']){
  const before=await pg.evaluate(id=>{const d=document.querySelector('#'+id+' .fuelblock');
    const p=d.querySelector('.condpanel');const cs=getComputedStyle(p);
    return {open:d.open, panelDisplay:cs.display, panelVis:cs.visibility, panelH:Math.round(p.getBoundingClientRect().height)};},id);
  // click the summary the way a person would
  try{ await pg.locator('#'+id+' .fuelblock > summary').click({timeout:2000}); }
  catch(e){ console.log(id,'CLICK FAILED:', e.message.split('\n')[0]); }
  await pg.waitForTimeout(300);
  const after=await pg.evaluate(id=>{const d=document.querySelector('#'+id+' .fuelblock');
    const p=d.querySelector('.condpanel');const cs=getComputedStyle(p);
    const r=p.getBoundingClientRect();
    return {open:d.open, panelDisplay:cs.display, panelH:Math.round(r.height),
      panelW:Math.round(r.width), panelTop:Math.round(r.top), zIndex:cs.zIndex,
      pe:getComputedStyle(d).pointerEvents};},id);
  console.log(id,'before',JSON.stringify(before));
  console.log(id,'after ',JSON.stringify(after));
}
console.log('errors:',errs.length?errs:'none');
await b.close();
