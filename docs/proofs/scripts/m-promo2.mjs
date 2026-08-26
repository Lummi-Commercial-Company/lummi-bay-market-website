import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:1100}});
await p.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await p.waitForTimeout(400);
const r=await p.evaluate(()=>{
  const o={};
  for(const id of ['j-desk-int','j-desk-ts']){
    const st=document.querySelector('#'+id); if(!st){o[id]='missing';continue;}
    const sc=st.querySelector('.scroller');
    const top=el=>Math.round(el.getBoundingClientRect().top-sc.getBoundingClientRect().top+sc.scrollTop);
    const t=st.querySelector('.herotitle'), reg=st.querySelector('.promoregion');
    const rail=st.querySelector('.railcol');
    o[id]={titleTop:t?top(t):null, promoTop:reg?top(reg):null,
      railTop:rail?top(rail):null,
      promoBelowTitle: (t&&reg)? top(reg)>top(t):null,
      promoH: reg?Math.round(reg.getBoundingClientRect().height):null};
  }
  return o;});
console.log(JSON.stringify(r,null,1));await b.close();
