const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();
  const info = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')].map((el, i) => {
      const r = el.getBoundingClientRect();
      return { i, alt: el.alt, y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    }).filter(x => x.w > 50);
    const tabs = [...document.querySelectorAll('he-tab, [role=tab]')].map(el => ({
      t: (el.innerText || el.textContent || '').trim(),
      y: Math.round(el.getBoundingClientRect().y)
    })).filter(x => x.t.includes('Escritorio') || x.t.includes('Xbox'));
    return { imgs: imgs.slice(0, 20), tabs };
  });
  console.log(JSON.stringify(info, null, 1));
  await page.screenshot({ path: `${OUT}/tr_state_full.png`, fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
