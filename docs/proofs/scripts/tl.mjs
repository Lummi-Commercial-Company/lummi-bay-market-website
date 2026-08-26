import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1280,height:800}});
await pg.setContent(`<style>
 body{height:3000px;margin:0}
 #t{margin:1200px auto 0;width:400px;height:100px;background:#ccc;
    animation:sq linear both;animation-timeline:view();animation-range:cover 45% cover 55%}
 @keyframes sq{to{width:640px;background:rgb(15,181,196)}}
</style><div id="t"></div>`);
const at=async y=>{await pg.evaluate(y=>scrollTo(0,y),y);await pg.waitForTimeout(350);
  return pg.evaluate(()=>{const cs=getComputedStyle(document.getElementById('t'));return cs.width+' / '+cs.backgroundColor;});};
console.log('supports animation-timeline:view() ->', await pg.evaluate(()=>CSS.supports('animation-timeline','view()')));
console.log('scroll 600  :', await at(600));
console.log('scroll 900  :', await at(900));
console.log('scroll 1100 :', await at(1100));
console.log('scroll 1500 :', await at(1500));
await b.close();
