import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const pg = await b.newPage({viewport:{width:1500,height:1200}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(300);
console.log(JSON.stringify(await pg.evaluate(()=>{
  const st=document.getElementById('j-phone'), bar=st.querySelector('.sitebar');
  const cs=getComputedStyle(bar);
  const need = [...bar.children].reduce((a,e)=>a+e.getBoundingClientRect().width,0);
  const gaps = (bar.children.length-1) * parseFloat(cs.gap||0);
  const pad = parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight);
  return {barH:Math.round(bar.getBoundingClientRect().height),
          available: Math.round(bar.getBoundingClientRect().width - pad),
          needed: Math.round(need+gaps), gap:cs.gap, wrap:cs.flexWrap};
})));
await b.close();
