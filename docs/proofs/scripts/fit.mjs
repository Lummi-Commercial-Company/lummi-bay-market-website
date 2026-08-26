import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();
for(const w of [1024,1152,1280,1440,1600,1728,1920]){
  const pg=await b.newPage({viewport:{width:w,height:800}});
  await pg.goto('file://'+process.cwd()+'/cond.html');
  await pg.evaluate(()=>{document.getElementById('fuel').classList.add('cond');});
  await pg.waitForTimeout(200);
  const r=await pg.evaluate(()=>{const one=document.querySelector('.oneline');
    const f=document.getElementById('fuel').getBoundingClientRect();
    return {barW:Math.round(f.width),need:one.scrollWidth,have:one.clientWidth,
      overflow:one.scrollWidth>one.clientWidth};});
  console.log('viewport',w,'→ bar',r.barW,'needs',r.need,'has',r.have,r.overflow?'*** OVERFLOWS':'fits');
  await pg.close();
}
// does animation-timeline: view() actually work here?
const pg=await b.newPage({viewport:{width:1280,height:800}});
await pg.setContent(`<style>
 body{height:3000px;margin:0}
 #t{margin:1200px auto 0;width:400px;height:100px;background:#ccc;
    animation:sq linear both;animation-timeline:view();animation-range:cover 40% cover 60%}
 @keyframes sq{to{width:640px;background:#0FB5C4}}
</style><div id="t"></div>`);
await pg.evaluate(()=>scrollTo(0,900)); await pg.waitForTimeout(400);
const a=await pg.evaluate(()=>getComputedStyle(document.getElementById('t')).width);
await pg.evaluate(()=>scrollTo(0,1300)); await pg.waitForTimeout(400);
const c=await pg.evaluate(()=>getComputedStyle(document.getElementById('t')).width);
console.log('animation-timeline:view() — before',a,'after',c,'supported:',CSS===undefined?'?':'');
console.log('CSS.supports animation-timeline:', await pg.evaluate(()=>CSS.supports('animation-timeline','view()')));
await b.close();
