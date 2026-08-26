import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:900},deviceScaleFactor:1.5});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(700);
await pg.evaluate(()=>{const st=document.getElementById('h-wide');
  st.querySelector('.scroller').scrollTop=500;
  st.closest('.board').scrollLeft=9999;});   // show the right end of the wide stage
await pg.waitForTimeout(450);
await pg.evaluate(()=>{document.getElementById('h-block').open=true;});
await pg.waitForTimeout(350);
await pg.locator('#h-wide').screenshot({path:'v-h3.png'});
await b.close();
