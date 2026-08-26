import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:700},deviceScaleFactor:2});
await pg.goto('file://'+process.cwd()+'/sticky2.html');
const R=async l=>pg.evaluate(l=>{
  const g=id=>{const r=document.getElementById(id).getBoundingClientRect();
    return {t:+r.top.toFixed(1),b:+r.bottom.toFixed(1)};};
  const bar=g('bar'), anchor=g('anchor');
  const pan=document.getElementById('panel');
  const open=pan.matches(':popover-open');
  const p=open?g('panel'):null;
  const olap = p ? Math.max(0, Math.min(p.b,bar.b)-Math.max(p.t,bar.t)) : null;
  return {l,y:window.scrollY,bar,anchor,panel:p,navCoveredBy:olap};
},l);
const out=[];
out.push(await R('top, shut'));
await pg.click('#btn'); await pg.waitForTimeout(150);
out.push(await R('top, open'));
for(const y of [200,600,1400]){
  await pg.evaluate(y=>window.scrollTo(0,y),y); await pg.waitForTimeout(250);
  out.push(await R('scrolled '+y+', panel open'));
}
await pg.screenshot({path:'v-sticky2.png'});
console.log(JSON.stringify(out,null,1));
await b.close();
