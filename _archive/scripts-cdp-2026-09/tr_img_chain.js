const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();

  // Get parent chain of first screenshot
  const chain = await page.evaluate(() => {
    const img = document.querySelector('img[alt="listing-screenshot-image"]');
    if (!img) return 'no img';
    let el = img;
    const out = [];
    for (let i = 0; i < 10 && el; i++) {
      out.push({
        tag: el.tagName,
        cls: (el.className || '').toString().slice(0, 80),
        id: el.id || '',
        htmlLen: el.outerHTML ? el.outerHTML.length : 0
      });
      el = el.parentElement;
    }
    // sibling controls
    let p = img;
    for (let i = 0; i < 6; i++) p = p.parentElement;
    const html = p ? p.outerHTML.slice(0, 4000) : '';
    return { chain: out, html };
  });
  console.log(JSON.stringify(chain, null, 1).slice(0, 5000));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
