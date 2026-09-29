const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/submissions/1152921505701891994/managelanguages?producttype=app', {
    waitUntil: 'domcontentloaded', timeout: 60000
  });
  await page.waitForTimeout(5000);

  // Click Español (the Complete one) to enter listing
  const hits = await page.evaluate(() => {
    const out = [];
    const walk = (root, d = 0) => {
      if (d > 12 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('a, button, he-button, [role=button], [role=tab], li, tr')) {
        const t = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
        if (t && t.length < 50 && /^(Español|Descripciones de Store|Español \(América)/.test(t)) {
          const r = el.getBoundingClientRect();
          out.push({ t, tag: el.tagName, href: el.getAttribute('href') || '', x: r.x + r.width/2, y: r.y + r.height/2, w: r.width, h: r.height });
        }
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return out;
  });
  console.log(JSON.stringify(hits, null, 1));

  const esp = hits.find(h => h.t === 'Español' && h.w > 40 && h.h > 10 && h.h < 80);
  if (esp) {
    console.log('CLICK ESP', esp);
    await page.mouse.click(esp.x, esp.y);
    await page.waitForTimeout(6000);
    console.log('URL', page.url());
    const t = await page.innerText('body').catch(() => '');
    fs.writeFileSync(`${OUT}/tr_es_listing.txt`, t);
    console.log(t.slice(0, 3500));
    await page.screenshot({ path: `${OUT}/tr_es_listing.png`, fullPage: true });
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
