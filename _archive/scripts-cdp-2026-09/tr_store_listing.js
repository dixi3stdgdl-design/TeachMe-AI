const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('9NQN3RZ2Z655') || p.url().includes('managelanguages')) || ctx.pages()[0];
  await page.bringToFront();

  // Click "Descripciones de Store" in submission nav
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/submissions/1152921505701891994/store-listing', {
    waitUntil: 'domcontentloaded', timeout: 60000
  });
  await page.waitForTimeout(6000);
  console.log('URL', page.url());
  const t = await page.innerText('body').catch(() => '');
  fs.writeFileSync(`${OUT}/tr_store_listing.txt`, t);
  console.log(t.slice(0, 4000));
  await page.screenshot({ path: `${OUT}/tr_store_listing.png`, fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
