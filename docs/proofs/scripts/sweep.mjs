import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:2100,height:1000}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(700);
for(const w of [1024,1152,1280,1366,1440,1600,1920]){
  const r=await pg.evaluate(async w=>{
    const st=document.getElementById('h-wide'); st.style.width=w+'px';
    st.querySelector('.scroller').scrollTop=500;
    await new Promise(r=>setTimeout(r,350));
    const bl=document.getElementById('h-block'), l=document.getElementById('h-line');
    const bw=Math.round(bl.getBoundingClientRect().width);
    return {bar:bw, pct:Math.round(bw/w*100), clips:l.scrollWidth>l.clientWidth,
      need:l.scrollWidth, has:l.clientWidth};
  },w);
  console.log('viewport',w,'→ bar',r.bar+'px ('+r.pct+'%)', r.clips?'*** CLIPS':'fits', `need ${r.need}/${r.has}`);
}
await b.close();
