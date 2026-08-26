import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const pg = await b.newPage({viewport:{width:900,height:1200}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(400);
for (const id of ['j-phone','j-phone-int','j-desk','j-desk-int']) {
  console.log(id, JSON.stringify(await pg.evaluate(async (id)=>{
    const st=document.getElementById(id), sc=st.querySelector('.scroller'), bl=st.querySelector('.fuelblock');
    sc.scrollTop=300; await new Promise(r=>setTimeout(r,350));
    const bar=st.querySelector('.sitebar').getBoundingClientRect();
    const el=bl.classList.contains('cond')? bl.querySelector('.oneline') : bl;
    const r=el.getBoundingClientRect();
    bl.querySelector('summary').click(); await new Promise(r=>setTimeout(r,150));
    const p=st.querySelector('.condpanel').getBoundingClientRect();
    return {cond:bl.classList.contains('cond'),
      gapUnderHeader:+(r.top-bar.bottom).toFixed(0),
      panelBelowHeader: +(p.top-bar.bottom).toFixed(0) };
  }, id)));
}
await b.close();
