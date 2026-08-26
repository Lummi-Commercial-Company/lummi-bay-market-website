import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1600,height:1000}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(700);
await pg.evaluate(()=>{document.querySelector('#h-wide .scroller').scrollTop=500;});
await pg.waitForTimeout(400);
console.log(JSON.stringify(await pg.evaluate(()=>{
  const l=document.getElementById('h-line'), b=document.getElementById('h-block');
  const cs=getComputedStyle(l);
  // true intrinsic width of the line
  const clone=l.cloneNode(true); clone.style.width='max-content'; clone.style.position='absolute';
  clone.style.visibility='hidden'; clone.style.display='flex'; document.body.appendChild(clone);
  const need=Math.ceil(clone.getBoundingClientRect().width); clone.remove();
  return {blockW:Math.round(b.getBoundingClientRect().width), lineHas:l.clientWidth,
    intrinsic:need, padding:cs.paddingLeft+'/'+cs.paddingRight};
})));
await b.close();
