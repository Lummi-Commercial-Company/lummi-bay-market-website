import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const pg = await b.newPage({viewport:{width:900,height:1200}, deviceScaleFactor:3});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(400);
const el = await pg.$('#j-phone .sitebar');
await el.scrollIntoViewIfNeeded(); await pg.waitForTimeout(200);
await el.screenshot({path:'hdr-phone.png'});
await b.close();
