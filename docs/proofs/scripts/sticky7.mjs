import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();
for(let run=1;run<=3;run++){
  const pg=await b.newPage({viewport:{width:1000,height:700}});
  await pg.goto('file://'+process.cwd()+'/sticky2.html');
  await pg.evaluate(()=>{window.__hits=[];
    document.addEventListener('click',e=>{const t=e.target;
      window.__hits.push(t.closest('#panel')?'PANEL':t.closest('#anchor')?'CARD-BEHIND':t.tagName);},true);});
  await pg.click('#btn'); await pg.waitForTimeout(200);
  for(let i=0;i<9;i++){await pg.mouse.wheel(0,100);await pg.waitForTimeout(120);}
  await pg.waitForTimeout(500);
  await pg.mouse.click(800,140);   // a point inside the PAINTED panel body
  await pg.waitForTimeout(200);
  const r=await pg.evaluate(()=>({hits:window.__hits,stillOpen:document.getElementById('panel').matches(':popover-open')}));
  console.log('run',run,JSON.stringify(r));
  await pg.close();
}
await b.close();
