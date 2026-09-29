const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('usermanagement')) || ctx.pages().find(p => p.url().includes('partner.microsoft.com'));
  await page.bringToFront();
  await page.waitForTimeout(3000);
  const text = await page.innerText('body').catch(() => '');
  fs.writeFileSync('D:/ToolTip AI/scripts/cdp_status_now/usermgmt_ready.txt', text);
  console.log('BODY', text.slice(0, 3500));
  const els = await page.evaluate(() => Array.from(document.querySelectorAll('button,a,[role=tab],[role=button]')).map(n => ({
    t: (n.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 120),
    tag: n.tagName,
    href: n.getAttribute('href') || ''
  })).filter(x => x.t && /azure|aplicaci|application|add|agregar|key|secret|tenant/i.test(x.t)));
  console.log('MATCH', JSON.stringify(els, null, 1).slice(0, 2500));
  await page.screenshot({ path: 'D:/ToolTip AI/scripts/cdp_status_now/usermgmt_ready.png', fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
