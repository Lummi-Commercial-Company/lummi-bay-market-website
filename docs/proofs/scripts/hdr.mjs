import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1600,height:1000}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(600);
console.log(JSON.stringify(await pg.evaluate(()=>{
  const g=(sel)=>{const e=document.querySelector(sel);return e?Math.round(e.getBoundingClientRect().height):null;};
  return {phoneHeader:g('#f-int-phone .sitebar'), deskHeader:g('#f-home-desk .sitebar'), wideHeader:g('#h-wide .sitebar')};})));
await b.close();
