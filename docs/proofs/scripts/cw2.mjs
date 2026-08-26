import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1700,height:1100}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');await pg.waitForTimeout(600);
console.log(JSON.stringify(await pg.evaluate(()=>{
  const out={};
  for(const id of ['i-desk-shut','i-desk-open','i-phone-shut']){
    const st=document.getElementById(id);
    out[id]={rowsW:Math.round(st.querySelector('.rows').getBoundingClientRect().width),
      cueW:Math.round(st.querySelector('.bandcue').getBoundingClientRect().width),
      cells:[...st.querySelectorAll('.rows .cell')].map(c=>c.querySelector('.cp').textContent+' has '+Math.round(c.clientWidth)+' needs '+c.scrollWidth)};
  }
  return out;}),null,1));
await b.close();
