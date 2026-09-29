const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(1000);

  const hits = await page.evaluate(() => {
    const out = [];
    const walk = (root, d = 0) => {
      if (d > 12 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('*')) {
        const t = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
        if (t && t.includes('Opciones de envío') && t.length < 200) {
          const r = el.getBoundingClientRect();
          if (r.width > 0) out.push({ t: t.slice(0, 100), tag: el.tagName, x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2), w: Math.round(r.width), h: Math.round(r.height) });
        }
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return out;
  });
  console.log(JSON.stringify(hits, null, 1));
  // click smallest
  const c = hits.sort((a,b) => a.w*a.h - b.w*b.h)[0];
  if (c) {
    await page.mouse.click(c.x, c.y);
    await page.waitForTimeout(5000);
    console.log('URL', page.url());
    const t = await page.innerText('body').catch(() => '');
    console.log(t.slice(0, 3000));
    fs.writeFileSync(`${OUT}/as_options3.txt`, t);
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
