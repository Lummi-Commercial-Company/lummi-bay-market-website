import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const pg = await b.newPage({viewport:{width:900,height:1200}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(400);
const run = await pg.evaluate(()=>{
  const st=document.getElementById('j-phone');
  st.querySelector('.scroller').scrollTop=0;
  st.scrollIntoView({block:'center'});
  const bar=st.querySelector('.sitebar');
  const targets=[...bar.querySelectorAll('.nl, .rewards-hit')];
  const rows=[];
  for(let R=6; R<=34; R+=4){
    const errs=[]; for(let dx=-R;dx<=R;dx+=1) for(let dy=-R;dy<=R;dy+=1)
      if(Math.hypot(dx,dy)<=R) errs.push([dx,dy]);
    let ok=0,wrong=0,dead=0;
    for(const e of targets){
      const rng=document.createRange(); rng.selectNodeContents(e);
      const tr=rng.getBoundingClientRect();
      const cx=tr.left+tr.width/2, cy=tr.top+tr.height/2;
      for(const [dx,dy] of errs){
        const hit=document.elementFromPoint(cx+dx,cy+dy);
        const t=hit&&hit.closest?hit.closest('.nl, .rewards-hit'):null;
        if(!t) dead++; else if(t===e) ok++; else wrong++;
      }
    }
    const tot=ok+wrong+dead;
    rows.push({radius:R, correctPct:+(100*ok/tot).toFixed(1),
      wrongPct:+(100*wrong/tot).toFixed(1), nothingPct:+(100*dead/tot).toFixed(1)});
  }
  const probe=(()=>{const e=targets[0], r=e.getBoundingClientRect();
    const h=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2);
    return {tag:h&&h.tagName, cls:h&&h.className, inViewport: r.top>=0 && r.bottom<=innerHeight};})();
  return {probe, barH:Math.round(bar.getBoundingClientRect().height),
    targets:targets.map(e=>{const r=e.getBoundingClientRect();
      return {t:e.textContent.trim().replace(/\s+/g,' '), w:Math.round(r.width), h:Math.round(r.height)};}),
    rows};
});
console.log('phone header, bar', run.barH+'px');
console.log(JSON.stringify(run.targets));
console.table(run.rows);
await b.close();
