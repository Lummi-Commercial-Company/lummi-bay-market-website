import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();
for(const scheme of ['light','dark']){
  const p=await b.newPage({viewport:{width:1000,height:1400},deviceScaleFactor:2,colorScheme:scheme});
  await p.goto('file://'+process.cwd()+'/launch-plan.html');
  await p.waitForTimeout(900);
  // the diagram is the deliverable — capture it on its own too
  await p.locator('figure').first().scrollIntoViewIfNeeded();
  await p.waitForTimeout(300);
  await p.locator('figure').first().screenshot({path:`plan-diagram-${scheme}.png`});
  await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(300);
  await p.screenshot({path:`plan-top-${scheme}.png`});
  // sanity: no horizontal page scroll, fonts resolved
  const r=await p.evaluate(()=>({hscroll:document.documentElement.scrollWidth>window.innerWidth+1,
    bodyBg:getComputedStyle(document.body).backgroundColor,
    h1:getComputedStyle(document.querySelector('h1')).fontFamily.split(',')[0],
    ink:getComputedStyle(document.body).color}));
  console.log(scheme, JSON.stringify(r));
  await p.close();
}
await b.close();
