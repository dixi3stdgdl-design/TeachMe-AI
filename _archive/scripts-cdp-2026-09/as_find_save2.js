const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();

  // Search raw HTML for Guardar/Save
  const found = await page.evaluate(() => {
    const html = document.documentElement.outerHTML;
    const idxs = [];
    for (const re of [/Guardar/g, /Save/g, /btn-save/g, /save-button/g, /primary/g]) {
      let m;
      let c = 0;
      while ((m = re.exec(html)) && c < 5) {
        idxs.push({ re: re.source, at: m.index, ctx: html.slice(Math.max(0, m.index - 80), m.index + 80).replace(/\s+/g, ' ') });
        c++;
      }
    }
    return idxs;
  });
  console.log(JSON.stringify(found, null, 1).slice(0, 3500));

  // sticky/fixed elements
  const sticky = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      if ((cs.position === 'fixed' || cs.position === 'sticky') && el.getBoundingClientRect().height > 20) {
        out.push({
          tag: el.tagName,
          cls: (el.className || '').toString().slice(0, 60),
          t: (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 80),
          y: Math.round(el.getBoundingClientRect().y)
        });
      }
    }
    return out.slice(0, 15);
  });
  console.log('STICKY', JSON.stringify(sticky, null, 1));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
