import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1300},deviceScaleFactor:1.5});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(900);
await pg.locator('#j-desk').screenshot({path:'v-j-desk.png'});
await pg.locator('#j-phone').screenshot({path:'v-j-phone.png'});
await b.close();
