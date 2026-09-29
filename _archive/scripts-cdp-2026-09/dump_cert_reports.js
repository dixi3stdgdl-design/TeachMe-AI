const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
async function dumpReport(page, id, name) {
  await page.goto(`https://partner.microsoft.com/es-es/dashboard/products/${id}/overview`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(7000);
  await page.screenshot({ path: `${OUT}/${name}_before_report.png`, fullPage: true });
  const els = await page.evaluate(() => Array.from(document.querySelectorAll('button,a,[role=button]')).map(n => ({
    t: (n.innerText || n.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80)
  })).filter(x => x.t));
  console.log(name, 'CONTROLS', JSON.stringify(els.filter(e => /informe|report|reenviar|volver|certific/i.test(e.t))));
  const btn = page.locator('button, a, [role="button"]').filter({ hasText: /informe|report/i }).first();
  if (!(await btn.isVisible({ timeout: 4000 }).catch(() => false))) {
    console.log(name, 'NO REPORT BTN');
    const t0 = await page.innerText('body').catch(() => '');
    fs.writeFileSync(`${OUT}/${name}_overview_full.txt`, t0);
    return;
  }
  await btn.click();
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${OUT}/${name}_report_open.png`, fullPage: true });
  const t = await page.innerText('body').catch(() => '');
  fs.writeFileSync(`${OUT}/${name}_report_open.txt`, t);
  console.log('====', name, 'REPORT ====');
  console.log(t.slice(0, 5000));
}
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('partner.microsoft.com')) || ctx.pages()[0];
  await page.bringToFront();
  await dumpReport(page, '9N3D02KXKD3D', 'assistant');
  await dumpReport(page, '9NQN3RZ2Z655', 'translate');
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
