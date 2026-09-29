const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
async function full(page, id, name) {
  await page.goto(`https://partner.microsoft.com/es-es/dashboard/products/${id}/overview`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  const t = await page.innerText('body').catch(() => '');
  fs.writeFileSync(`${OUT}/${name}_final_review.txt`, t);
  console.log('\n====', name, '====');
  console.log(t.split('\n').map(s => s.trim()).filter(Boolean).slice(8, 45).join('\n'));
}
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();
  await full(page, '9N3D02KXKD3D', 'assistant');
  await full(page, '9NQN3RZ2Z655', 'translate');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
