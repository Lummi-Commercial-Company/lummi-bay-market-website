import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1000}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(600);
const dump=async(v)=>{await pg.evaluate(v=>{document.querySelector('#h-wide .scroller').scrollTop=v;},v);
 await pg.waitForTimeout(350);
 return pg.evaluate(()=>{const bl=document.getElementById('h-block');
   const all=[bl,bl.querySelector('.stacked'),bl.querySelector('.oneline')];
   return all.map(e=>e.getAnimations().map(a=>({n:a.animationName,st:a.playState,
     prog:a.effect&&a.currentTime!=null?String(a.currentTime):'null',
     tl:a.timeline?a.timeline.constructor.name:'none'})));});};
console.log('scroll 0  ',JSON.stringify(await dump(0)));
console.log('scroll 500',JSON.stringify(await dump(500)));
await b.close();
