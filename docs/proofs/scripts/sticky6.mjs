import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();
const probe=p=>p.evaluate(()=>{const who=(x,y)=>{const e=document.elementFromPoint(x,y);
   return e?(e.closest('#panel')?'PANEL':e.closest('.bar')?'nav':e.closest('#anchor')?'card':(e.id||e.tagName.toLowerCase())):'none';};
  return {y:Math.round(scrollY),belowNav:who(800,80),mid:who(800,200)};});
for(const mode of ['wheel','scrollTo']){
  const pg=await b.newPage({viewport:{width:1000,height:700}});
  await pg.goto('file://'+process.cwd()+'/sticky2.html');
  await pg.click('#btn'); await pg.waitForTimeout(200);
  if(mode==='wheel'){for(let i=0;i<9;i++){await pg.mouse.wheel(0,100);await pg.waitForTimeout(120);} }
  else {await pg.evaluate(()=>scrollTo(0,900));}
  await pg.waitForTimeout(500);
  console.log(mode, JSON.stringify(await probe(pg)));
  await pg.screenshot({path:'v-mode-'+mode+'.png',clip:{x:400,y:0,width:600,height:320}});
  await pg.close();
}
await b.close();
