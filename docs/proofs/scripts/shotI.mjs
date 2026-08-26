import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1700,height:1200},deviceScaleFactor:1.5});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(700);
console.log(JSON.stringify(await pg.evaluate(()=>{
  const o={};for(const id of ['i-desk-shut','i-phone-shut']){const st=document.getElementById(id);
    const pr=st.querySelector('.promo').getBoundingClientRect();
    const h1=st.querySelector('.ph').getBoundingClientRect(); const sr=st.getBoundingClientRect();
    o[id]={promo:Math.round(pr.width)+'x'+Math.round(pr.height),
      titleTop:Math.round(h1.top-sr.top), stageH:Math.round(sr.height)};}
  return o;})));
for(const id of ['i-desk-shut','i-phone-shut']) await pg.locator('#'+id).screenshot({path:'v-'+id+'.png'});
await b.close();
