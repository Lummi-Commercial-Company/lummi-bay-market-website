import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const pg = await b.newPage({viewport:{width:1500,height:1200}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(300);
console.log(JSON.stringify(await pg.evaluate(()=>{
  const st=document.getElementById('j-phone');
  const bar=st.querySelector('.sitebar').getBoundingClientRect();
  return {barH:Math.round(bar.height),
    nav:[...st.querySelectorAll('.sitenav span')].map(e=>{const b=e.getBoundingClientRect();
      return {t:e.textContent, w:Math.round(b.width), h:Math.round(b.height)};}),
    pill:(()=>{const b=st.querySelector('.rewards-chip').getBoundingClientRect();
      return {w:Math.round(b.width),h:Math.round(b.height)};})()};
})));
await b.close();
