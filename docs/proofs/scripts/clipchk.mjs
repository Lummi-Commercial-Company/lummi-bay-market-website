import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1200}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(800);
await pg.evaluate(()=>{for(const id of ['i-desk','i-phone']){
  document.querySelector('#'+id+' .scroller').scrollTop=340;
  document.querySelector('#'+id+' .fuelblock').open=true;}});
await pg.waitForTimeout(450);
console.log(JSON.stringify(await pg.evaluate(()=>{const o={};
 for(const id of ['i-desk','i-phone']){const st=document.getElementById(id),sr=st.getBoundingClientRect();
   const p=st.querySelector('.condpanel').getBoundingClientRect();
   const places=[...st.querySelectorAll('.condpanel .place')];
   o[id]={panel:Math.round(p.width), leftOverflow:Math.round(sr.left-p.left),
     rightOverflow:Math.round(p.right-sr.right),
     names:places.map(x=>x.textContent),
     truncated:places.filter(x=>x.scrollWidth>x.clientWidth+1).map(x=>x.textContent)};}
 return o;}),null,1));
await b.close();
