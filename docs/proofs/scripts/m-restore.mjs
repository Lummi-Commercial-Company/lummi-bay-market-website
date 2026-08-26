import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:1100}});
await p.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await p.waitForTimeout(500);
const r=await p.evaluate(async()=>{
  const st=document.querySelector('#j-phone'), sc=st.querySelector('.scroller'),
        blk=st.querySelector('.fuelblock');
  st.scrollIntoView({block:'center'});
  sc.scrollTop=sc.scrollHeight; await new Promise(r=>setTimeout(r,300));
  const before={cond:blk.classList.contains('cond'),
    btnOn:st.querySelector('.totop').classList.contains('on')};
  st.querySelector('.totop').click();
  await new Promise(r=>setTimeout(r,900));
  const active=document.activeElement;
  return {before, after:{cond:blk.classList.contains('cond'),
    scrollTop:Math.round(sc.scrollTop),
    btnOn:st.querySelector('.totop').classList.contains('on'),
    focus:(active.className||active.tagName)}};});
console.log(JSON.stringify(r,null,1));await b.close();
