import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1200},deviceScaleFactor:2});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(700);
const ids=['f-home-desk','f-int-desk','f-home-phone','f-int-phone','f-int-chip'];
const out=await pg.evaluate(ids=>ids.map(id=>{
  const st=document.getElementById(id); if(!st) return {id,err:'missing'};
  const sr=st.getBoundingClientRect();
  const rail=st.querySelector('.rail'), rr=rail.getBoundingClientRect();
  const top=rail.firstElementChild&&!rail.firstElementChild.classList.contains('strip')?rail.firstElementChild.getBoundingClientRect():null;
  const strip=st.querySelector('.strip').getBoundingClientRect();
  const h1=st.querySelector('.pagebody .ph').getBoundingClientRect();
  return {id, stageW:Math.round(sr.width),
    railTop:+(rr.top-sr.top).toFixed(1), railH:+rr.height.toFixed(1),
    topEl: top?{w:Math.round(top.width),h:Math.round(top.height)}:null,
    stripW:Math.round(strip.width), stripH:+strip.height.toFixed(1),
    railBottom:+(rr.bottom-sr.top).toFixed(1),
    headingTop:+(h1.top-sr.top).toFixed(1),
    headingUnderRail: h1.top < rr.bottom && h1.right > rr.left};
}),ids);
console.log(JSON.stringify(out,null,1));
for(const id of ids){await pg.locator('#'+id).screenshot({path:'v-'+id+'.png'});}
await b.close();
