import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const pg = await b.newPage({viewport:{width:900,height:2600}, deviceScaleFactor:1});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(500);
console.log(JSON.stringify(await pg.evaluate(()=>{
  const st=document.getElementById('j-phone'), sc=st.querySelector('.scroller');
  st.style.height=sc.scrollHeight+'px';
  const foot=st.querySelector('.homefoot'); foot.scrollIntoView({block:'center'});
  const links=[...foot.querySelectorAll('.fl')];
  const R=30, errs=[]; for(let dx=-R;dx<=R;dx+=1) for(let dy=-R;dy<=R;dy+=1)
    if(Math.hypot(dx,dy)<=R) errs.push([dx,dy]);
  let vert=0, horiz=0, dead=0, ok=0;
  // also: the minimum leftward error needed to cross the gutter, per link
  let minCross=1e9;
  for(const e of links){
    const r=e.getBoundingClientRect();
    const rng=document.createRange(); rng.selectNodeContents(e);
    const tr=rng.getBoundingClientRect();
    const cx=tr.left+tr.width/2, cy=tr.top+tr.height/2;
    minCross=Math.min(minCross, cx-r.left, r.right-cx);
    for(const [dx,dy] of errs){
      const hit=document.elementFromPoint(cx+dx,cy+dy);
      const l=hit&&hit.closest?hit.closest('.fl'):null;
      if(!l){dead++;continue;}
      if(l===e){ok++;continue;}
      const o=l.getBoundingClientRect();
      // overlapping horizontal span => same column => vertical neighbour
      (o.left < r.right-1 && o.right > r.left+1) ? vert++ : horiz++;
    }
  }
  const tot=ok+vert+horiz+dead;
  return {radius:R, samples:tot,
    correctPct:+(100*ok/tot).toFixed(1),
    verticalNeighbourPct:+(100*vert/tot).toFixed(1),
    horizontalNeighbourPct:+(100*horiz/tot).toFixed(1),
    landsOnNothingPct:+(100*dead/tot).toFixed(1),
    minErrorToLeaveTargetSideways:+minCross.toFixed(0),
    gutterPx:parseFloat(getComputedStyle(foot).columnGap)};
})));
await b.close();
