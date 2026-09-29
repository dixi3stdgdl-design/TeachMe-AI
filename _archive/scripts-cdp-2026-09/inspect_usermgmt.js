const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('usermanagement')) || ctx.pages()[0];
  await page.bringToFront();
  await page.screenshot({ path: 'D:/ToolTip AI/scripts/cdp_status_now/usermgmt_btn.png', fullPage: true });
  const els = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, a, [role="button"]')).map(n => ({
      t: (n.innerText || n.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100),
      tag: n.tagName,
      id: n.id || '',
      href: n.href || ''
    })).filter(x => x.t);
  });
  fs.writeFileSync('D:/ToolTip AI/scripts/cdp_status_now/usermgmt_buttons.json', JSON.stringify(els, null, 2));
  console.log(JSON.stringify(els, null, 1).slice(0, 4000));
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
