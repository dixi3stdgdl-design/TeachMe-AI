const { chromium } = require('D:/pwcli/node_modules/playwright');
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();
  for (const [id, name] of [['9N3D02KXKD3D','ToolTip AI'],['9NQN3RZ2Z655','ToolTip AI Translate']]) {
    await page.goto(`https://partner.microsoft.com/es-es/dashboard/products/${id}/overview`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);
    const t = await page.innerText('body').catch(() => '');
    const state = (t.match(/En proceso de certificación|En borrador|Con errores|Publicada/) || ['?'])[0];
    console.log(name, '->', state);
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
