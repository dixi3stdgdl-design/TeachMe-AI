const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('partner.microsoft.com')) || ctx.pages()[0];
  await page.bringToFront();
  await page.goto('https://partner.microsoft.com/es-es/dashboard/account/v3/usermanagement', {
    waitUntil: 'domcontentloaded', timeout: 90000
  });
  await page.waitForTimeout(5000);
  const t = await page.innerText('body').catch(() => '');
  fs.writeFileSync(`${OUT}/um_start.txt`, t);
  console.log('BODY', t.slice(0, 800).replace(/\n/g, ' | '));

  // Click Entra sign-in if present
  const entra = page.locator('a:has-text("Iniciar sesión con Microsoft Entra ID")').first();
  if (await entra.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log('ENTRA_LOGIN_NEEDED');
    const href = await entra.getAttribute('href');
    console.log('HREF', href);
    await page.goto('https://partner.microsoft.com/aad?action=signin&prompt=select_account&returnPath=/es-es/dashboard/account/v3/usermanagement', {
      waitUntil: 'domcontentloaded', timeout: 60000
    });
    await page.waitForTimeout(4000);
    for (const p of ctx.pages()) {
      console.log('PAGE', await p.title(), '|', p.url().slice(0, 140));
    }
    const loginText = await page.innerText('body').catch(() => '');
    console.log('LOGIN', loginText.slice(0, 600).replace(/\n/g, ' | '));
    await page.screenshot({ path: `${OUT}/entra_login_for_user.png`, fullPage: true });
  } else {
    console.log('ALREADY_AUTH_OR_OTHER');
    console.log(t.slice(0, 1500));
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
