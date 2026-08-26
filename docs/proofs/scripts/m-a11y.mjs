import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:1100}});
await p.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await p.waitForTimeout(400);
console.log(JSON.stringify(await p.evaluate(()=>{
  const st=document.querySelector('#j-desk');
  return {promoNames:[...st.querySelectorAll('.promo')].map(a=>
            (a.getAttribute('aria-label')||a.textContent).replace(/\s+/g,' ').trim()),
          decorHidden:[...st.querySelectorAll('.motif,.shoreline')].every(e=>e.getAttribute('aria-hidden')==='true'),
          motifCount:st.querySelectorAll('.motif').length};}),null,1));
await b.close();
