import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1400},deviceScaleFactor:1.5});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(900);
await pg.locator('#j-desk').screenshot({path:'p-desk-rest.png'});
await pg.locator('#j-phone').screenshot({path:'p-phone-rest.png'});
await pg.evaluate(()=>{for(const id of ['j-desk','j-phone'])
  document.querySelector('#'+id+' .scroller').scrollTop=300;});
await pg.waitForTimeout(500);
console.log(JSON.stringify(await pg.evaluate(()=>{const o={};
 for(const id of ['j-desk','j-phone']){const st=document.getElementById(id);
   const l=st.querySelector('.oneline').getBoundingClientRect();
   const line=st.querySelector('.oneline');
   o[id]={line:Math.round(l.width)+'x'+Math.round(l.height), clips:line.scrollWidth>line.clientWidth};}
 return o;})));
await pg.locator('#j-desk').screenshot({path:'p-desk-cond.png'});
await pg.locator('#j-phone').screenshot({path:'p-phone-cond.png'});
await b.close();
