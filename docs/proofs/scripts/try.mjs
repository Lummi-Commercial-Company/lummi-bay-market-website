import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1500,height:1200},deviceScaleFactor:2});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(600);
// variant A: cedar ground
await pg.evaluate(()=>{const e=document.querySelector('#f-int-phone .rewards-slim');
  e.style.background='var(--lb-cedar)'; e.querySelector('.go').style.background='var(--lb-navy)';});
await pg.locator('#f-int-phone').screenshot({path:'try-cedar.png',clip:undefined});
// variant B: paper card, cedar pill, teal underline like the price card
await pg.evaluate(()=>{const e=document.querySelector('#f-int-phone .rewards-slim');
  e.style.background='var(--lb-paper)'; e.style.borderBottom='2px solid var(--lb-teal)';
  e.style.borderRadius='6px';
  e.querySelector('b').style.color='var(--lb-navy)';
  e.querySelector('i').style.color='var(--lb-ink)'; e.querySelector('i').style.opacity='.65';
  e.querySelector('.mark').style.borderColor='rgba(28,78,143,.45)';
  e.querySelector('.mark').style.color='var(--lb-navy)';
  e.querySelector('.go').style.background='var(--lb-cedar)';});
await pg.locator('#f-int-phone').screenshot({path:'try-paper.png'});
await b.close();
