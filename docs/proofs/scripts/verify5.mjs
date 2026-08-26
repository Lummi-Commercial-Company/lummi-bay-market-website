import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1200},deviceScaleFactor:2});
const errs=[];pg.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(700);
const ids=['f-home-desk','f-int-desk','f-home-phone','f-int-phone'];
const out=await pg.evaluate(ids=>ids.map(id=>{
  const st=document.getElementById(id); if(!st)return{id,err:'missing'};
  const sr=st.getBoundingClientRect(), rail=st.querySelector('.rail').getBoundingClientRect();
  const slim=st.querySelector('.rewards-slim').getBoundingClientRect();
  const strip=st.querySelector('.strip').getBoundingClientRect();
  return {id,stageW:Math.round(sr.width),railH:+rail.height.toFixed(1),
    slimH:+slim.height.toFixed(1),slimW:Math.round(slim.width),
    stripW:Math.round(strip.width),stripH:+strip.height.toFixed(1)};
}),ids);
console.log(JSON.stringify(out));
// sticky proof: scroll one frame and check the header stays at the stage top
const sticky=await pg.evaluate(()=>{
  const st=document.getElementById('f-int-phone'), sc=st.querySelector('.scroller');
  const bar=st.querySelector('.sitebar');
  const at=()=>+(bar.getBoundingClientRect().top-st.getBoundingClientRect().top).toFixed(1);
  const before=at(); sc.scrollTop=260;
  const railTop=+(st.querySelector('.rail').getBoundingClientRect().top-st.getBoundingClientRect().top).toFixed(1);
  return {barBefore:before, barAfterScroll260:at(), railAfterScroll260:railTop, scrolled:sc.scrollTop};
});
console.log('sticky:',JSON.stringify(sticky));
console.log('console errors:',errs.length?errs:'none');
await pg.locator('#f-int-phone').screenshot({path:'v-g-scrolled.png'});
await pg.locator('#f-home-desk').screenshot({path:'v-g-home-desk.png'});
await b.close();
