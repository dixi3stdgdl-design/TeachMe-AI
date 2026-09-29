const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();

  for (let pass = 0; pass < 4; pass++) {
    const del = await page.evaluate(() => {
      const out = [];
      const walk = (root, d = 0) => {
        if (d > 15 || !root.querySelectorAll) return;
        for (const el of root.querySelectorAll('he-button, button')) {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && r.width <= 30 && r.height > 15 && r.height <= 35 && r.y > 880 && r.y < 1950 && Math.abs(r.x - 665) < 15) {
            out.push({ x: r.x + r.width/2, y: r.y + r.height/2 });
          }
          if (el.shadowRoot) walk(el.shadowRoot, d + 1);
        }
      };
      walk(document);
      return out;
    });
    if (!del.length) { console.log('no more deletes'); break; }
    const t = del[del.length - 1]; // bottom first
    console.log('click', t);
    await page.mouse.click(t.x, t.y);
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${OUT}/tr_del_pass${pass}.png` });
  }

  const imgs = await page.evaluate(() => document.querySelectorAll('img[alt="listing-screenshot-image"]').length);
  console.log('REMAINING_IMGS', imgs);
  await page.screenshot({ path: `${OUT}/tr_after_del2.png`, fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
