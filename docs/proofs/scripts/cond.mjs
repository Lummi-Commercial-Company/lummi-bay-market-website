import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();
for(let run=1;run<=3;run++){
  const pg=await b.newPage({viewport:{width:1280,height:800}});
  await pg.goto('file://'+process.cwd()+'/cond.html');
  await pg.evaluate(()=>{window.__hits=[];document.addEventListener('click',e=>{
    window.__hits.push(e.target.closest('#panel')?'PANEL':e.target.closest('#fuel')?'BAR-BEHIND':e.target.tagName);},true);});
  // go condensed, then open, then scroll a long way
  await pg.evaluate(()=>{document.getElementById('fuel').classList.add('cond');document.body.classList.add('condmode');});
  await pg.waitForTimeout(250);
  await pg.click('#btn'); await pg.waitForTimeout(200);
  for(let i=0;i<12;i++){await pg.mouse.wheel(0,100);await pg.waitForTimeout(80);}
  await pg.waitForTimeout(400);
  const geo=await pg.evaluate(()=>{const p=document.getElementById('panel').getBoundingClientRect();
    const f=document.getElementById('fuel').getBoundingClientRect();
    const one=document.querySelector('.oneline');
    return {y:Math.round(scrollY),panelTop:Math.round(p.top),panelW:Math.round(p.width),
      barTop:Math.round(f.top),barW:Math.round(f.width),
      oneLineOverflow:one.scrollWidth>one.clientWidth, oneW:one.scrollWidth, oneAvail:one.clientWidth};});
  await pg.mouse.click(1000, geo.panelTop+90);
  await pg.waitForTimeout(200);
  const hits=await pg.evaluate(()=>window.__hits);
  console.log('run',run,JSON.stringify({...geo,hits}));
  if(run===1) await pg.screenshot({path:'v-cond.png',clip:{x:0,y:0,width:1280,height:340}});
  await pg.close();
}
await b.close();
