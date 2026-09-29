const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('usermanagement')) || ctx.pages().find(p => p.url().includes('partner.microsoft.com'));
  console.log('URL', page.url());
  await page.bringToFront();
  // no goto - read current page only
  await page.waitForTimeout(2000);
  const t = await page.innerText('body').catch(() => '');
  fs.writeFileSync(`${OUT}/um_live.txt`, t);
  console.log(t.slice(0, 3000));
  const els = await page.evaluate(() => {
    const out = [];
    const walk = (root, d = 0) => {
      if (d > 15 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('a, button, he-button, [role=tab], [role=button], input')) {
        const txt = (el.innerText || el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ');
        const href = el.getAttribute('href') || '';
        if ((txt && txt.length < 90) || href) out.push({ t: txt.slice(0, 80), tag: el.tagName, href: href.slice(0, 100) });
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return out;
  });
  const interesting = els.filter(e => /azure|aplicaci|application|add|agregar|crear|create|user|usuario|invite|key|secret|tenant|manager|developer|tab/i.test(e.t + ' ' + e.href));
  console.log('CTRLS', JSON.stringify(interesting, null, 1).slice(0, 4000));
  await page.screenshot({ path: `${OUT}/um_live.png`, fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
