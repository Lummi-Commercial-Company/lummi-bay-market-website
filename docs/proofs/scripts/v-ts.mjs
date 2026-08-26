import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const pg = await b.newPage({viewport:{width:1500,height:1200}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(500);
for (const id of ['j-desk-ts','j-phone-ts']) {
  console.log(id, JSON.stringify(await pg.evaluate(async (id)=>{
    const st=document.getElementById(id); if(!st) return {missing:true};
    const sc=st.querySelector('.scroller'), bl=st.querySelector('.fuelblock');
    const vis=sel=>[...st.querySelectorAll(sel)].filter(e=>getComputedStyle(e).display!=='none')
      .map(e=>e.textContent.trim());
    sc.scrollTop=0; bl.open=false; bl.classList.remove('cond');
    await new Promise(r=>setTimeout(r,250));
    const rest={card:vis('.stacked .place'), panel:vis('.condpanel .place')};
    const cards=vis('.loccard h4'), callout=!!st.querySelector('.truckcall');
    const head=st.querySelector('.seclabel').textContent.trim();
    sc.scrollTop=280; await new Promise(r=>setTimeout(r,350));
    const cond=bl.classList.contains('cond');
    const bar=st.querySelector('.oneline').textContent.replace(/\s+/g,' ').trim();
    bl.querySelector('summary').click(); await new Promise(r=>setTimeout(r,150));
    return {rest, cond, bar, condPanel:vis('.condpanel .place'), cards, callout, head,
            cardH:Math.round(bl.getBoundingClientRect().height)};
  }, id)));
}
await b.close();
