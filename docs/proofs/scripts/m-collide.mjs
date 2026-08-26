import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1400,height:1100}});
await p.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await p.waitForTimeout(400);
const r=await p.evaluate(async()=>{const out={};
 for(const id of ['j-phone','j-phone-int','j-phone-ts','j-desk','j-desk-int','j-desk-ts']){
  const st=document.querySelector('#'+id), sc=st.querySelector('.scroller'),
        btn=st.querySelector('.totop');
  st.scrollIntoView({block:'center'});
  sc.scrollTop=sc.scrollHeight;                      // all the way down
  btn.classList.add('on');                           // force visible for the geometry test
  await new Promise(r=>setTimeout(r,260));
  const q=btn.getBoundingClientRect();
  const hits=[];
  // every link the button's disc overlaps
  for(const a of st.querySelectorAll('a,button')){
    if(a===btn) continue; const z=a.getBoundingClientRect();
    if(z.width===0) continue;
    if(q.left<z.right&&q.right>z.left&&q.top<z.bottom&&q.bottom>z.top)
      hits.push((a.textContent||'').trim().slice(0,24)||a.className);}
  // and what actually receives a tap at the button's centre
  const el=document.elementFromPoint(q.left+q.width/2,q.top+q.height/2);
  out[id]={overlaps:hits, tapCentreIsButton: el===btn||btn.contains(el),
    gapToNearestLink: (()=>{let m=1e9;
      for(const a of st.querySelectorAll('.homefoot a')){const z=a.getBoundingClientRect();
        if(z.width===0)continue;
        const dx=Math.max(z.left-q.right,q.left-z.right,0),
              dy=Math.max(z.top-q.bottom,q.top-z.bottom,0);
        m=Math.min(m,Math.round(Math.hypot(dx,dy)));}
      return m===1e9?null:m;})()};
  btn.classList.remove('on');}
 return out;});
console.log(JSON.stringify(r,null,1));await b.close();
