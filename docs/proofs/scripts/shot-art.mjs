import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:1100},deviceScaleFactor:2});
await p.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await p.waitForTimeout(600);
for(const [id,y,f] of [['j-phone',700,'art-phone-mid.png'],['j-phone','max','art-phone-bot.png'],
                        ['j-desk',380,'art-desk.png']]){
  await p.evaluate(async([id,y])=>{const st=document.querySelector('#'+id),sc=st.querySelector('.scroller');
    st.scrollIntoView({block:'center'});sc.scrollTop=y==='max'?sc.scrollHeight:y;
    await new Promise(r=>setTimeout(r,320));},[id,y]);
  await p.waitForTimeout(320); await p.locator('#'+id).screenshot({path:f}); console.log(f);}
await b.close();
