import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const pg = await b.newPage({viewport:{width:1400,height:1000}, deviceScaleFactor:2});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(400);
for (const id of ['j-desk','j-desk-int']) {
  const el = await pg.$('#'+id+' .loccards');
  await el.scrollIntoViewIfNeeded();
  await pg.waitForTimeout(200);
  await el.screenshot({path:'loc-'+id+'.png'});
}
await b.close();
