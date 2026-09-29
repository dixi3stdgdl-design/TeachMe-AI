const { chromium } = require('D:/pwcli/node_modules/playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const ctx = b.contexts()[0];
  const page = ctx.pages().find(p => p.url().includes('usermanagement')) || ctx.pages()[0];
  await page.bringToFront();
  await page.waitForTimeout(4000);
  const text = await page.innerText('body').catch(() => '');
  fs.writeFileSync('D:/ToolTip AI/scripts/cdp_status_now/um_authed.txt', text);
  console.log(text.slice(0, 5000));
  console.log('----CONTROLS----');
  const els = await page.evaluate(() => Array.from(document.querySelectorAll('button,a,[role=tab],he-butt a')).map(n => ({
    t: (n.innerText || n.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100),
    tag: n.tagName
  })).filter(x => x.t));
  console.log(JSON.stringify(els, null, 1).slice(0, 5000));
  await page.screenshot({ path: 'D:/ToolTip AI/scripts/cdp_status_now/um_authed.png', fullPage: true });
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
