import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1700,height:1100},deviceScaleFactor:1.5});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(700);
const ids=['i-desk-shut','i-desk-open','i-phone-shut','i-phone-open'];
console.log(JSON.stringify(await pg.evaluate(ids=>ids.map(id=>{
  const st=document.getElementById(id),sr=st.getBoundingClientRect();
  const bd=st.querySelector('.band'),br=bd.getBoundingClientRect();
  const cells=[...st.querySelectorAll('.cell')];
  const clipped=cells.filter(c=>c.offsetParent!==null&&c.scrollWidth>c.clientWidth+1).map(c=>c.querySelector('.cp').textContent);
  return {id,stageW:Math.round(sr.width),bandW:Math.round(br.width),
    pct:Math.round(br.width/sr.width*100),bandH:Math.round(br.height),
    cells:cells.length,clipped};
}),ids),null,1));
for(const id of ids) await pg.locator('#'+id).screenshot({path:'v-'+id+'.png'});
await b.close();
