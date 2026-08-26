import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1000},deviceScaleFactor:2});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(700);
const probe=async(label,scroll)=>{ const l=label;
  if(scroll!==undefined) await pg.evaluate(v=>{document.querySelector('#h-wide .scroller').scrollTop=v;},scroll);
  await pg.waitForTimeout(350);
  return pg.evaluate(l=>{const st=document.getElementById('h-wide'),sr=st.getBoundingClientRect();
    const bl=document.getElementById('h-block'),br=bl.getBoundingClientRect();
    const line=document.getElementById('h-line'), st2=bl.querySelector('.stacked');
    return {l,scrollTop:Math.round(st.querySelector('.scroller').scrollTop),
      blockW:Math.round(br.width),blockTop:Math.round(br.top-sr.top),
      stackedDisp:getComputedStyle(st2).display, lineDisp:getComputedStyle(line).display,
      lineClips: line.scrollWidth>line.clientWidth, lineNeed:line.scrollWidth, lineHas:line.clientWidth};},l);
};
console.log(JSON.stringify(await probe('top',0)));
console.log(JSON.stringify(await probe('scrolled 400',400)));
console.log(JSON.stringify(await probe('scrolled 900',900)));
await pg.locator('#h-wide').screenshot({path:'v-h-cond.png'});
await b.close();
