import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:1100}});
await p.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await p.waitForTimeout(500);
const r=await p.evaluate(async()=>{
  const textW=el=>{const rg=document.createRange();rg.selectNodeContents(el);
    return Math.round(rg.getBoundingClientRect().width);};
  const out={};
  for(const w of ['375px','360px','320px']){
    const st=document.querySelector('#j-phone'); st.style.width=w;
    await new Promise(r=>setTimeout(r,180));
    const rows=[...st.querySelectorAll('.loccard')].map(c=>{
      const q=c.querySelector('p'), h=c.querySelector('h4');
      const box=Math.round(q.getBoundingClientRect().width);
      return {name:h.textContent.trim(), box, text:textW(q), slack:box-textW(q),
              nameSlack:Math.round(h.getBoundingClientRect().width)-textW(h)};});
    out[w]={rows, minSlack:Math.min(...rows.map(x=>x.slack))};
    st.style.width='';
  }
  return out;});
console.log(JSON.stringify(r,null,1));await b.close();
