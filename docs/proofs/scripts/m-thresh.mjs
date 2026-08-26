import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:1100}});
await p.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await p.waitForTimeout(400);
const r=await p.evaluate(()=>{const out={};
 for(const k of [1,0.75,0.6,0.5]){const rows={};
  for(const id of ['j-phone','j-phone-int','j-phone-ts','j-desk','j-desk-int','j-desk-ts']){
   const sc=document.querySelector('#'+id+' .scroller');
   const max=sc.scrollHeight-sc.clientHeight, trig=k*sc.clientHeight;
   rows[id]= trig>=max ? 'never'
     : Math.round((max-trig)/max*100)+'% of scroll';}
  out['x'+k]=rows;}
 return out;});
console.log(JSON.stringify(r,null,1));await b.close();
