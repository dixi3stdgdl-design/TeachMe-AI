const { chromium } = require('D:/pwcli/node_modules/playwright');
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('usermanagement')) || ctx.pages()[0];
  await page.bringToFront();
  await page.goto('https://partner.microsoft.com/aad?action=signin&prompt=select_account&returnPath=/es-es/dashboard/account/v3/usermanagement', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  for (const p of ctx.pages()) {
    console.log('PAGE', await p.title(), '|', p.url().slice(0, 160));
  }
  const text = await page.innerText('body').catch(() => '');
  console.log('BODY', text.slice(0, 1500));
  await page.screenshot({ path: 'D:/ToolTip AI/scripts/cdp_status_now/entra_signin.png', fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
