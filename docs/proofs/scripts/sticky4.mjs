import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:700}});
await pg.goto('file://'+process.cwd()+'/sticky2.html');
await pg.click('#btn'); await pg.waitForTimeout(200);
const probe=async(label)=>pg.evaluate(l=>{
  const who=(x,y)=>{const e=document.elementFromPoint(x,y);if(!e)return 'none';
    return (e.closest('#panel')?'PANEL':e.closest('.bar')?'nav':e.closest('#anchor')?'card':e.id||e.tagName.toLowerCase());};
  return {l, y:window.scrollY,
    insideNav_right: who(800,20),      // is the panel painting over the sticky nav?
    justBelowNav:    who(800,80),      // is the panel where the card is pinned?
    midRail:         who(800,200),
    leftColumn:      who(300,200)};
},label);
const out=[probe0=>0];out.length=0;
out.push(await probe('scroll 0'));
for(const y of [300,900,1800]){
  await pg.evaluate(y=>window.scrollTo(0,y),y); await pg.waitForTimeout(300);
  out.push(await probe('scroll '+y));
}
console.log(JSON.stringify(out,null,1));
await pg.screenshot({path:'v-sticky-1800.png'});
await b.close();
