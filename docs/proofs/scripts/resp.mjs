import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();
for(const w of [390,600,834,1100,1440]){
  const pg=await b.newPage({viewport:{width:w,height:900}});
  await pg.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
  await pg.waitForTimeout(500);
  const r=await pg.evaluate(()=>{
    const de=document.documentElement;
    const boards=[...document.querySelectorAll('.board')];
    const overflowing=boards.filter(b=>b.scrollWidth>b.clientWidth+1).length;
    // anything sticking out past the body box?
    const wide=[...document.querySelectorAll('body *')].filter(e=>{
      const r=e.getBoundingClientRect();
      return r.right>de.clientWidth+2 && getComputedStyle(e).position!=='fixed'
        && !e.closest('.board');   // boards scroll internally by design
    }).slice(0,4).map(e=>e.className||e.tagName);
    return {bodyScrollW:de.scrollWidth, viewport:de.clientWidth,
      horizontalPageScroll: de.scrollWidth>de.clientWidth+1,
      boardsThatScrollSideways: overflowing+'/'+boards.length,
      leakingOutsideBoards: wide};
  });
  console.log(w, JSON.stringify(r));
  await pg.close();
}
await b.close();
