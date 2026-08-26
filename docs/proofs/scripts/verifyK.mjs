import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1100},deviceScaleFactor:1.5});
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(800);
const at=async(id,v)=>{await pg.evaluate(([id,v])=>{document.querySelector('#'+id+' .scroller').scrollTop=v;},[id,v]);
 await pg.waitForTimeout(400);
 return pg.evaluate(id=>{const st=document.getElementById(id),sr=st.getBoundingClientRect();
   const bl=st.querySelector('.fuelblock').getBoundingClientRect();
   const pr=st.querySelector('.promo').getBoundingClientRect();
   const h1=st.querySelector('.ph').getBoundingClientRect();
   const cond=st.querySelector('.fuelblock').classList.contains('cond');
   return {cond, block:Math.round(bl.width)+'x'+Math.round(bl.height),
     promo:Math.round(pr.width)+'x'+Math.round(pr.height),
     promoRight:Math.round(pr.right-sr.left), blockLeft:Math.round(bl.left-sr.left),
     gap:Math.round(bl.left-pr.right), titleTop:Math.round(h1.top-sr.top)};},id);};
for(const id of ['i-desk','i-phone']){
  console.log(id,'rest ', JSON.stringify(await at(id,0)));
  console.log(id,'scrol', JSON.stringify(await at(id,320)));
}
console.log('errors:',errs.length?errs:'none');
await b.close();
