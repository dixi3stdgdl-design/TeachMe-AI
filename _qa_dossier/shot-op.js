const { chromium } = require('D:/pwcli/node_modules/playwright');
const BRAVE = 'C:\\Users\\drbea\\AppData\\Local\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
(async () => {
  const browser = await chromium.launch({ executablePath: BRAVE, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('file:///D:/ToolTip AI/index.html', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'D:/ToolTip AI/_qa_dossier/web-v3/E-opaco-hero.png' });
  await page.evaluate(() => document.querySelector('#precios').scrollIntoView({block:'center'}));
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'D:/ToolTip AI/_qa_dossier/web-v3/E-opaco-precios.png' });
  await browser.close();
  console.log('ok');
})().catch(e => { console.error(e); process.exit(1); });
