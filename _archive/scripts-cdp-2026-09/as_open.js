const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages()[0];
  await page.bringToFront();
  await page.goto('https://partner.microsoft.com/es-es/dashboard/products/9N3D02KXKD3D/overview', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // open submissions
  const links = await page.evaluate(() => {
    const out = [];
    const walk = (root, d = 0) => {
      if (d > 12 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('a')) {
        const href = el.getAttribute('href') || '';
        const t = (el.innerText || '').trim();
        if (/managelanguages|listings|store-listing|submissions/i.test(href + t)) out.push({ t: t.slice(0, 40), href: href.slice(0, 140) });
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return out;
  });
  console.log('LINKS', JSON.stringify(links, null, 1).slice(0, 1500));
  const t = await page.innerText('body').catch(() => '');
  console.log(t.split('\n').map(s => s.trim()).filter(l => /certific|borrador|env[ií]o|Submission|1\./i.test(l)).slice(0, 15).join('\n'));
  await page.screenshot({ path: `${OUT}/as_overview_now.png`, fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
