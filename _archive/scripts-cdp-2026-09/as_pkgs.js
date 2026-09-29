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
  await page.waitForTimeout(6000);
  const t = await page.innerText('body').catch(() => '');
  fs.writeFileSync(`${OUT}/as_packages.txt`, t);
  console.log(t.slice(0, 3500));
  await page.screenshot({ path: `${OUT}/as_packages.png`, fullPage: true });

  // find delete/remove for 1.0.4.0
  const hits = await page.evaluate(() => {
    const out = [];
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('*')) {
        const t = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
        if (t && t.length < 80 && /1\.0\.4\.0|Eliminar|Quitar|Remove|delete/i.test(t) && el.children.length <= 3) {
          const r = el.getBoundingClientRect();
          if (r.width > 0) out.push({ t: t.slice(0, 70), tag: el.tagName, x: Math.round(r.x + r.width/2), y: Math.round(r.y + r.height/2) });
        }
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return out.slice(0, 30);
  });
  console.log('HITS', JSON.stringify(hits, null, 1));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
