const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('partner.microsoft.com')) || ctx.pages()[0];
  await page.bringToFront();

  await page.goto('https://partner.microsoft.com/aad?action=signin&prompt=select_account&returnPath=/es-es/dashboard/account/v3/usermanagement', {
    waitUntil: 'domcontentloaded', timeout: 60000
  });
  await page.waitForTimeout(5000);

  for (const p of ctx.pages()) {
    console.log('PAGE', (await p.title()).slice(0, 50), '|', p.url().slice(0, 160));
    const t = await p.innerText('body').catch(() => '');
    if (t) console.log('  ', t.slice(0, 400).replace(/\n/g, ' | '));
    await p.screenshot({ path: `${OUT}/entra_post_login.png`, fullPage: true }).catch(() => {});
  }

  // If account picker, pick first account
  const pick = page.locator('[data-test-id], .tile, .table, div[role=button]').filter({ hasText: /DIxStdGdl|hotmail|Octavio/i }).first();
  if (await pick.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('PICKING ACCOUNT');
    await pick.click();
    await page.waitForTimeout(6000);
  }

  await page.waitForTimeout(4000);
  console.log('NOW', page.url());
  const t2 = await page.innerText('body').catch(() => '');
  console.log('AFTER', t2.slice(0, 1500));
  fs.writeFileSync(`${OUT}/um_entra_attempt2.txt`, t2);
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
