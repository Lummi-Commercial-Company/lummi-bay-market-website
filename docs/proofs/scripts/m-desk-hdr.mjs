import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const pg = await b.newPage({viewport:{width:1200,height:1000}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(400);
console.log(JSON.stringify(await pg.evaluate(()=>{
  const st=document.getElementById('j-desk'), bar=st.querySelector('.sitebar');
  const o=bar.getBoundingClientRect();
  return {barH:Math.round(o.height),
    kids:[...bar.children].map(e=>{const r=e.getBoundingClientRect();
      return {c:e.className, l:Math.round(r.left-o.left), w:Math.round(r.width)};}),
    nav:[...st.querySelectorAll('.sitenav .nl')].map(e=>{const r=e.getBoundingClientRect();
      return {t:e.textContent.trim(), w:Math.round(r.width), h:Math.round(r.height)};})};
})));
await b.close();
