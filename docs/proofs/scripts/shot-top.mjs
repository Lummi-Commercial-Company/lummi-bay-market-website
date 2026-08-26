import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:1100},deviceScaleFactor:2});
await p.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await p.waitForTimeout(600);
for(const [id,y,f] of [['j-phone',0,'art-phone-top.png'],['j-desk',0,'art-desk-top.png']]){
  await p.evaluate(async([id,y])=>{const st=document.querySelector('#'+id),sc=st.querySelector('.scroller');
    st.scrollIntoView({block:'center'});sc.scrollTop=y;await new Promise(r=>setTimeout(r,320));},[id,y]);
  await p.waitForTimeout(300); await p.locator('#'+id).screenshot({path:f}); console.log(f);}
await b.close();
