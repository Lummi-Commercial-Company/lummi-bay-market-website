import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const pg = await b.newPage({viewport:{width:1500,height:1200}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(400);
console.log(JSON.stringify(await pg.evaluate(()=>{
  const st=document.getElementById('j-phone'), bar=st.querySelector('.sitebar');
  const o=bar.getBoundingClientRect();
  const kids=[...bar.children].map(e=>{const b=e.getBoundingClientRect();
    return {c:e.className, l:Math.round(b.left-o.left), r:Math.round(b.right-o.left), w:Math.round(b.width)};});
  return {barW:Math.round(o.width), scrollW:bar.scrollWidth, clientW:bar.clientWidth, kids};
})));
await b.close();
