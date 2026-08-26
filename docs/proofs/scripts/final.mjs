import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1300},deviceScaleFactor:1.5});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(900);
await pg.locator('#j-desk').screenshot({path:'f-desk.png'});
await pg.evaluate(()=>{document.querySelector('#j-desk .scroller').scrollTop=320;});
await pg.waitForTimeout(450);
await pg.locator('#j-desk .fuelblock .oneline').click(); await pg.waitForTimeout(300);
await pg.locator('#j-desk').screenshot({path:'f-desk-cond-open.png'});
await b.close();
