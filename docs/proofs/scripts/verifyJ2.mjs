import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1300},deviceScaleFactor:1.5});
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(900);
const probe=async(id,v)=>{await pg.evaluate(([id,v])=>{document.querySelector('#'+id+' .scroller').scrollTop=v;},[id,v]);
 await pg.waitForTimeout(400);
 return pg.evaluate(id=>{const st=document.getElementById(id),sr=st.getBoundingClientRect();
   const bl=st.querySelector('.fuelblock');const br=bl.getBoundingClientRect();
   const hero=st.querySelector('.herotitle').getBoundingClientRect();
   const sc=st.querySelector('.scroller');
   const places=[...st.querySelectorAll('.fuelblock .place')].map(x=>x.textContent);
   return {cond:bl.classList.contains('cond'), block:Math.round(br.width)+'x'+Math.round(br.height),
     heroDocTop:Math.round(hero.top-sr.top+sc.scrollTop), places};},id);};
for(const id of ['j-desk','j-phone']){
  const a=await probe(id,0), c=await probe(id,420);
  console.log(id,'rest ',JSON.stringify(a));
  console.log(id,'scrol',JSON.stringify(c),'hero moved',c.heroDocTop-a.heroDocTop,'px');
}
console.log('errors:',errs.length?errs:'none');
await pg.locator('#j-desk').screenshot({path:'v-j-desk.png'});
await pg.locator('#j-phone').screenshot({path:'v-j-phone.png'});
await b.close();
