import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:1100}});
await p.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await p.waitForTimeout(500);
const r=await p.evaluate(async()=>{
  const R=el=>el.getBoundingClientRect(); const out={};
  for(const id of ['j-phone','j-desk']){
    const st=document.querySelector('#'+id), wrap=st.querySelector('.loccards');
    out[id]={total:Math.round(R(wrap).height),
      rows:[...wrap.children].map(c=>{const q=c.querySelector('p');
        return {h:Math.round(R(c).height), text:q.textContent.trim(),
          textW:Math.round(R(q).width), needs:q.scrollWidth,
          truncated:q.scrollWidth>Math.ceil(R(q).width)+1,
          lines:Math.round(R(q).height/parseFloat(getComputedStyle(q).lineHeight))};})};
  }
  // narrowest common phone
  const st=document.querySelector('#j-phone'); st.style.width='320px';
  await new Promise(r=>setTimeout(r,200));
  const wrap=st.querySelector('.loccards');
  out.phone320={total:Math.round(R(wrap).height),
    rows:[...wrap.children].map(c=>{const q=c.querySelector('p');
      return {h:Math.round(R(c).height), textW:Math.round(R(q).width),
        needs:q.scrollWidth, truncated:q.scrollWidth>Math.ceil(R(q).width)+1};})};
  st.style.width='';
  return out;});
console.log(JSON.stringify(r,null,1));await b.close();
