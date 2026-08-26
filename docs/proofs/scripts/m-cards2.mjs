import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:1100}});
await p.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await p.waitForTimeout(500);
const r=await p.evaluate(async()=>{
  const out={};
  const R=el=>el.getBoundingClientRect();
  for(const id of ['j-phone','j-phone-int','j-phone-ts','j-desk','j-desk-int','j-desk-ts']){
    const st=document.querySelector('#'+id); const sc=st.querySelector('.scroller');
    const wrap=st.querySelector('.loccards'); const btn=st.querySelector('.totop');
    const o={btn:!!btn};
    if(wrap) o.cards={total:Math.round(R(wrap).height),
        each:[...wrap.children].map(c=>Math.round(R(c).height)),
        clipped:[...wrap.children].map(c=>{const q=c.querySelector('p');
          return q.scrollHeight>Math.ceil(R(q).height)+1;})};
    // button behaviour
    sc.scrollTop=0; await new Promise(r=>requestAnimationFrame(r));
    o.atTop=btn?btn.classList.contains('on'):null;
    sc.scrollTop=sc.clientHeight+40;
    await new Promise(r=>setTimeout(r,80));
    o.scrolled=btn?btn.classList.contains('on'):null;
    if(btn){const q=R(btn);o.size=[Math.round(q.width),Math.round(q.height)];
      const s2=R(st);o.inside=q.right<=s2.right+1&&q.bottom<=s2.bottom+1;
      // does it sit on top of anything clickable?
      const cx=q.left+q.width/2, cy=q.top+q.height/2;
      const under=document.elementsFromPoint(cx,cy).filter(e=>e!==btn)
        .map(e=>e.closest('a,button')).filter(Boolean)[0];
      o.covers=under?(under.textContent||'').trim().slice(0,28):null;}
    out[id]=o;
  }
  return out;});
console.log(JSON.stringify(r,null,1));await b.close();
