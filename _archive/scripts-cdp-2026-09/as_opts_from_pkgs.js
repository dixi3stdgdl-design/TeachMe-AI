const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/submissions/1152921505701833004/packages', {
    waitUntil: 'domcontentloaded', timeout: 60000
  });
  await page.waitForTimeout(5000);
  console.log('URL', page.url());

  const nav = await page.evaluate(() => {
    const out = [];
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('*')) {
        const t = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
        if (t === 'Opciones de envío') {
          const r = el.getBoundingClientRect();
          out.push({ tag: el.tagName, x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) });
        }
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return out;
  });
  console.log('NAV', JSON.stringify(nav));
  const c = nav.sort((a, b) => a.y - b.y)[0];
  if (c) {
    await page.mouse.click(c.x, c.y);
    await page.waitForTimeout(5000);
    console.log('AFTER URL', page.url());
    const t = await page.innerText('body').catch(() => '');
    fs.writeFileSync(`${OUT}/as_opts_from_pkgs.txt`, t);
    console.log(t.slice(0, 4500));
    await page.screenshot({ path: `${OUT}/as_opts_from_pkgs.png`, fullPage: true });
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
