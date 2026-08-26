import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const pg = await b.newPage({viewport:{width:900,height:2600}, deviceScaleFactor:1});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(500);
const res = await pg.evaluate(()=>{
  const st=document.getElementById('j-phone'), sc=st.querySelector('.scroller');
  st.style.height = sc.scrollHeight+'px';
  const foot = st.querySelector('.homefoot');
  const run = ()=>{
    foot.scrollIntoView({block:'center'});
    const links=[...foot.querySelectorAll('.fl')];
    const rows=[];
    for(let R=6; R<=34; R+=4){
      const errs=[]; for(let dx=-R;dx<=R;dx+=2) for(let dy=-R;dy<=R;dy+=2)
        if(Math.hypot(dx,dy)<=R) errs.push([dx,dy]);
      let wrong=0,dead=0,tot=0, worst={t:'',p:0};
      for(const e of links){
        const rng=document.createRange(); rng.selectNodeContents(e);
        const tr=rng.getBoundingClientRect();
        const cx=tr.left+tr.width/2, cy=tr.top+tr.height/2;
        let w=0;
        for(const [dx,dy] of errs){
          const hit=document.elementFromPoint(cx+dx,cy+dy);
          const l=hit&&hit.closest?hit.closest('.fl'):null;
          tot++; if(!l) dead++; else if(l!==e){wrong++; w++;}
        }
        const p=100*w/errs.length;
        if(p>worst.p) worst={t:e.textContent.trim(), p:+p.toFixed(1)};
      }
      rows.push({radius:R, wrongPct:+(100*wrong/tot).toFixed(1),
                 deadPct:+(100*dead/tot).toFixed(1), worstLink:worst.t, worstPct:worst.p});
    }
    return {height: Math.round(foot.getBoundingClientRect().height), rows};
  };
  const two = run();
  // baseline: the one-column footer, links still padded to 44px
  foot.style.gridTemplateColumns='1fr';
  const one = run();
  foot.style.gridTemplateColumns='';
  return {two, one};
});
console.log('TWO COLUMNS  footer height', res.two.height+'px');
console.table(res.two.rows);
console.log('ONE COLUMN   footer height', res.one.height+'px');
console.table(res.one.rows);
await b.close();
