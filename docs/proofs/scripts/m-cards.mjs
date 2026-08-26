import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:1100}});
await p.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await p.waitForTimeout(400);
const r=await p.evaluate(()=>{
  const st=document.querySelector('#j-phone');           // Home, has all 3 cards
  const wrap=st.querySelector('.loccards');
  const R=el=>el.getBoundingClientRect();
  const out={contentW:Math.round(R(wrap).width), asBuilt:{
     total:Math.round(R(wrap).height),
     each:[...wrap.children].map(c=>Math.round(R(c).height))}};
  // variant A — three across, as asked
  wrap.style.gridTemplateColumns='repeat(3,1fr)';
  const A={total:Math.round(R(wrap).height), cardW:Math.round(R(wrap.children[0]).width), names:[]};
  for(const c of wrap.children){
    const h=c.querySelector('h4'), pEl=c.querySelector('p');
    const lh=parseFloat(getComputedStyle(h).lineHeight);
    A.names.push({text:h.textContent.trim(), w:Math.round(R(h).width),
      lines:Math.round(R(h).height/lh),
      overflow: h.scrollWidth>Math.ceil(R(h).width)+1,
      bodyLines:Math.round(R(pEl).height/parseFloat(getComputedStyle(pEl).lineHeight))});
  }
  out.threeAcross=A;
  wrap.style.gridTemplateColumns='';
  return out;});
console.log(JSON.stringify(r,null,1));await b.close();
