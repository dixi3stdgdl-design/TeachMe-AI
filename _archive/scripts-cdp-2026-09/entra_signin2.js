const { chromium } = require('D:/pwcli/node_modules/playwright');
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('usermanagement') || p.url().includes('partner.microsoft.com'));
  await page.bringToFront();
  const link = page.locator('a:has-text("Iniciar sesión con Microsoft Entra ID")').first();
  console.log('count', await link.count());
  await link.click({ timeout: 15000 }).catch(e => console.log('click err', e.message));
  await page.waitForTimeout(5000);
  for (const p of ctx.pages()) {
    console.log('PAGE', (await p.title()).slice(0, 60), '|', p.url().slice(0, 180));
    const t = await p.innerText('body').catch(() => '');
    if (t) console.log('  TEXT:', t.slice(0, 500).replace(/\n/g, ' | '));
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
