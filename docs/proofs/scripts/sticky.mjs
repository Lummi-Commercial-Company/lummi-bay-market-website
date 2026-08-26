import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:700},deviceScaleFactor:2});
await pg.goto('file://'+process.cwd()+'/sticky.html');
const R=async(label)=>pg.evaluate(l=>{
  const g=id=>{const r=document.getElementById(id).getBoundingClientRect();
    return {t:+r.top.toFixed(1),b:+r.bottom.toFixed(1),l:+r.left.toFixed(1)};};
  const bar=g('bar'), pan=document.getElementById('panel');
  const p=pan.matches(':popover-open')?g('panel'):null;
  return {l, y:window.scrollY, bar, panel:p,
    overlapsNav: p? (p.t < bar.b) : null,
    open: pan.matches(':popover-open')};
},label);
const out=[];
out.push(await R('top, shut'));
await pg.click('#btn'); await pg.waitForTimeout(150);
out.push(await R('top, OPEN'));
await pg.evaluate(()=>window.scrollTo(0,300)); await pg.waitForTimeout(250);
out.push(await R('scrolled 300 with panel open'));
await pg.screenshot({path:'v-sticky-scrolled.png'});
// now make the rail itself sticky and repeat
await pg.evaluate(()=>{window.scrollTo(0,0);document.getElementById('rail').classList.add('stick');
  document.getElementById('rail').style.top='';});
await pg.waitForTimeout(200);
await pg.evaluate(()=>window.scrollTo(0,300)); await pg.waitForTimeout(250);
out.push(await R('RAIL STICKY, scrolled 300, panel open'));
await pg.screenshot({path:'v-sticky-rail.png'});
console.log(JSON.stringify(out,null,1));
await b.close();
