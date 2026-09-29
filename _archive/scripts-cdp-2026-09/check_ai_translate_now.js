const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const path = require('path');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('partner.microsoft.com')) || ctx.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(2000);
  // First dump usermanagement body
  const um = await page.innerText('body').catch(() => '');
  console.log('UM_SNIP', um.slice(0, 800).replace(/\n/g, ' | '));

  const apps = [
    { name: 'assistant', id: '9N3D02KXKD3D' },
    { name: 'translate', id: '9NQN3RZ2Z655' }
  ];
  for (const app of apps) {
    console.log('\n====', app.name, app.id, '====');
    await page.goto(`https://partner.microsoft.com/es-es/dashboard/products/${app.id}/overview`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(6000);
    await page.screenshot({ path: `${OUT}/${app.name}_now.png`, fullPage: true });
    const t = await page.innerText('body').catch(() => '');
    fs.writeFileSync(`${OUT}/${app.name}_now.txt`, t, 'utf8');
    const lines = t.split('\n').map(s => s.trim()).filter(Boolean);
    console.log(lines.filter(l => /certific|borrador|error|env[ií]o|public|rechaz|Con errores|Validated|Informe|acciones|atenci/i.test(l)).slice(0, 30).join('\n'));
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
