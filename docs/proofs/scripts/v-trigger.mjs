import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const pg = await b.newPage({viewport:{width:1400,height:1000}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(400);
for (const id of ['j-desk','j-desk-int','j-desk-ts','j-phone','j-phone-int','j-phone-ts']) {
  const r = await pg.evaluate(async (id)=>{
    const st=document.getElementById(id), sc=st.querySelector('.scroller'), bl=st.querySelector('.fuelblock');
    sc.scrollTop=0; bl.open=false; await new Promise(r=>setTimeout(r,300));
    const h = Math.round(bl.getBoundingClientRect().height);
    let fired=null;
    for (let y=0; y<=260; y+=4){
      sc.scrollTop=y; await new Promise(r=>setTimeout(r,45));
      if (bl.classList.contains('cond')) { fired=y; break; }
    }
    return {cardH:h, half:Math.round(h/2), condensedAt:fired};
  }, id);
  console.log(id, JSON.stringify(r));
}
await b.close();
