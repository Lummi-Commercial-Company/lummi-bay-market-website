import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:1100},deviceScaleFactor:2});
await p.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await p.waitForTimeout(500);
async function shot(id,scrollTo,file){
  await p.evaluate(async([id,y])=>{
    const st=document.querySelector('#'+id), sc=st.querySelector('.scroller');
    st.scrollIntoView({block:'center'});
    sc.scrollTop = y==='max'? sc.scrollHeight : y;
    await new Promise(r=>setTimeout(r,320));
  },[id,scrollTo]);
  await p.waitForTimeout(320);
  await p.locator('#'+id).screenshot({path:file});
  console.log(file);
}
await shot('j-phone', 700,  'cards-phone-mid.png');
await shot('j-phone','max',  'cards-phone-bottom.png');
await shot('j-phone-ts',560,'cards-phone-ts.png');
await b.close();
