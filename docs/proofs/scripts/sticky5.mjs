import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:700}});
await pg.goto('file://'+process.cwd()+'/sticky2.html');
await pg.evaluate(()=>{const p=document.getElementById('panel');
  p.addEventListener('toggle',e=>{window.__log=(window.__log||[]);window.__log.push(e.newState+'@'+Math.round(window.scrollY));});});
await pg.click('#btn'); await pg.waitForTimeout(200);
const st=async l=>pg.evaluate(l=>({l,y:Math.round(window.scrollY),
  open:document.getElementById('panel').matches(':popover-open'),
  vis:getComputedStyle(document.getElementById('panel')).display}),l);
const out=[await st('after click')];
for(const y of [200,400,600,900,1500]){
  await pg.evaluate(y=>window.scrollTo(0,y),y); await pg.waitForTimeout(300);
  out.push(await st('scroll '+y));
}
out.push(await pg.evaluate(()=>({toggles:window.__log||[]})));
console.log(JSON.stringify(out,null,1));
await b.close();
