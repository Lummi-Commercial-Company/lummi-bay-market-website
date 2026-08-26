import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:1100}});
await p.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await p.waitForTimeout(400);
const r=await p.evaluate(()=>{
  const st=document.querySelector('#j-phone-int');
  const sc=st.querySelector('.scroller');
  const top=el=>el.getBoundingClientRect().top-sc.getBoundingClientRect().top+sc.scrollTop;
  const H=el=>Math.round(el.getBoundingClientRect().height);
  const bar=st.querySelector('.sitebar'), card=st.querySelector('.fuelblock');
  const hero=st.querySelector('.herotitle'), reg=st.querySelector('.promoregion');
  const promo=st.querySelector('.promo'), main=st.querySelector('.maincol');
  const out={frameW:Math.round(st.getBoundingClientRect().width),
    header:H(bar), card:H(card), promoW:Math.round(promo.getBoundingClientRect().width),
    promoH_16_9:H(promo)};
  out.asBuilt_titleTop=Math.round(top(hero));
  out.asBuilt_promoTop=Math.round(top(reg));
  // move the promo region ABOVE the title (the ADR's stated decision)
  main.parentNode.insertBefore(reg,main);
  out.above_titleTop=Math.round(top(hero));
  out.above_promoH=H(promo);
  // 2.5:1 crop in that same position
  promo.style.aspectRatio='2.5/1';
  out.above_titleTop_25=Math.round(top(hero));
  out.above_promoH_25=H(promo);
  return out;});
console.log(JSON.stringify(r,null,1));await b.close();
