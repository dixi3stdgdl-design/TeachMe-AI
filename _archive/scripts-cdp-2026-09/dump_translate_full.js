const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('partner.microsoft.com')) || ctx.pages()[0];
  await page.bringToFront();
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);
  const t = await page.innerText('body').catch(() => '');
  fs.writeFileSync(`${OUT}/translate_full_overview.txt`, t);
  console.log(t.slice(0, 6000));
  await page.screenshot({ path: `${OUT}/translate_full_overview.png`, fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
