const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/overview', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  await page.evaluate(() => {
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('he-button, button')) {
        const t = (el.innerText || el.textContent || '').trim();
        if (/^Enviar para certificación$/i.test(t)) {
          const r = el.getBoundingClientRect();
          if (r.width > 0) {
            const inner = el.shadowRoot && el.shadowRoot.querySelector('button');
            if (inner) inner.click(); else el.click();
          }
        }
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
  });
  await page.waitForTimeout(7000);
  const t = await page.innerText('body').catch(() => {});
  fs.writeFileSync(`${OUT}/tr_submit_now.txt`, t);
  console.log(t.split('\n').map(s => s.trim()).filter(l => /borrador|certific|env[ií]o|error|proceso/i.test(l)).slice(0, 15).join(' | '));
  await page.screenshot({ path: `${OUT}/tr_submit_now.png`, fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
