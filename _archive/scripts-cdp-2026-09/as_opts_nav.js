const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();

  const hits = await page.evaluate(() => {
    const out = [];
    const walk = (root, d = 0) => {
      if (d > 12 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('a, button, he-button, [role=tab], [role=link]')) {
        const t = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
        const href = el.getAttribute('href') || '';
        if (/Opciones de envío/i.test(t + href) && t.length < 60) {
          const r = el.getBoundingClientRect();
          out.push({ t, tag: el.tagName, href: href.slice(0, 120), x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2), w: Math.round(r.width) });
        }
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return out;
  });
  console.log(JSON.stringify(hits, null, 1));
  // Prefer nav links at top (y < 250)
  const c = hits.find(h => h.y < 250) || hits[0];
  if (c) {
    console.log('CLICK', c);
    if (c.href && c.href.startsWith('/')) {
      await page.goto('https://partner.microsoft.com' + c.href, { waitUntil: 'domcontentloaded', timeout: 60000 });
    } else {
      await page.mouse.click(c.x, c.y);
    }
    await page.waitForTimeout(6000);
    console.log('URL', page.url());
    const t = await page.innerText('body').catch(() => '');
    console.log(t.slice(0, 4000));
    fs.writeFileSync(`${OUT}/as_opts_nav.txt`, t);
    await page.screenshot({ path: `${OUT}/as_opts_nav.png`, fullPage: true });
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
