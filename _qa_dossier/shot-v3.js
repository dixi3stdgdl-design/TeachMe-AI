const { chromium } = require('D:/pwcli/node_modules/playwright');
const BRAVE = 'C:\\Users\\drbea\\AppData\\Local\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
const OUT = 'D:\\ToolTip AI\\_qa_dossier\\web-v3';
const fs = require('fs');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: BRAVE, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  await page.goto('file:///D:/ToolTip AI/index.html', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: OUT + '/1-hero.png' });
  await page.evaluate(() => document.querySelector('#producto').scrollIntoView());
  await page.waitForTimeout(500);
  await page.screenshot({ path: OUT + '/2-producto.png' });
  await page.evaluate(() => document.querySelector('#precios').scrollIntoView());
  await page.waitForTimeout(500);
  await page.screenshot({ path: OUT + '/3-precios.png' });
  // checkout bundle
  await page.click('button[data-buy="bundle"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: OUT + '/4-checkout-bundle.png' });
  // click pay should show downloads
  await page.click('#ckPay');
  await page.waitForTimeout(400);
  await page.screenshot({ path: OUT + '/5-checkout-dl.png' });
  const dlVisible = await page.locator('#ckDl a').count();
  console.log('download buttons after pay:', dlVisible);
  // free assistant
  await page.click('[data-close]');
  await page.waitForTimeout(200);
  await page.click('button[data-buy="assistant"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: OUT + '/6-checkout-free.png' });
  const freeDl = await page.locator('#ckDl a').count();
  console.log('free download buttons:', freeDl);
  await browser.close();
  console.log('OK');
})().catch((e) => { console.error(e); process.exit(1); });
