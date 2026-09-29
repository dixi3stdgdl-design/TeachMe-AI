const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('partner.microsoft.com')) || ctx.pages()[0];
  await page.bringToFront();

  // Assistant full dump
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/overview', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);
  await page.screenshot({ path: `${OUT}/assistant_now2.png`, fullPage: true });
  let t = await page.innerText('body').catch(() => '');
  fs.writeFileSync(`${OUT}/assistant_now2.txt`, t, 'utf8');
  console.log('==== ASSISTANT ====');
  console.log(t.split('\n').map(s=>s.trim()).filter(Boolean).slice(0, 60).join('\n'));

  // Translate report
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(6000);
  const btn = page.locator('button, a').filter({ hasText: /Ver el informe|Ver informe|View report/i }).first();
  if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${OUT}/translate_report_open.png`, fullPage: true });
    t = await page.innerText('body').catch(() => '');
    fs.writeFileSync(`${OUT}/translate_report_open.txt`, t, 'utf8');
    console.log('==== TRANSLATE REPORT ====');
    console.log(t.slice(0, 4000));
  } else {
    console.log('No report button');
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
