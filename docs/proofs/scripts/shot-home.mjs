import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const pg = await b.newPage({viewport:{width:1500,height:1400}, deviceScaleFactor:2});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(600);
for (const [id,name] of [['j-desk-ts','ts-desktop.png'],['j-phone-ts','ts-mobile.png']]) {
  const h = await pg.evaluate((id)=>{
    const st=document.getElementById(id), sc=st.querySelector('.scroller'), bl=st.querySelector('.fuelblock');
    sc.scrollTop=0; bl.open=false; bl.classList.remove('cond');
    st.style.height = sc.scrollHeight + 'px';
    return sc.scrollHeight;
  }, id);
  await pg.waitForTimeout(500);
  const el = await pg.$('#'+id);
  await el.scrollIntoViewIfNeeded();
  await el.screenshot({path:name});
  console.log(name, h);
}
await b.close();
