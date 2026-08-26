import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();
for(const sticky of [true,false]){
 for(let run=1;run<=3;run++){
  const pg=await b.newPage({viewport:{width:1000,height:700}});
  await pg.goto('file://'+process.cwd()+'/sticky2.html');
  if(!sticky) await pg.evaluate(()=>{document.getElementById('rail').style.position='static';});
  await pg.evaluate(()=>{window.__hits=[];
    document.addEventListener('click',e=>{const t=e.target;
      window.__hits.push(t.closest('#panel')?'PANEL':t.closest('#anchor')?'CARD-BEHIND':t.tagName);},true);});
  await pg.click('#btn'); await pg.waitForTimeout(200);
  for(let i=0;i<3;i++){await pg.mouse.wheel(0,100);await pg.waitForTimeout(120);}
  await pg.waitForTimeout(400);
  const geo=await pg.evaluate(()=>{const a=document.getElementById('anchor').getBoundingClientRect();
     return {ay:Math.round(a.top)};});
  // click 60px below the anchor's painted top — inside the panel either way
  await pg.mouse.click(800, geo.ay+60);
  await pg.waitForTimeout(200);
  const r=await pg.evaluate(()=>({hits:window.__hits}));
  console.log('rail sticky='+sticky,'run',run,'anchorTop',geo.ay,JSON.stringify(r.hits));
  await pg.close();
 }
}
await b.close();
