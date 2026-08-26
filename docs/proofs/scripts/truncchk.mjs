import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:2000,height:1000},deviceScaleFactor:1.5});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(700);
for(const w of [1024,1280,1440,1920]){
  const r=await pg.evaluate(async w=>{
    const st=document.getElementById('h-wide'); st.style.width=w+'px';
    st.querySelector('.scroller').scrollTop=500;
    document.getElementById('h-block').open=true;
    await new Promise(r=>setTimeout(r,300));
    const places=[...document.querySelectorAll('#h-block .condpanel .place')];
    const line=document.getElementById('h-line');
    return {truncated:places.filter(p=>p.scrollWidth>p.clientWidth+1).map(p=>p.textContent),
      lineClips:line.scrollWidth>line.clientWidth,
      panelW:Math.round(document.querySelector('#h-block .condpanel').getBoundingClientRect().width)};
  },w);
  console.log(w, JSON.stringify(r));
}
await pg.evaluate(()=>{document.getElementById('h-wide').style.width='1280px';});
await pg.waitForTimeout(400);
await pg.locator('#h-wide').screenshot({path:'v-h2.png'});
await pg.evaluate(()=>{document.getElementById('h-block').open=false;});
await pg.waitForTimeout(300);
await pg.locator('#h-wide').screenshot({path:'v-h1.png'});
await b.close();
