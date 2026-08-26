import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1100},deviceScaleFactor:1.5});
const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(700);
console.log(JSON.stringify(await pg.evaluate(()=>{
  const o={};
  for(const id of ['i-desk-shut','i-phone-shut']){
    const st=document.getElementById(id),sr=st.getBoundingClientRect();
    const pr=st.querySelector('.promo').getBoundingClientRect();
    const h1=st.querySelector('.ph').getBoundingClientRect();
    const strip=st.querySelector('.strip').getBoundingClientRect();
    const navN=st.querySelectorAll('.sitenav span').length;
    o[id]={navItems:navN, pill:!!st.querySelector('.rewards-chip'),
      card:Math.round(strip.width)+'x'+Math.round(strip.height),
      promo:Math.round(pr.width)+'x'+Math.round(pr.height),
      titleTop:Math.round(h1.top-sr.top)};
  }
  o.navWithFuelPrices=[...document.querySelectorAll('.sitenav')].some(n=>/Fuel Prices/.test(n.textContent));
  return o;}),null,1));
console.log('page errors:',errs.length?errs:'none');
for(const id of ['i-desk-shut','i-phone-shut']) await pg.locator('#'+id).screenshot({path:'v-'+id+'.png'});
await b.close();
