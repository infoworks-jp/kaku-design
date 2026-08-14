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
    const app=await fetch(URL+'app.html?qa='+Date.now(),{cache:'no-store'});
    const appHtml=await app.text();
    if(r.ok&&app.ok&&html.includes('日報が入れば')&&appHtml.includes('経営ダッシュボード')){deployed=true;break;}
  }catch{}
  await sleep(5000);
}
if(!deployed) throw new Error('GENBA AI deployment not observable');
const browser=await chromium.launch({headless:true});
const errors=[];
async function checkLanding(width,height,name){
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
async function checkApp(width,height,name){
  const page=await browser.newPage({viewport:{width,height}});
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto(URL+'app.html?view='+name+'&t='+Date.now(),{waitUntil:'networkidle',timeout:90000});
  const h1=await page.locator('h1').innerText();
  const sales=await page.locator('#kSales').innerText();
  const rows=await page.locator('#projectRows tr').count();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
  const before=await page.locator('#entryRows tr').count();
  await page.locator('#entryDays').fill('2');
  await page.locator('#entryOther').fill('15000');
  await page.locator('#entryMemo').fill('自動QA入力');
  await page.locator('#addEntryBtn').click();
  const after=await page.locator('#entryRows tr').count();
  await page.screenshot({path:`${OUT}/${name}.png`,fullPage:true});
  await page.close();
  return {h1,sales,rows,overflow,before,after};
}
const mobile=await checkLanding(390,844,'landing-mobile');
const desktop=await checkLanding(1440,1000,'landing-desktop');
const appMobile=await checkApp(390,844,'app-mobile');
const appDesktop=await checkApp(1440,1000,'app-desktop');
const money=/[¥￥]/;
const pass=!errors.length&&!mobile.overflow&&!desktop.overflow&&!appMobile.overflow&&!appDesktop.overflow&&mobile.title.includes('GENBA AI')&&desktop.h1.includes('日報が入れば')&&money.test(mobile.profit)&&desktop.margin.includes('%')&&appMobile.h1.includes('経営ダッシュボード')&&money.test(appDesktop.sales)&&appDesktop.rows>=3&&appMobile.after>=appMobile.before;
const report={url:URL,pass,errors,mobile,desktop,appMobile,appDesktop,checkedAt:new Date().toISOString()};
fs.writeFileSync(`${OUT}/report.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
await browser.close();
if(!pass)process.exit(1);