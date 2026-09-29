const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();

  const clicked = await page.evaluate(() => {
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return false;
      for (const el of root.querySelectorAll('he-button, button, a')) {
        const t = (el.innerText || el.textContent || '').trim();
        if (t === 'Inicio de sesión' || t === 'Iniciar sesión') {
          const r = el.getBoundingClientRect();
          if (r.width > 0) {
            const inner = el.shadowRoot && el.shadowRoot.querySelector('button');
            if (inner) inner.click(); else el.click();
            return true;
          }
        }
        if (el.shadowRoot) if (walk(el.shadowRoot, d + 1)) return true;
      }
      return false;
    };
    return walk(document);
  });
  console.log('clicked login', clicked);
  await page.waitForTimeout(5000);
  for (const p of ctx.pages()) {
    console.log('PAGE', (await p.title()).slice(0, 40), '|', p.url().slice(0, 120));
  }
  await page.screenshot({ path: `${OUT}/tr_login_again.png`, fullPage: true });
  const t = await page.innerText('body').catch(() => '');
  console.log(t.slice(0, 800).replace(/\n/g, ' | '));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
