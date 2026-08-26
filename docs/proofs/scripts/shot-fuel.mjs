import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const pg = await b.newPage({viewport:{width:1400,height:1000}, deviceScaleFactor:2});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(500);
async function shot(id, scroll, name){
  await pg.evaluate(async ([id,scroll])=>{
    const st=document.getElementById(id), sc=st.querySelector('.scroller'), bl=st.querySelector('.fuelblock');
    bl.open=false; sc.scrollTop=scroll;
    await new Promise(r=>setTimeout(r,340));
    bl.querySelector('summary').click();
  },[id,scroll]);
  await pg.waitForTimeout(250);
  const el = await pg.$('#'+id);
  await el.scrollIntoViewIfNeeded(); await pg.waitForTimeout(150);
  await el.screenshot({path:name});
}
await shot('j-desk-int',0,'f-desk-rest.png');
await shot('j-desk-int',260,'f-desk-cond.png');
await shot('j-phone-int',260,'f-phone-cond.png');
await b.close();
