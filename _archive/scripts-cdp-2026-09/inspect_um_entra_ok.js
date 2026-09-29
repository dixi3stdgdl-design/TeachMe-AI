const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
const OUT = 'D:/ToolTip AI/scripts/cdp_status_now';
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('usermanagement')) || ctx.pages().find(p => p.url().includes('partner.microsoft.com'));
  await page.bringToFront();
  await page.waitForTimeout(4000);
  const t = await page.innerText('body').catch(() => '');
  fs.writeFileSync(`${OUT}/um_after_entra.txt`, t);
  console.log('BODY', t.slice(0, 2500));
  console.log('----BTNS----');
  const els = await page.evaluate(() => {
    const out = [];
    const walk = (root, d = 0) => {
      if (d > 12 || !root.querySelectorAll) return;
      for (const el of root.querySelectorAll('a, button, he-button, [role=tab], [role=button]')) {
        const txt = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ');
        if (txt && txt.length < 80) out.push({ t: txt, tag: el.tagName, href: el.getAttribute('href') || '' });
        if (el.shadowRoot) walk(el.shadowRoot, d + 1);
      }
    };
    walk(document);
    return out;
  });
  console.log(JSON.stringify(els.filter(e => /azure|aplicaci|application|add|agregar|user|usuario|tenant|key|secret|invite/i.test(e.t + e.href)), null, 1).slice(0, 3500));
  await page.screenshot({ path: `${OUT}/um_after_entra.png`, fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
