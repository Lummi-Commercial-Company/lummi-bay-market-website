import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1200}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(800);
console.log(JSON.stringify(await pg.evaluate(()=>{const st=document.getElementById('j-desk');
  const reg=st.querySelector('.promoregion').getBoundingClientRect();
  return {region:Math.round(reg.width),
    promos:[...st.querySelectorAll('.promoregion .promo')].map(e=>
      (e.className.replace('promo','').trim()||'full')+' = '+Math.round(e.getBoundingClientRect().width)+'px ('
      +Math.round(e.getBoundingClientRect().width/reg.width*100)+'%)')};})));
// what a 20% promo would actually measure at common desktop widths
for(const w of [1280,1440,1920]) console.log('20% of a '+w+'px viewport ≈ '+Math.round((w-44)*0.2)+'px of content');
await b.close();
