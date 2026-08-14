const { chromium } = await import('/tmp/genbaqa/node_modules/playwright/index.mjs');
import fs from 'node:fs';
const URL='https://infoworks-jp.github.io/kaku-design/genba-ai/';
const OUT='genba-ai-evidence';
fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let deployed=false;
for(let i=0;i<60;i++){
  try{
    const r=await fetch(URL+'?qa='+Date.now(),{cache:'no-store'});
    const html=await r.text();
    if(r.ok&&html.includes('日報が入れば')&&html.includes('GENBA AI')){deployed=true;break;}
  }catch{}
  await sleep(5000);
}
if(!deployed) throw new Error('GENBA AI deployment not observable');
const browser=await chromium.launch({headless:true});
const errors=[];
async function check(width,height,name){
  const page=await browser.newPage({viewport:{width,height}});
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto(URL+'?view='+name+'&t='+Date.now(),{waitUntil:'networkidle',timeout:90000});
  await page.screenshot({path:`${OUT}/${name}.png`,fullPage:true});
  const title=await page.title();
  const h1=await page.locator('h1').innerText();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
  await page.locator('#sales').fill('2500000');
  await page.locator('#days').fill('80');
  await page.locator('#labor').fill('19000');
  await page.locator('#other').fill('200000');
  await page.locator('#calc').click();
  const profit=await page.locator('#profit').innerText();
  const margin=await page.locator('#margin').innerText();
  const verdict=await page.locator('#judgement').innerText();
  await page.screenshot({path:`${OUT}/${name}-calc.png`,fullPage:true});
  await page.close();
  return {title,h1,overflow,profit,margin,verdict};
}
const mobile=await check(390,844,'mobile');
const desktop=await check(1440,1000,'desktop');
const pass=!errors.length&&!mobile.overflow&&!desktop.overflow&&mobile.title.includes('GENBA AI')&&desktop.h1.includes('日報が入れば')&&mobile.profit.includes('¥')&&desktop.margin.includes('%');
const report={url:URL,pass,errors,mobile,desktop,checkedAt:new Date().toISOString()};
fs.writeFileSync(`${OUT}/report.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
await browser.close();
if(!pass)process.exit(1);