import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const pg = await b.newPage({viewport:{width:1400,height:1000}, deviceScaleFactor:2});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(400);
const fr = await pg.$('#j-phone-int');
await fr.scrollIntoViewIfNeeded();
for (const [open,name] of [[false,'ph-shut.png'],[true,'ph-open.png']]) {
  await pg.evaluate((o)=>{const bl=document.querySelector('#j-phone-int .fuelblock');
    document.querySelector('#j-phone-int .scroller').scrollTop=0; bl.classList.remove('cond'); bl.open=o;},open);
  await pg.waitForTimeout(250);
  await fr.screenshot({path:name});
}
await b.close();
