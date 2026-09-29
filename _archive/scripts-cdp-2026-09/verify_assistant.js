const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('partner.microsoft.com')) || ctx.pages()[0];
  await page.bringToFront();
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/overview', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(7000);
  const t = await page.innerText('body').catch(() => '');
  fs.writeFileSync(`${OUT}/assistant_final_status.txt`, t);
  console.log(t.split('\n').map(s => s.trim()).filter(l => l && /certific|borrador|proceso|error|env[ií]o|Submission|Validated|1\./i.test(l)).slice(0, 25).join('\n'));
  await page.screenshot({ path: `${OUT}/assistant_final_status.png`, fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
