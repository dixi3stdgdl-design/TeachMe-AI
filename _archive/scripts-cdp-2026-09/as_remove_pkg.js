const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();

  // Click Remove under 1.0.4.0
  const clicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button, he-button')];
    for (const el of btns) {
      const t = (el.innerText || el.textContent || '').trim();
      const r = el.getBoundingClientRect();
      if (t === 'Remove' && r.width > 0 && r.y > 1200 && r.y < 1500) {
        const inner = el.shadowRoot && el.shadowRoot.querySelector('button');
        if (inner) inner.click(); else el.click();
        return { x: r.x, y: r.y };
      }
    }
    return null;
  });
  console.log('removed', clicked);
  await page.waitForTimeout(3000);

  // Search all text for Save in any language / footer
  const t = await page.innerText('body').catch(() => '');
  const lines = t.split('\n').map(s => s.trim()).filter(Boolean);
  console.log('LAST40', lines.slice(-40).join(' | '));

  // Find he-button with appearance primary at bottom
  const prim = await page.evaluate(() => {
    const out = [];
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('he-button, button')) {
        const r = el.getBoundingClientRect();
        if (r.width > 40 && r.height > 20) {
          const t = (el.innerText || el.textContent || '').trim();
          out.push({ t: t.slice(0, 25), appearance: el.getAttribute('appearance') || '', y: Math.round(r.y), x: Math.round(r.x), tag: el.tagName });
        }
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return out;
  });
  console.log('PRIMARY', JSON.stringify(prim, null, 1).slice(0, 2500));
  await page.screenshot({ path: `${OUT}/as_after_remove.png`, fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
