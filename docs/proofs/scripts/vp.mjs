import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1400},deviceScaleFactor:1.5});
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(900);
const ids=['j-desk','j-desk-int','j-phone','j-phone-int'];
const probe=async(id,v)=>{await pg.evaluate(([id,v])=>{document.querySelector('#'+id+' .scroller').scrollTop=v;},[id,v]);
 await pg.waitForTimeout(400);
 return pg.evaluate(id=>{const st=document.getElementById(id),sr=st.getBoundingClientRect();
  const bl=st.querySelector('.fuelblock'),br=bl.getBoundingClientRect();
  const sc=st.querySelector('.scroller');
  const pr=[...st.querySelectorAll('.promoregion .promo')].map(e=>Math.round(e.getBoundingClientRect().width));
  const cards=[...st.querySelectorAll('.loccard h4, .truckcall h4')].map(e=>e.textContent.trim());
  const hero=st.querySelector('.herotitle').getBoundingClientRect();
  const region=st.querySelector('.promoregion').getBoundingClientRect();
  return {open:bl.open, cond:bl.classList.contains('cond'),
    block:Math.round(br.width)+'x'+Math.round(br.height),
    promos:pr, promoRegionTop:Math.round(region.top-sr.top+sc.scrollTop),
    order:cards, heroTop:Math.round(hero.top-sr.top+sc.scrollTop)};},id);};
for(const id of ids){const a=await probe(id,0), c=await probe(id,300);
  console.log(id,'rest ',JSON.stringify(a));
  console.log(id,'scrol',JSON.stringify({cond:c.cond,block:c.block,promoRegionTop:c.promoRegionTop}),
    'region moved',c.promoRegionTop-a.promoRegionTop);}
console.log('errors:',errs.length?errs:'none');
await b.close();
