const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();
  for (const [id, name] of [['9N3D02KXKD3D','assistant'],['9NQN3RZ2Z655','translate']]) {
    await page.goto(`https://partner.microsoft.com/es-es/dashboard/products/${id}/overview`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(6000);
    const t = await page.innerText('body').catch(() => '');
    fs.writeFileSync(`${OUT}/${name}_status_now.txt`, t);
    const key = t.split('\n').map(s => s.trim()).filter(l => l && /borrador|certific|error|public|env[ií]o|Submission|Con errores|aprob/i.test(l));
    console.log('\n====', name, '====');
    console.log(key.join('\n'));
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
