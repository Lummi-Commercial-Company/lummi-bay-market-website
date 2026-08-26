import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const pg = await b.newPage({viewport:{width:900,height:1200}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(400);
for (const w of [375,360,320]) {
  const r = await pg.evaluate((w)=>{
    const st=document.getElementById('j-phone'); st.style.width=w+'px';
    const bar=st.querySelector('.sitebar');
    const cs=getComputedStyle(bar);
    const pad=parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight);
    const kids=[...bar.children];
    const need=kids.reduce((a,e)=>a+e.getBoundingClientRect().width,0)+(kids.length-1)*parseFloat(cs.gap);
    const nav=[...st.querySelectorAll('.sitenav .nl')].map(e=>{const b=e.getBoundingClientRect();
      return {t:e.textContent.trim(), w:+b.width.toFixed(0), h:+b.height.toFixed(0)};});
    const pill=(()=>{const e=st.querySelector('.rewards-hit'), b=e.getBoundingClientRect();
      return {t:e.textContent.trim().replace(/\s+/g,' '), w:+b.width.toFixed(0), h:+b.height.toFixed(0)};})();
    return {width:w, barH:+bar.getBoundingClientRect().height.toFixed(0),
            available:+(bar.getBoundingClientRect().width-pad).toFixed(0), needed:+need.toFixed(0),
            overflow: bar.scrollWidth>bar.clientWidth, nav, pill};
  }, w);
  console.log(JSON.stringify(r));
}
await pg.evaluate(()=>{document.getElementById('j-phone').style.width='';});
await b.close();
