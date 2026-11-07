import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const expectedCount=JSON.parse(await readFile(new URL('../public/projects.json',import.meta.url),'utf8')).length;
const base=process.env.TEST_URL||'http://127.0.0.1:4175';
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
await mkdir('work/qa',{recursive:true});const reports=[];
try {
 for(const [width,height] of [[1440,900],[1194,834],[834,1194],[768,1024],[390,844],[844,390]]){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base);await page.locator('.app-card').first().waitFor();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${width}×${height}`);
  await page.waitForFunction(()=>[...document.images].every(image=>image.complete&&image.naturalWidth>0));
  for(const img of await page.locator('img').all())assert(await img.evaluate(el=>el.complete&&el.naturalWidth>0),'image loads');
  const link=page.getByRole('link',{name:'打开拼音小花园（新窗口）'});assert.equal(await link.getAttribute('target'),'_blank');assert.match(await link.getAttribute('rel'),/noopener/);
  await context.route('https://zhiyanren.github.io/pinyin-garden-pages/',route=>route.fulfill({contentType:'text/html',body:'<title>目标应用</title>'}));
  const popupPromise=page.waitForEvent('popup');await link.click();const popup=await popupPromise;await popup.waitForLoadState();
  assert.equal(popup.url(),'https://zhiyanren.github.io/pinyin-garden-pages/');assert.equal(await popup.evaluate(()=>window.opener),null);await popup.close();
  await page.locator('#search').fill('不存在的应用');assert(await page.locator('#empty').isVisible());
  await page.getByRole('button',{name:'清除搜索'}).click();assert.equal(await page.locator('.app-card').count(),expectedCount);
  await page.getByRole('button',{name:'收藏拼音小花园',exact:true}).click();assert.equal(await page.getByRole('button',{name:'取消收藏拼音小花园',exact:true}).getAttribute('aria-pressed'),'true');
  await page.reload();await page.locator('.app-card').first().waitFor();assert(await page.getByRole('button',{name:'取消收藏拼音小花园',exact:true}).isVisible());
  await page.locator('[data-view="favorites"]').click();assert.equal(await page.locator('.app-card').count(),1);
  await page.getByRole('button',{name:'取消收藏拼音小花园',exact:true}).click();assert(await page.locator('#empty').isVisible());
  await page.locator('#empty-reset').click();await page.keyboard.press('Tab');
  await page.setViewportSize({width:height,height:width});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'rotation no overflow');
  await page.setViewportSize({width,height});
  assert.equal(await page.locator('.app-card').first().evaluate(el=>getComputedStyle(el).animationName),'none','reduced motion');
  const touch=await page.locator('.favorite-button').first().boundingBox();assert(touch.width>=44&&touch.height>=44);
  for(const pending of await page.locator('.app-link[aria-disabled="true"]').all())assert.equal(await pending.getAttribute('href'),null,'pending has no URL');
  await page.screenshot({path:`work/qa/home-${width}.png`,fullPage:true});assert.deepEqual(errors,[]);
  reports.push({width,height,checks:['new-window destination','opener isolation','search clear and empty','favorite persistence','empty recovery','touch target','rotation','reduced motion','logo loading']});await context.close();
 }
 const pendingContext=await browser.newContext(),pendingPage=await pendingContext.newPage();
 const pendingFixture=JSON.parse(await readFile(new URL('../public/projects.json',import.meta.url),'utf8'));
 pendingFixture.push({id:'unpublished-fixture',name:'尚未发布的项目',description:'等待正式发布',category:'工具',icon:'./assets/logo.svg',status:'pending',url:null});
 await pendingPage.route('**/projects.json',route=>route.fulfill({json:pendingFixture}));await pendingPage.goto(base);
 const pendingCard=pendingPage.locator('[data-project="unpublished-fixture"]');await pendingCard.waitFor();
 assert.equal(await pendingCard.locator('a').count(),0,'pending card must not contain a link');assert.equal(await pendingCard.locator('[aria-disabled="true"]').count(),1);assert(await pendingCard.getByText('准备中',{exact:true}).isVisible());await pendingContext.close();
 const context=await browser.newContext(),page=await context.newPage();let fail=true;
 await page.route('**/projects.json',route=>fail?route.abort():route.continue());
 await page.goto(base);assert(await page.locator('#error').isVisible());fail=false;await page.locator('#retry').click();await page.locator('.app-card').first().waitFor();assert.equal(await page.locator('#error').isVisible(),false);
 await context.close();
 const blocked=await browser.newContext();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError');}}));
 const restricted=await blocked.newPage();await restricted.goto(base);await restricted.locator('.app-card').first().waitFor();await restricted.getByRole('button',{name:'收藏拼音小花园',exact:true}).click();assert(await restricted.locator('#notice').isVisible());assert.equal(await restricted.getByRole('button',{name:'取消收藏拼音小花园',exact:true}).getAttribute('aria-pressed'),'true');await blocked.close();
 await writeFile('work/qa/report.json',JSON.stringify({physicalDevice:false,browser:'Chrome with touch emulation',reports,failureChecks:['pending card not clickable','catalog retry','localStorage denied']},null,2)+'\n');console.log(`PASS ${reports.length} viewports, popup and failure paths`);
} finally {await browser.close();}
