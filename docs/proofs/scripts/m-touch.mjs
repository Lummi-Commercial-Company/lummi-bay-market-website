import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const pg = await b.newPage({viewport:{width:900,height:2400}, deviceScaleFactor:1});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(500);
const out = await pg.evaluate(()=>{
  const st=document.getElementById('j-phone'), sc=st.querySelector('.scroller');
  st.style.height = sc.scrollHeight+'px';           // show the whole page so nothing is clipped
  const foot = st.querySelector('.homefoot');
  foot.scrollIntoView({block:'center'});
  const links=[...foot.querySelectorAll('.fl')];
  const rect = e=>e.getBoundingClientRect();

  // 1. target size
  const sizes = links.map(e=>{const r=rect(e);
    return {t:e.textContent.trim(), w:+r.width.toFixed(0), h:+r.height.toFixed(0)};});

  // 2. clearance to the nearest OTHER link, edge to edge
  const clear = links.map(e=>{
    const a=rect(e); let best=1e9, who='';
    for(const o of links){ if(o===e) continue; const b2=rect(o);
      const dx = Math.max(b2.left-a.right, a.left-b2.right, 0);
      const dy = Math.max(b2.top-a.bottom, a.top-b2.bottom, 0);
      const d = Math.hypot(dx,dy);
      if(d<best){best=d; who=o.textContent.trim();}
    }
    return {t:e.textContent.trim(), nearest:who, gap:+best.toFixed(1)};
  });

  // 3. aim-error simulation: aim at the centre of the VISIBLE TEXT (a range, not the
  //    padded box), then offset. count landings on a DIFFERENT link.
  const errs=[]; for(let dx=-14;dx<=14;dx+=2) for(let dy=-14;dy<=14;dy+=2)
    if(Math.hypot(dx,dy)<=14) errs.push([dx,dy]);
  const sim = links.map(e=>{
    const rng=document.createRange(); rng.selectNodeContents(e);
    const tr=rng.getBoundingClientRect();
    const cx=tr.left+tr.width/2, cy=tr.top+tr.height/2;
    let wrong=0, dead=0, right=0;
    for(const [dx,dy] of errs){
      const hit=document.elementFromPoint(cx+dx, cy+dy);
      const link=hit && hit.closest ? hit.closest('.fl') : null;
      if(!link) dead++; else if(link===e) right++; else wrong++;
    }
    return {t:e.textContent.trim(), n:errs.length, right, dead, wrong,
            wrongPct:+(100*wrong/errs.length).toFixed(1)};
  });
  return {colW:+rect(links[0]).width.toFixed(0), sizes, clear, sim};
});
console.log(JSON.stringify(out,null,1));
await b.close();
