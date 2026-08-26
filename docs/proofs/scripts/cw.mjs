import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1700,height:1100}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(600);
console.log(JSON.stringify(await pg.evaluate(()=>{
  const out={};
  for(const id of ['i-desk-open','i-phone-open']){
    const st=document.getElementById(id);
    out[id]=[...st.querySelectorAll('.cell')].map(c=>{
      const cl=c.cloneNode(true); cl.style.cssText='position:absolute;visibility:hidden;width:max-content;display:flex';
      document.body.appendChild(cl); const w=Math.ceil(cl.getBoundingClientRect().width); cl.remove();
      return c.querySelector('.cp').textContent+':'+w;});
  }
  return out;}),null,1));
await b.close();
