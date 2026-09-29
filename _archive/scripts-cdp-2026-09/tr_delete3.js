const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();

  // Inspect the small button HTML
  const html = await page.evaluate(() => {
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return null;
      for (const el of root.querySelectorAll('he-button')) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.width <= 30 && r.y > 880 && r.y < 1950 && Math.abs(r.x - 665) < 15) {
          return {
            outer: el.outerHTML.slice(0, 600),
            shadow: el.shadowRoot ? el.shadowRoot.innerHTML.slice(0, 600) : null
          };
        }
        if (el.shadowRoot) {
          const r2 = walk(el.shadowRoot, d + 1);
          if (r2) return r2;
        }
      }
      return null;
    };
    return walk(document);
  });
  console.log(JSON.stringify(html, null, 1));

  // Click via inner shadow button
  const clicked = await page.evaluate(() => {
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return false;
      for (const el of root.querySelectorAll('he-button')) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.width <= 30 && r.y > 880 && r.y < 1950 && Math.abs(r.x - 665) < 15) {
          const inner = el.shadowRoot && el.shadowRoot.querySelector('button');
          if (inner) { inner.click(); return 'inner'; }
          el.click();
          return 'outer';
        }
        if (el.shadowRoot) {
          if (walk(el.shadowRoot, d + 1)) return true;
        }
      }
      return false;
    };
    return walk(document);
  });
  console.log('clicked', clicked);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT}/tr_del_try3.png`, fullPage: true });
  const t = await page.innerText('body').catch(() => '');
  console.log('SNIP', t.split('\n').map(s => s.trim()).filter(l => /captura|escritorio|confirmar|eliminar|seguro/i.test(l)).slice(0, 12).join(' | '));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
