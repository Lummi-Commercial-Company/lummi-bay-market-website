import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1280,height:800}});
await pg.goto('file://'+process.cwd()+'/cond2.html');await pg.waitForTimeout(300);
for(const y of [0,200,400,600,900,1400]){
  await pg.evaluate(y=>scrollTo(0,y),y);await pg.waitForTimeout(300);
  console.log(y, JSON.stringify(await pg.evaluate(()=>({
    w:getComputedStyle(document.getElementById('fuel')).width,
    stk:getComputedStyle(document.getElementById('stk')).display,
    one:getComputedStyle(document.getElementById('one')).display,
    prog:(document.getElementById('fuel').getAnimations()[0]||{}).currentTime+''}))));
}
await b.close();
