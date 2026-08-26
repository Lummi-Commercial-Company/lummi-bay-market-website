import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1100}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(800);
const probe=async(id,v)=>{await pg.evaluate(([id,v])=>{document.querySelector('#'+id+' .scroller').scrollTop=v;},[id,v]);
 await pg.waitForTimeout(400);
 return pg.evaluate(id=>{const st=document.getElementById(id);
   const sc=st.querySelector('.scroller');
   const doc=(el)=>el.getBoundingClientRect().top - st.getBoundingClientRect().top + sc.scrollTop;
   const line=st.querySelector('.oneline');
   return {scroll:sc.scrollTop, cond:st.querySelector('.fuelblock').classList.contains('cond'),
     promoDocTop:Math.round(doc(st.querySelector('.promo'))),
     lineClips: line.offsetParent? line.scrollWidth>line.clientWidth : null,
     lineNeed: line.scrollWidth, lineHas: line.clientWidth};},id);};
for(const id of ['i-phone','i-desk']){
  const a=await probe(id,0), b2=await probe(id,340);
  console.log(id, JSON.stringify(a), JSON.stringify(b2), '=> promo moved', b2.promoDocTop-a.promoDocTop,'px');
}
await b.close();
