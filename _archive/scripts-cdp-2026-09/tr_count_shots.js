const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(2000);

  const imgs = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('img')) {
      const r = el.getBoundingClientRect();
      if (r.width > 100 && r.y > 850 && r.y < 2000) {
        out.push({ x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), alt: el.alt || '' });
      }
    }
    return out;
  });
  console.log('IMGS', JSON.stringify(imgs));

  // Find he-buttons with aria-label near screenshots
  const btns = await page.evaluate(() => {
    const out = [];
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('he-button, button, [role=button]')) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.y > 880 && r.y < 1950) {
          out.push({
            aria: el.getAttribute('aria-label') || '',
            title: el.getAttribute('title') || '',
            t: (el.innerText || el.textContent || '').trim().slice(0, 25),
            x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2),
            w: Math.round(r.width), h: Math.round(r.height)
          });
        }
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return out;
  });
  console.log('BTNS', JSON.stringify(btns, null, 1).slice(0, 3000));
  await page.screenshot({ path: `${OUT}/tr_shots_state.png`, fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
