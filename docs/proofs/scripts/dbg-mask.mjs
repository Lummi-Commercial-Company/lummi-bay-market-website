import {chromium} from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:900}});
p.on('console',m=>console.log('PAGE:',m.text()));
await p.goto('file://'+process.cwd()+'/fuel-strip-proof.html');
await p.waitForTimeout(400);
const r=await p.evaluate(async()=>{
  const el=document.querySelector('#j-phone .loccard .motif');
  const cs=getComputedStyle(el);
  const raw=getComputedStyle(document.documentElement).getPropertyValue('--m-canoe').trim();
  // does the data URI itself decode to a valid image?
  const src=raw.replace(/^url\((['"]?)/,'').replace(/(['"]?)\)$/,'');
  const load=await new Promise(res=>{const i=new Image();
    i.onload=()=>res('loaded '+i.naturalWidth+'x'+i.naturalHeight);
    i.onerror=()=>res('ERROR');i.src=src;});
  return {maskImage:cs.maskImage.slice(0,60), webkitMask:cs.webkitMaskImage.slice(0,60),
    maskSize:cs.maskSize, maskRepeat:cs.maskRepeat,
    varLen:raw.length, varHead:raw.slice(0,70), imgLoad:load};});
console.log(JSON.stringify(r,null,1));await b.close();
