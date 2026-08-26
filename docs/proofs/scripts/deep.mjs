import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1400},deviceScaleFactor:1.5});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(900);
for(const id of ['j-desk','j-phone']){
  for(const v of [0,300,900,1600]){
    await pg.evaluate(([id,v])=>{document.querySelector('#'+id+' .scroller').scrollTop=v;},[id,v]);
    await pg.waitForTimeout(300);
    const r=await pg.evaluate(id=>{const st=document.getElementById(id),sr=st.getBoundingClientRect();
      const l=st.querySelector('.oneline');const lr=l.getBoundingClientRect();
      const vis = lr.top>=sr.top-2 && lr.bottom<=sr.bottom+2 && l.offsetParent!==null;
      const sc=st.querySelector('.scroller');
      return {y:Math.round(sc.scrollTop), cond:st.querySelector('.fuelblock').classList.contains('cond'),
        barTopInFrame:Math.round(lr.top-sr.top), visible:vis};},id);
    console.log(id, JSON.stringify(r));
  }
}
await pg.evaluate(()=>{document.querySelector('#j-desk .scroller').scrollTop=900;});
await pg.waitForTimeout(400);
await pg.locator('#j-desk').screenshot({path:'p-desk-deep.png'});
await b.close();
