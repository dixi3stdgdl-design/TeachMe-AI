const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('9NQN3RZ2Z655')) || ctx.pages()[0];
  await page.bringToFront();

  // Find Descripciones de Store / listings link
  const links = await page.evaluate(() => {
    const out = [];
    const walk = (root, d = 0) => {
      if (d > 12 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('a, he-button, button, [role=link]')) {
        const t = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
        const href = el.getAttribute('href') || '';
        if (/Descripciones de Store|Store listings|listado/i.test(t + ' ' + href)) {
          out.push({ t: t.slice(0, 80), href: href.slice(0, 150), tag: el.tagName });
        }
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return out;
  });
  console.log('LINKS', JSON.stringify(links, null, 1));

  // Navigate to listings if found
  const hit = links.find(l => /Descripciones de Store|Store listings/i.test(l.t + l.href));
  if (hit && hit.href) {
    await page.goto(new URL(hit.href, page.url()).href, { waitUntil: 'domcontentloaded', timeout: 60000 });
  } else {
    await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9NQN3RZ2Z655/store-listing', { waitUntil: 'domcontentloaded', timeout: 60000 });
  }
  await page.waitForTimeout(6000);
  console.log('NOW', page.url());
  const t = await page.innerText('body').catch(() => '');
  fs.writeFileSync(`${OUT}/tr_listings.txt`, t);
  console.log(t.slice(0, 3000));
  await page.screenshot({ path: `${OUT}/tr_listings.png`, fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
