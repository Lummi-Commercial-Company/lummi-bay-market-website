import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch();
const pg = await b.newPage({viewport:{width:1400,height:1000}});
await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await pg.waitForTimeout(500);
const ids = ['j-desk','j-desk-int','j-desk-ts','j-phone','j-phone-int','j-phone-ts'];
for (const id of ids) {
  const r = await pg.evaluate((id) => {
    const st = document.getElementById(id);
    const sc = st.querySelector('.scroller'), bl = st.querySelector('.fuelblock');
    const fr = st.getBoundingClientRect();
    const box = e => { const b=e.getBoundingClientRect();
      return {t:Math.round(b.top-fr.top), l:Math.round(b.left-fr.left),
              w:Math.round(b.width), h:Math.round(b.height), bot:Math.round(b.bottom-fr.top)}; };
    sc.scrollTop = 0; bl.open = false; bl.classList.remove('cond');
    const rest = box(bl);
    // probe of a thing BELOW the block, to catch layout shift on condense
    const below = st.querySelector('.promoregion, .promo, .waterline-band');
    const beforeY = below ? box(below).t : null;
    bl.open = true;
    const p = st.querySelector('.condpanel');
    const restPanel = {...box(p), rows:[...p.querySelectorAll('.place')].filter(e=>getComputedStyle(e).display!=='none').map(e=>e.textContent.trim()),
                       cols:[...p.querySelectorAll('.gh')].filter(e=>getComputedStyle(e).display!=='none').map(e=>e.textContent.trim())};
    const bar = box(bl.querySelector('.oneline'));
    return {rest, restPanel, beforeY, restGap: restPanel.t - rest.bot};
  }, id);
  // now the condensed state, driven by real scrolling
  const c = await pg.evaluate(async (id) => {
    const st = document.getElementById(id);
    const sc = st.querySelector('.scroller'), bl = st.querySelector('.fuelblock');
    bl.open = false; sc.scrollTop = 0;
    await new Promise(r=>setTimeout(r,260));
    const fr0 = st.getBoundingClientRect();
    const below = st.querySelector('.promoregion, .promo, .waterline-band');
    const y0 = below ? Math.round(below.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop) : null;
    sc.scrollTop = 260;
    await new Promise(r=>setTimeout(r,320));
    const y1 = below ? Math.round(below.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop) : null;
    const cond = bl.classList.contains('cond');
    bl.querySelector('summary').click();
    await new Promise(r=>setTimeout(r,120));
    const fr = st.getBoundingClientRect();
    const box = e => { const b=e.getBoundingClientRect();
      return {t:Math.round(b.top-fr.top), l:Math.round(b.left-fr.left),
              w:Math.round(b.width), h:Math.round(b.height), bot:Math.round(b.bottom-fr.top)}; };
    const bar = box(bl.querySelector('.oneline')), p = box(st.querySelector('.condpanel'));
    const pe = st.querySelector('.condpanel');
    return {cond, open: bl.open, shift: (y1!==null&&y0!==null)? y1-y0 : null,
            bar, panel:p, seam: p.t - bar.bot, edgeAligned: (p.l===bar.l && p.w===bar.w),
            rows:[...pe.querySelectorAll('.place')].filter(e=>getComputedStyle(e).display!=='none').map(e=>e.textContent.trim()),
            cols:[...pe.querySelectorAll('.gh')].filter(e=>getComputedStyle(e).display!=='none').map(e=>e.textContent.trim()),
            insideFrame: p.bot <= Math.round(fr.height)+1 };
  }, id);
  console.log(id, JSON.stringify({rest:r.rest, restPanelGap:r.restGap, restRows:r.restPanel.rows, restCols:r.restPanel.cols, cond:c}, null, 0));
  console.log('');
}
await b.close();
