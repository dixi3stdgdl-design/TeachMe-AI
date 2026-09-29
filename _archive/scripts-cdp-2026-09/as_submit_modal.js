const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/overview', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  // Click submit
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
  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${OUT}/as_modal_full.png`, fullPage: true });
  const t = await page.innerText('body').catch(() => '');
  console.log('AFTER_CLICK', t.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 50).join(' | '));

  // All buttons now
  const btns = await page.evaluate(() => {
    const out = [];
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('he-button, button, a')) {
        const t = (el.innerText || el.textContent || '').trim();
        const r = el.getBoundingClientRect();
        if (t && t.length < 50 && r.width > 0 && r.y > 100 && r.y < 900) {
          out.push({ t: t.replace(/\s+/g, ' ').slice(0, 40), x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2), tag: el.tagName });
        }
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return out;
  });
  console.log('BTNS', JSON.stringify(btns, null, 1));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
