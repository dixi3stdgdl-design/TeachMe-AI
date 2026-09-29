const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('partner')) || ctx.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(4000);
  console.log('URL', page.url());
  const t = await page.innerText('body').catch(() => '');
  fs.writeFileSync(`${OUT}/tr_live_now.txt`, t);
  console.log(t.slice(0, 3500));
  await page.screenshot({ path: `${OUT}/tr_live_now.png`, fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
