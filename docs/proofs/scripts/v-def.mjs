import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const pg = await b.newPage({viewport:{width:1400,height:1000}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(400);
for (const id of ['j-desk','j-desk-int','j-desk-ts','j-phone','j-phone-int','j-phone-ts']) {
  const r = await pg.evaluate((id)=>{
    const st=document.getElementById(id), bl=st.querySelector('.fuelblock');
    const vis = sel => [...st.querySelectorAll(sel)].filter(e=>getComputedStyle(e).display!=='none')
                        .map(e=>e.textContent.trim()).filter(Boolean);
    bl.open=false; bl.classList.remove('cond');
    const shutCols = vis('.stacked .gh'), shutH = Math.round(bl.getBoundingClientRect().height);
    bl.open=true;
    const openCols = vis('.stacked .gh'), openH = Math.round(bl.getBoundingClientRect().height);
    return {shutCols, openCols, shutH, openH};
  }, id);
  console.log(id, JSON.stringify(r));
}
await b.close();
