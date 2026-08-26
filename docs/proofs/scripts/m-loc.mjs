import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const pg = await b.newPage({viewport:{width:1400,height:1000}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(400);
const out = await pg.evaluate(() => {
  const r = [];
  document.querySelectorAll('.stage').forEach(st => {
    const g = st.querySelector('.loccards'); if(!g) return;
    const gb = g.getBoundingClientRect();
    const cards = [...g.querySelectorAll('.loccard')].map(c => {
      const b = c.getBoundingClientRect();
      return {name: c.querySelector('h4').textContent.trim(),
              w: Math.round(b.width), h: Math.round(b.height),
              left: Math.round(b.left - gb.left)};
    });
    r.push({frame: st.id || st.className, mode: st.classList.contains('desk')?'desk':'phone',
            regionW: Math.round(gb.width), cards});
  });
  return r;
});
console.log(JSON.stringify(out,null,1));
await b.close();
