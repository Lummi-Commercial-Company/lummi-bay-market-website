import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const pg = await b.newPage({viewport:{width:1500,height:1200}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(400);
const r = await pg.evaluate(()=>{
  const st=document.getElementById('j-desk'), sc=st.querySelector('.scroller');
  sc.scrollTop=0;
  const o = sc.getBoundingClientRect();
  const g = (sel)=>{const e=st.querySelector(sel); if(!e) return null; const b=e.getBoundingClientRect();
    return {sel, t:Math.round(b.top-o.top), h:Math.round(b.height), bot:Math.round(b.bottom-o.top)};};
  const grid = st.querySelector('.pagegrid');
  const cs = getComputedStyle(grid);
  return {rows:cs.gridTemplateRows, cols:cs.gridTemplateColumns, gap:cs.gap,
    items:['.maincol','.hero','.railcol','.fuelblock','.homerest','.promoregion','.waterline-band'].map(g)};
});
console.log(JSON.stringify(r,null,1));
await b.close();
