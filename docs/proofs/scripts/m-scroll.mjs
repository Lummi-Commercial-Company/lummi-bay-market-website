import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:1100}});
await p.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await p.waitForTimeout(500);
const r=await p.evaluate(()=>{const o={};
  for(const id of ['j-phone','j-phone-int','j-phone-ts','j-desk','j-desk-int','j-desk-ts']){
    const sc=document.querySelector('#'+id+' .scroller');
    o[id]={client:sc.clientHeight, content:sc.scrollHeight,
      maxScroll:sc.scrollHeight-sc.clientHeight,
      screens:+(sc.scrollHeight/sc.clientHeight).toFixed(2)};}
  return o;});
console.log(JSON.stringify(r,null,1));await b.close();
